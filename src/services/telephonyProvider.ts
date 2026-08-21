import {
  TelephonyProviderType,
  SoftphoneState,
  WebRtcStats,
  CallDirection,
  TelephonyConfig,
  TelephonySession
} from '../types';

/**
 * Standard Telephony DTMF Frequencies (Hz)
 */
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  'A': [697, 1633],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  'B': [770, 1633],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  'C': [852, 1633],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
  'D': [941, 1633]
};

export const DEFAULT_TELEPHONY_CONFIG: TelephonyConfig = {
  defaultProvider: 'webrtc',
  primaryTrunk: 'Global Carrier Trunk (AWS Mumbai ap-south-1 / SIP Trunk-01)',
  callerId: '+91 22 6900 1200',
  sttVendor: 'deepgram',
  dualChannelAudio: true,
  autoConsentDisclaimer: true,
  jurisdiction: 'IN-TRAI',
  s3RecordingBucket: 's3://salescall-recordings-prod',
  dtmfToneAudio: true,
  holdMusicAudio: true,
  micNoiseSuppression: true,
  echoCancellation: true
};

/**
 * Web Audio Synthesizer for DTMF, Hold Chords, and Telephony Ringtones
 */
class TelephonyAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private holdOscillators: OscillatorNode[] = [];
  private holdGain: GainNode | null = null;
  private isHolding = false;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays realistic dual-tone multi-frequency (DTMF) dialpad beep
   */
  public playDtmfTone(digit: string, durationMs = 160) {
    try {
      const freqs = DTMF_FREQS[digit.toUpperCase()];
      if (!freqs) return;

      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationMs / 1000);
      osc2.stop(now + durationMs / 1000);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  /**
   * Plays subtle incoming telephone ring pulse
   */
  public playRingPulse() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 440; // US standard 440 + 480 Hz
      osc2.frequency.value = 480;

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch {
      // Ignore audio restriction
    }
  }

  /**
   * Starts gentle ambient hold synthesizer music
   */
  public startHoldMusic() {
    if (this.isHolding) return;
    try {
      const ctx = this.getContext();
      this.isHolding = true;
      this.holdGain = ctx.createGain();
      this.holdGain.gain.setValueAtTime(0.03, ctx.currentTime);
      this.holdGain.connect(ctx.destination);

      const notes = [261.63, 329.63, 392.00, 523.25]; // C major gentle chord
      this.holdOscillators = notes.map((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(this.holdGain!);
        osc.start();
        return osc;
      });
    } catch {
      // fallback
    }
  }

  /**
   * Stops hold music
   */
  public stopHoldMusic() {
    if (!this.isHolding) return;
    try {
      this.holdOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.holdOscillators = [];
      if (this.holdGain) {
        this.holdGain.disconnect();
        this.holdGain = null;
      }
      this.isHolding = false;
    } catch {
      // ignore
    }
  }
}

export const audioSynth = new TelephonyAudioSynthesizer();

/**
 * Format phone number into clean E.164 or formatted display standard
 */
export function formatE164(phone: string): string {
  const digitsOnly = phone.replace(/[^0-9+]/g, '');
  if (digitsOnly.startsWith('+')) return digitsOnly;
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) return `+91${digitsOnly.substring(1)}`;
  return `+${digitsOnly}`;
}

export function displayPhoneNumber(phone: string): string {
  const e164 = formatE164(phone);
  if (e164.startsWith('+91') && e164.length === 13) {
    return `+91 ${e164.substring(3, 8)} ${e164.substring(8)}`;
  }
  if (e164.startsWith('+1') && e164.length === 12) {
    return `+1 (${e164.substring(2, 5)}) ${e164.substring(5, 8)}-${e164.substring(8)}`;
  }
  return e164;
}

/**
 * Telephony Provider Interface
 */
export interface ITelephonyProvider {
  providerType: TelephonyProviderType;
  initialize(token?: string): Promise<boolean>;
  dial(destination: string, callerId: string): Promise<string>;
  answer(sessionSid: string): Promise<boolean>;
  hangup(sessionSid: string): Promise<boolean>;
  mute(isMuted: boolean): void;
  hold(isHold: boolean): void;
  sendDtmf(digit: string): void;
  getWebRtcStats(): WebRtcStats;
}

/**
 * High-Performance WebRTC Softphone Gateway Implementation
 */
export class WebRtcSoftphoneGateway implements ITelephonyProvider {
  public providerType: TelephonyProviderType = 'webrtc';
  private currentSessionSid: string | null = null;
  private isMuted = false;
  private isOnHold = false;
  private simulatedPacketLoss = 0.2;
  private simulatedJitter = 14;
  private simulatedRtt = 42;

  public async initialize(_token?: string): Promise<boolean> {
    return true;
  }

  public async dial(destination: string, _callerId: string): Promise<string> {
    this.currentSessionSid = `CA${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return this.currentSessionSid;
  }

  public async answer(_sessionSid: string): Promise<boolean> {
    return true;
  }

  public async hangup(_sessionSid: string): Promise<boolean> {
    if (this.isOnHold) {
      audioSynth.stopHoldMusic();
      this.isOnHold = false;
    }
    this.currentSessionSid = null;
    return true;
  }

  public mute(muted: boolean): void {
    this.isMuted = muted;
  }

  public hold(holdState: boolean): void {
    this.isOnHold = holdState;
    if (holdState) {
      audioSynth.startHoldMusic();
    } else {
      audioSynth.stopHoldMusic();
    }
  }

  public sendDtmf(digit: string): void {
    audioSynth.playDtmfTone(digit);
  }

  public getWebRtcStats(): WebRtcStats {
    // Dynamic micro-jitter fluctuation for realistic telemetry
    const jitterFluctuation = (Math.random() - 0.5) * 4;
    const rttFluctuation = (Math.random() - 0.5) * 8;
    const packetLossFluctuation = (Math.random() - 0.5) * 0.1;

    this.simulatedJitter = Math.max(8, Math.min(32, this.simulatedJitter + jitterFluctuation));
    this.simulatedRtt = Math.max(28, Math.min(85, this.simulatedRtt + rttFluctuation));
    this.simulatedPacketLoss = Math.max(0, Math.min(1.5, this.simulatedPacketLoss + packetLossFluctuation));

    return {
      packetLoss: parseFloat(this.simulatedPacketLoss.toFixed(2)),
      jitterMs: Math.round(this.simulatedJitter),
      rttMs: Math.round(this.simulatedRtt),
      audioBitrateKbps: 64, // Opus stereo
      codec: 'Opus 48kHz / Fullband',
      iceState: 'completed',
      audioLevelDb: this.isMuted ? -96 : -24 + (Math.random() * 8)
    };
  }
}

/**
 * Telephony Session Factory & S3 Cloud Storage Metadata
 */
export class TelephonySessionManager {
  public static createSession(
    direction: CallDirection,
    destinationNumber: string,
    callerId: string,
    provider: TelephonyProviderType = 'webrtc',
    sttVendor: TelephonyConfig['sttVendor'] = 'deepgram',
    jurisdiction: TelephonyConfig['jurisdiction'] = 'IN-TRAI'
  ): TelephonySession {
    const sessionSid = `TS_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const callDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const s3Key = `recordings/${callDate}/${sessionSid}_dual_channel.wav`;

    return {
      sessionSid,
      direction,
      provider,
      callerId,
      destinationNumber: formatE164(destinationNumber),
      trunkName: 'Carrier SIP-Trunk-Mumbai-AWS',
      recordingEnabled: true,
      recordingUrl: `https://storage.googleapis.com/salescall-recordings-bucket/${s3Key}`,
      s3Bucket: 's3://salescall-recordings-prod',
      s3Key,
      audioChannels: 2, // Dual-channel audio
      sttVendor,
      consentStatus: 'obtained',
      complianceJurisdiction: jurisdiction,
      webrtcStats: {
        packetLoss: 0.1,
        jitterMs: 12,
        rttMs: 38,
        audioBitrateKbps: 64,
        codec: 'Opus 48kHz Stereo',
        iceState: 'completed',
        audioLevelDb: -22
      },
      transfers: [],
      conferenceParticipants: [],
      dtmfLogs: []
    };
  }
}
