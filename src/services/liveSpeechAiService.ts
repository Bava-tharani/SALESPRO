import {
  TranscriptSegment,
  LiveObjection,
  SentimentPoint,
  LiveCoachingAlert,
  RealTimeInsights,
  ObjectionCategory,
  BattleCard,
  Lead
} from '../types';

/**
 * Pre-defined Tactical Mid-Call Objection Battlecards
 */
export const OBJECTION_BATTLECARDS: Record<ObjectionCategory, BattleCard> = {
  pricing: {
    title: 'Budget & Pricing Friction',
    prompt: 'Customer expresses hesitation regarding upfront cost or subscription tier.',
    talkingPoints: [
      'Highlight 3.4x average ROI within 90 days via automated rep call productivity.',
      'Offer flexible quarterly billing or staggered agent onboarding ramp.',
      'Explain that dual-channel telephony + built-in AI replaces 3 separate software subscriptions (ZoomPhone + Gong + HubSpot add-on).'
    ],
    suggestedQuestions: [
      '“What is the typical cost per lost lead or delayed follow-up in your current setup?”',
      '“If we could structure this with quarterly milestones, would that align with your Q3 budget approvals?”'
    ],
    recommendedOffer: '15% pilot ramp-up discount on first 25 seats with annual SLA lock.'
  },
  competitor: {
    title: 'Incumbent Competitor Battlecard',
    prompt: 'Customer mentions existing contract or comparison with Exotel, Twilio Flex, HubSpot, or Knowlarity.',
    talkingPoints: [
      'Zero-latency native WebRTC audio with Indian DoT / TRAI compliant carrier trunks.',
      'Built-in real-time AI live coaching with instant mid-call objection detection (competitors only do post-call analysis hours later).',
      'Unified single dashboard: Click-to-dial, automatic transcript sync, and manager live whisper in one place.'
    ],
    suggestedQuestions: [
      '“How much time do your managers currently spend manually reviewing 30-minute call recordings?”',
      '“Would you be open to running a side-by-side 14-day trial with 5 agents to benchmark connection quality?”'
    ],
    recommendedOffer: 'Free contract buyout credit or seamless data migration guarantee.'
  },
  timing: {
    title: 'Timing & Bandwidth Hesitation',
    prompt: 'Customer mentions “too busy right now”, “call next quarter”, or “in transit”.',
    talkingPoints: [
      'Turnkey deployment: Zero hardware setup, live within 15 minutes via browser softphone.',
      'Automated onboarding concierge manages team migration without engineering bandwidth.',
      'Lock in current discounted tariff before upcoming fiscal pricing revision.'
    ],
    suggestedQuestions: [
      '“If we handle 100% of the CSV contact upload and team setup, would a 15-min pilot review work on Friday?”',
      '“What major milestone is your sales team prioritizing before Q4?”'
    ],
    recommendedOffer: 'Pre-configured sandbox environment with 100 test call credits.'
  },
  trust: {
    title: 'Security, SLA & Compliance Inquiry',
    prompt: 'Customer asks about data residency, call recording consent, ISO 27001, or uptime guarantees.',
    talkingPoints: [
      'Enterprise-grade SOC-2 Type II certified and ISO 27001 compliant architecture.',
      'End-to-end SRTP / TLS audio encryption with Indian local cloud data residency.',
      'Configurable automated compliance voice disclaimers adhering to global and local telecom laws.'
    ],
    suggestedQuestions: [
      '“Would it be helpful if I shared our compliance whitepaper and SOC-2 audit certification summary directly with your InfoSec lead?”'
    ],
    recommendedOffer: 'Dedicated signed Business Associate Agreement (BAA) / SLA 99.95% guarantee.'
  },
  authority: {
    title: 'Decision Maker & Approval Flow',
    prompt: 'Contact states they need to check with Managing Director, CFO, or Tech Head.',
    talkingPoints: [
      'Provide an executive 1-page business case deck with calculated cost savings.',
      'Offer a 20-minute executive briefing tailored specifically for their CFO/CTO.'
    ],
    suggestedQuestions: [
      '“What key metric will your CFO look at when approving this proposal?”',
      '“Would you like me to join a quick 15-minute briefing to walk them through the technical ROI?”'
    ],
    recommendedOffer: 'Customized Board Approval slide deck with personalized branding.'
  },
  feature: {
    title: 'Custom Feature or Integration Requirement',
    prompt: 'Prospect inquires about specific CRM webhooks, IVR customization, or multi-language templates.',
    talkingPoints: [
      'REST API & Webhook suite supports real-time sync with Salesforce, Zoho, HubSpot, and custom internal ERPs.',
      'Dynamic multi-language speech recognition engine (English, Hindi, regional dialects).'
    ],
    suggestedQuestions: [
      '“Which specific endpoints or fields in your ERP need bidirectional synchronization?”'
    ],
    recommendedOffer: 'Complimentary webhook integration support by our senior solution architect.'
  }
};

/**
 * Realistic Scenario Utterance Sequences for Dynamic Live Calling Simulation
 */
export const SIMULATED_CALL_SCRIPTS: Record<
  string,
  { speaker: 'rep' | 'prospect'; text: string; delayMs: number; sentiment: 'Positive' | 'Neutral' | 'Negative' }[]
> = {
  enterprise_demo: [
    {
      speaker: 'rep',
      text: 'Hello, am I speaking with the sales operations head? This is SalesCall Pro regarding your enterprise telephony inquiry.',
      delayMs: 2500,
      sentiment: 'Neutral'
    },
    {
      speaker: 'prospect',
      text: 'Yes, hello! We are looking to upgrade our sales team of 40 agents. Our current setup drops calls and has zero CRM sync.',
      delayMs: 6000,
      sentiment: 'Positive'
    },
    {
      speaker: 'rep',
      text: 'That is exactly where we specialize. Our WebRTC browser softphone connects directly with zero latency and automatically synchronizes all transcripts and AI summaries.',
      delayMs: 6500,
      sentiment: 'Positive'
    },
    {
      speaker: 'prospect',
      text: 'That sounds impressive, but what about the price? Some other vendors quoted an expensive setup fee.',
      delayMs: 6000,
      sentiment: 'Neutral'
    },
    {
      speaker: 'rep',
      text: 'We have zero upfront setup fees and include automated dual-channel recording and AI scoring out of the box.',
      delayMs: 6000,
      sentiment: 'Positive'
    },
    {
      speaker: 'prospect',
      text: 'We are currently evaluating Exotel and Twilio. How does your voice clarity compare to them?',
      delayMs: 6500,
      sentiment: 'Neutral'
    },
    {
      speaker: 'rep',
      text: 'We route via high-throughput direct SIP carrier trunks with Opus 48kHz stereo codec, giving you crystal clear studio sound and live mid-call AI coaching.',
      delayMs: 7000,
      sentiment: 'Positive'
    },
    {
      speaker: 'prospect',
      text: 'Excellent. Also, we must ensure our customer call recordings comply with TRAI telecom regulations and data privacy.',
      delayMs: 6500,
      sentiment: 'Positive'
    },
    {
      speaker: 'rep',
      text: 'Absolutely. We support automated two-party consent announcements and AES-256 cloud object storage in Mumbai.',
      delayMs: 6000,
      sentiment: 'Positive'
    },
    {
      speaker: 'prospect',
      text: 'Great! Please send over the tailored proposal and let us schedule a live walkthrough for our team this Friday.',
      delayMs: 6500,
      sentiment: 'Positive'
    }
  ],
  pricing_objection: [
    {
      speaker: 'rep',
      text: 'Good afternoon! Following up on your pricing request for our cloud sales calling suite.',
      delayMs: 2500,
      sentiment: 'Neutral'
    },
    {
      speaker: 'prospect',
      text: 'Hi. We reviewed the numbers, but honestly the tier is a bit higher than our Q3 budget allocation.',
      delayMs: 5500,
      sentiment: 'Negative'
    },
    {
      speaker: 'rep',
      text: 'I understand budget discipline is critical. When you factor in that SalesCall Pro replaces your existing separate softphone, recording storage, and transcription tools, most clients save 35%.',
      delayMs: 6500,
      sentiment: 'Positive'
    },
    {
      speaker: 'prospect',
      text: 'Can you offer a quarterly payment plan instead of requiring a 100% upfront annual lock?',
      delayMs: 6000,
      sentiment: 'Neutral'
    },
    {
      speaker: 'rep',
      text: 'Yes! We can structure this with flexible quarterly milestones and guarantee your discounted rate.',
      delayMs: 5500,
      sentiment: 'Positive'
    },
    {
      speaker: 'prospect',
      text: 'That works much better for our finance approval. Let us move forward with the quarterly agreement.',
      delayMs: 6000,
      sentiment: 'Positive'
    }
  ]
};

/**
 * Mid-Call Real-Time Intelligence Engine
 */
export class LiveSpeechAiEngine {
  /**
   * Analyzes live utterance to detect customer objections in real time
   */
  public static detectObjection(text: string, offsetSeconds: number): LiveObjection | null {
    const t = text.toLowerCase();

    let category: ObjectionCategory | null = null;
    let severity: LiveObjection['severity'] = 'medium';

    if (t.includes('price') || t.includes('cost') || t.includes('expensive') || t.includes('budget') || t.includes('discount') || t.includes('too high')) {
      category = 'pricing';
      severity = t.includes('too expensive') || t.includes('no budget') ? 'high' : 'medium';
    } else if (t.includes('competitor') || t.includes('exotel') || t.includes('twilio') || t.includes('hubspot') || t.includes('already using') || t.includes('other vendor')) {
      category = 'competitor';
      severity = 'high';
    } else if (t.includes('busy') || t.includes('not now') || t.includes('next quarter') || t.includes('bad time') || t.includes('in transit') || t.includes('call back')) {
      category = 'timing';
      severity = 'medium';
    } else if (t.includes('security') || t.includes('compliance') || t.includes('trai') || t.includes('gdpr') || t.includes('privacy') || t.includes('iso') || t.includes('soc-2')) {
      category = 'trust';
      severity = 'medium';
    } else if (t.includes('boss') || t.includes('director') || t.includes('cfo') || t.includes('management') || t.includes('approval')) {
      category = 'authority';
      severity = 'low';
    } else if (t.includes('custom feature') || t.includes('api') || t.includes('webhook') || t.includes('integration') || t.includes('language')) {
      category = 'feature';
      severity = 'low';
    }

    if (!category) return null;

    return {
      id: `OBJ-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      offsetSeconds,
      objectionType: category,
      matchedText: text,
      severity,
      battleCard: OBJECTION_BATTLECARDS[category],
      isAddressed: false
    };
  }

  /**
   * Computes sentiment drift and current score (-100 to +100)
   */
  public static computeSentimentDrift(
    segments: TranscriptSegment[],
    newSegmentText: string,
    speaker: 'rep' | 'prospect'
  ): { sentimentScore: number; sentimentLabel: 'Positive' | 'Neutral' | 'Negative' } {
    const textLower = newSegmentText.toLowerCase();

    let delta = 0;
    if (textLower.includes('great') || textLower.includes('excellent') || textLower.includes('love') || textLower.includes('impressive') || textLower.includes('perfect') || textLower.includes('interested') || textLower.includes('sounds good')) {
      delta = speaker === 'prospect' ? 25 : 10;
    } else if (textLower.includes('expensive') || textLower.includes('not interested') || textLower.includes('issue') || textLower.includes('problem') || textLower.includes('drop') || textLower.includes('bad')) {
      delta = speaker === 'prospect' ? -30 : -5;
    } else if (textLower.includes('yes') || textLower.includes('sure') || textLower.includes('okay') || textLower.includes('send') || textLower.includes('schedule')) {
      delta = 12;
    }

    // Accumulate existing sentiment
    let baseScore = 20; // Starts mildly positive
    segments.forEach((s) => {
      if (s.sentiment === 'Positive') baseScore += 8;
      if (s.sentiment === 'Negative') baseScore -= 12;
    });

    const finalScore = Math.max(-100, Math.min(100, baseScore + delta));
    const sentimentLabel = finalScore >= 20 ? 'Positive' : finalScore <= -20 ? 'Negative' : 'Neutral';

    return { sentimentScore: finalScore, sentimentLabel };
  }

  /**
   * Extracts live discussion topics in real time
   */
  public static extractLiveTopics(allText: string): string[] {
    const t = allText.toLowerCase();
    const topics: string[] = [];

    if (t.includes('price') || t.includes('cost') || t.includes('budget') || t.includes('discount')) topics.push('Pricing & Commercials');
    if (t.includes('demo') || t.includes('walkthrough') || t.includes('presentation')) topics.push('Live Product Demo');
    if (t.includes('telephony') || t.includes('webrtc') || t.includes('sip') || t.includes('audio')) topics.push('Carrier Voice Quality');
    if (t.includes('security') || t.includes('trai') || t.includes('gdpr') || t.includes('compliance') || t.includes('recording')) topics.push('Compliance & Consent');
    if (t.includes('api') || t.includes('webhook') || t.includes('crm') || t.includes('hubspot')) topics.push('CRM & API Integration');
    if (t.includes('sla') || t.includes('support') || t.includes('onboarding') || t.includes('training')) topics.push('SLA & Enterprise Onboarding');
    if (t.includes('agent') || t.includes('seats') || t.includes('team')) topics.push('Seat Volume Scaling');

    if (topics.length === 0) topics.push('Discovery & Qualification');
    return Array.from(new Set(topics));
  }

  /**
   * Calculates Rep vs Prospect Talk Ratios & Pacing metrics
   */
  public static calculateTalkRatios(segments: TranscriptSegment[]): {
    repTalkPercentage: number;
    prospectTalkPercentage: number;
    speakingPaceWpm: number;
    alerts: LiveCoachingAlert[];
  } {
    let repWords = 0;
    let prospectWords = 0;
    let totalSeconds = 1;

    segments.forEach((s) => {
      const words = s.text.trim().split(/\s+/).filter(Boolean).length;
      if (s.speaker === 'rep') repWords += words;
      else if (s.speaker === 'prospect') prospectWords += words;
      totalSeconds = Math.max(totalSeconds, s.offsetSeconds);
    });

    const totalWords = repWords + prospectWords || 1;
    const repPct = Math.round((repWords / totalWords) * 100);
    const prospectPct = 100 - repPct;

    const wpm = Math.round((repWords / (totalSeconds / 60)) || 135);

    const alerts: LiveCoachingAlert[] = [];
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (repPct > 70 && segments.length > 3) {
      alerts.push({
        id: `alert-talk-${Date.now()}`,
        message: 'Rep Talk Ratio high (over 70%). Pause and ask an open-ended qualification question.',
        type: 'talk_ratio',
        timestamp: now
      });
    }

    if (wpm > 175) {
      alerts.push({
        id: `alert-pace-${Date.now()}`,
        message: 'Pacing fast (~180 WPM). Slow down slightly to improve prospect retention.',
        type: 'pacing',
        timestamp: now
      });
    }

    if (prospectPct > 55) {
      alerts.push({
        id: `alert-listen-${Date.now()}`,
        message: 'Optimal listening ratio maintained! Prospect is actively describing business requirements.',
        type: 'positive_cue',
        timestamp: now
      });
    }

    return {
      repTalkPercentage: repPct || 50,
      prospectTalkPercentage: prospectPct || 50,
      speakingPaceWpm: Math.min(220, Math.max(90, wpm)),
      alerts
    };
  }
}
