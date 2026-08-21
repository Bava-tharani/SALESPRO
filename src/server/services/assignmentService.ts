import { BackendDatabase } from '../db';
import { PerformanceService } from './performanceService';
import { Lead } from '../../types';

export interface SalespersonRecommendation {
  userId: string;
  userName: string;
  email: string;
  phone?: string;
  status: 'ONLINE' | 'ON_CALL' | 'OFFLINE';
  score: number; // 0 - 100
  scoreBreakdown: {
    successRateScore: number; // /30
    conversionRateScore: number; // /25
    similarLeadScore: number; // /20
    workloadScore: number; // /15
    availabilityScore: number; // /10
  };
  metrics: {
    successRate: number; // %
    conversionRate: number; // %
    activeWorkload: number;
    similarLeadConversions: number;
  };
  recommendationReason: string;
}

export class AssignmentService {
  /**
   * Evaluates all sales representatives and provides weighted AI recommendations
   * for assigning an important or HOT lead.
   */
  public static getRecommendationsForLead(leadId: string): {
    lead: Lead | undefined;
    recommendations: SalespersonRecommendation[];
  } {
    const lead = BackendDatabase.leads.find((l) => l.id === leadId);
    const salespeople = BackendDatabase.users.filter((u) => u.role === 'salesperson');

    const recommendations: SalespersonRecommendation[] = salespeople.map((rep) => {
      const metrics = PerformanceService.calculateRepMetrics(rep.id, '30days');
      const liveState = BackendDatabase.liveStatus[rep.id] || {
        status: 'ONLINE',
        lastActivityAt: new Date().toISOString()
      };

      // 1. Success Rate Component (30% max)
      const successRateScore = Math.round((metrics.successRate / 100) * 30);

      // 2. Conversion Rate Component (25% max)
      const conversionRateScore = Math.min(25, Math.round((metrics.conversionRate / 25) * 25));

      // 3. Similar Lead Experience Component (20% max)
      // Checks how well the rep converted leads from the same source or industry
      const repLeads = BackendDatabase.leads.filter((l) => l.assignedTo === rep.id);
      const similarSourceLeads = repLeads.filter(
        (l) => lead && l.source === lead.source
      );
      const similarConversions = similarSourceLeads.filter((l) => l.status === 'Converted').length;
      const similarLeadScore =
        similarSourceLeads.length > 0
          ? Math.min(20, Math.round((similarConversions / similarSourceLeads.length) * 20) + 8)
          : 12;

      // 4. Current Workload Component (15% max, lower active backlog is better)
      const activeWorkload = repLeads.filter(
        (l) => l.status !== 'Converted' && l.status !== 'Lost'
      ).length;
      let workloadScore = 15;
      if (activeWorkload > 18) workloadScore = 6;
      else if (activeWorkload > 12) workloadScore = 10;
      else if (activeWorkload > 8) workloadScore = 13;
      else workloadScore = 15;

      // 5. Availability Status (10% max)
      let availabilityScore = 10;
      if (liveState.status === 'ONLINE') availabilityScore = 10;
      else if (liveState.status === 'ON_CALL') availabilityScore = 7;
      else availabilityScore = 3;

      const totalScore = Math.min(
        99,
        Math.max(
          40,
          successRateScore +
            conversionRateScore +
            similarLeadScore +
            workloadScore +
            availabilityScore
        )
      );

      let reason = `Recommended because of high ${metrics.successRate}% call success rate and strong track record with ${lead?.source || 'inbound'} prospects.`;
      if (liveState.status === 'ONLINE' && activeWorkload < 10) {
        reason = `Top pick: Online and available with optimal bandwidth (${activeWorkload} active leads) and ${metrics.successRate}% connection success rate.`;
      } else if (metrics.conversionRate > 20) {
        reason = `Elite closer: High conversion rate of ${metrics.conversionRate}% with balanced pipeline capacity.`;
      }

      return {
        userId: rep.id,
        userName: rep.name,
        email: rep.email,
        phone: rep.phone,
        status: liveState.status,
        score: totalScore,
        scoreBreakdown: {
          successRateScore,
          conversionRateScore,
          similarLeadScore,
          workloadScore,
          availabilityScore
        },
        metrics: {
          successRate: metrics.successRate,
          conversionRate: metrics.conversionRate,
          activeWorkload,
          similarLeadConversions: similarConversions
        },
        recommendationReason: reason
      };
    });

    // Sort descending by score
    recommendations.sort((a, b) => b.score - a.score);

    return {
      lead,
      recommendations
    };
  }
}
