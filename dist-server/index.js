// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// src/server/routes/apiRouter.ts
import { Router } from "express";

// src/services/aiService.ts
var LocalAIService = class {
  /**
   * Evaluates a lead based on demographic, behavioral, company, source,
   * priority, and historical interaction signals.
   */
  static scoreLead(lead) {
    let score = 50;
    const positiveFactors = [];
    const negativeFactors = [];
    if (lead.source === "Referral") {
      score += 24;
      positiveFactors.push({
        factor: "High-Trust Channel (Referral)",
        impact: "positive",
        scoreDelta: 24,
        detail: "Referral leads demonstrate 3.4x higher conversion baseline."
      });
    } else if (lead.source === "Website") {
      score += 15;
      positiveFactors.push({
        factor: "Direct Inbound Intent (Website)",
        impact: "positive",
        scoreDelta: 15,
        detail: "Directly submitted demo/pricing inquiry form."
      });
    } else if (lead.source === "Advertisement" || lead.source === "Facebook" || lead.source === "Instagram") {
      score += 8;
      positiveFactors.push({
        factor: "Campaign Touchpoint",
        impact: "positive",
        scoreDelta: 8,
        detail: "Responded to targeted digital growth campaign."
      });
    } else if (lead.source === "CSV Import") {
      score -= 5;
      negativeFactors.push({
        factor: "Outbound Cold Import",
        impact: "negative",
        scoreDelta: -5,
        detail: "Cold contact requires early value-prop verification."
      });
    }
    if (lead.priority === "High") {
      score += 18;
      positiveFactors.push({
        factor: "High Priority Classification",
        impact: "positive",
        scoreDelta: 18,
        detail: "Designated critical budget & rapid deployment timeline."
      });
    } else if (lead.priority === "Low") {
      score -= 10;
      negativeFactors.push({
        factor: "Low Priority Tier",
        impact: "negative",
        scoreDelta: -10,
        detail: "Long exploratory timeline or exploratory stage."
      });
    }
    if (lead.status === "Interested") {
      score += 20;
      positiveFactors.push({
        factor: "Verified Buyer Interest",
        impact: "positive",
        scoreDelta: 20,
        detail: "Prospect positively affirmed problem-solution fit."
      });
    } else if (lead.status === "Follow-up") {
      score += 12;
      positiveFactors.push({
        factor: "Active Follow-up Cadence",
        impact: "positive",
        scoreDelta: 12,
        detail: "Scheduled follow-up shows ongoing engagement."
      });
    } else if (lead.status === "Converted") {
      score = 98;
      positiveFactors.push({
        factor: "Customer Closed Won",
        impact: "positive",
        scoreDelta: 30,
        detail: "Deal successfully executed."
      });
    } else if (lead.status === "Not Interested" || lead.status === "Lost") {
      score = Math.min(score, 25);
      negativeFactors.push({
        factor: "Negative Status Outcome",
        impact: "negative",
        scoreDelta: -30,
        detail: "Customer disqualified or opted out."
      });
    }
    if (lead.email && lead.email.includes("@") && !lead.email.endsWith("test.com")) {
      score += 5;
      positiveFactors.push({
        factor: "Verified Corporate Domain",
        impact: "positive",
        scoreDelta: 5,
        detail: "Direct company email address detected."
      });
    }
    if (lead.company && lead.company.trim().length > 2) {
      score += 6;
      positiveFactors.push({
        factor: "Established Organization Profile",
        impact: "positive",
        scoreDelta: 6,
        detail: `Associated with registered company ${lead.company}.`
      });
    } else {
      score -= 8;
      negativeFactors.push({
        factor: "Missing Organization Data",
        impact: "negative",
        scoreDelta: -8,
        detail: "No corporate affiliation specified."
      });
    }
    const notesLower = (lead.notes || "").toLowerCase();
    if (notesLower.includes("budget approved") || notesLower.includes("ready to buy") || notesLower.includes("urgent") || notesLower.includes("decision maker")) {
      score += 15;
      positiveFactors.push({
        factor: "Urgent Buying Trigger in Notes",
        impact: "positive",
        scoreDelta: 15,
        detail: "Identified budget authority or immediate deployment mandate."
      });
    }
    if (notesLower.includes("no budget") || notesLower.includes("too expensive") || notesLower.includes("call back next year")) {
      score -= 15;
      negativeFactors.push({
        factor: "Budgetary / Timing Friction",
        impact: "negative",
        scoreDelta: -15,
        detail: "Notes reflect cost hesitation or distant purchase cycle."
      });
    }
    const finalScore = Math.max(12, Math.min(99, Math.round(score)));
    let buyingIntent = "Moderate";
    if (finalScore >= 80) buyingIntent = "Very High";
    else if (finalScore >= 65) buyingIntent = "High";
    else if (finalScore < 40) buyingIntent = "Low";
    const conversionProbability = Math.round(Math.min(95, Math.max(8, finalScore * 0.92)));
    const confidence = Math.round(82 + finalScore % 14);
    let recommendedAction = "Schedule introductory discovery call to qualify requirements.";
    if (finalScore >= 80) {
      recommendedAction = "Send customized commercial proposal & lock in contract review call.";
    } else if (finalScore >= 65) {
      recommendedAction = "Provide product walkthrough demo addressing specific business ROI.";
    } else if (finalScore < 40) {
      recommendedAction = "Enroll in automated educational email nurture campaign.";
    }
    const times = ["10:30 AM - 12:00 PM", "2:30 PM - 4:00 PM", "11:00 AM - 1:00 PM", "4:30 PM - 6:00 PM"];
    const bestTimeToCall = times[(lead.name?.length || 0) % times.length];
    const summary = finalScore >= 75 ? `High-velocity prospect showing strong commercial viability and active engagement signals. Recommend fast-track closing cadence.` : finalScore >= 50 ? `Promising opportunity with steady interest. Address specific product differentiation and pricing tier options on next contact.` : `Top-of-funnel or cautious prospect. Focus on building trust, demonstrating value metrics, and addressing core pain points.`;
    return {
      score: finalScore,
      confidence,
      conversionProbability,
      recommendedAction,
      bestTimeToCall,
      buyingIntent,
      positiveFactors,
      negativeFactors,
      summary
    };
  }
  /**
   * Generates instant AI Call Analysis breakdown based on duration, status, outcome, and notes.
   */
  static analyzeCall(status, outcome, durationSeconds, notes, leadName) {
    let sentiment = "Neutral";
    let interestScore = 5;
    let callQualityScore = 70;
    const keyTopics = [];
    const customerObjections = [];
    if (status === "Answered") {
      if (durationSeconds > 180) {
        callQualityScore += 18;
      } else if (durationSeconds > 60) {
        callQualityScore += 10;
      } else {
        callQualityScore -= 10;
      }
      if (outcome === "Interested" || outcome === "Converted") {
        sentiment = "Positive";
        interestScore = outcome === "Converted" ? 10 : 9;
        callQualityScore += 12;
        keyTopics.push("Product Demo & Features", "Pricing & Licensing", "Implementation Schedule");
      } else if (outcome === "Follow-up Required" || outcome === "Call Later") {
        sentiment = "Neutral";
        interestScore = 6;
        callQualityScore += 5;
        keyTopics.push("Timeline Alignment", "Internal Stakeholder Review", "Feature Validation");
      } else if (outcome === "Not Interested" || outcome === "Wrong Number") {
        sentiment = "Negative";
        interestScore = 2;
        callQualityScore = Math.max(35, callQualityScore - 20);
        customerObjections.push("No immediate organizational need", "Budget constraint or alternative provider chosen");
      }
    } else {
      sentiment = "Neutral";
      interestScore = 3;
      callQualityScore = 40;
      keyTopics.push("Unreachable / Voicemail");
    }
    const n = notes.toLowerCase();
    if (n.includes("price") || n.includes("cost") || n.includes("expensive") || n.includes("budget")) {
      customerObjections.push("Pricing sensitivity / Budget allocation");
      keyTopics.push("Cost Justification & ROI");
    }
    if (n.includes("competitor") || n.includes("already using") || n.includes("vendor")) {
      customerObjections.push("Incumbent competitor comparison");
      keyTopics.push("Competitive Battlecard & Differentiation");
    }
    if (n.includes("security") || n.includes("cloud") || n.includes("compliance")) {
      keyTopics.push("Enterprise Security & Compliance Architecture");
    }
    if (n.includes("demo") || n.includes("trial") || n.includes("presentation")) {
      keyTopics.push("Live Interactive Walkthrough");
    }
    if (keyTopics.length === 0) {
      keyTopics.push("Introductory Value Pitch", "Requirement Discovery");
    }
    callQualityScore = Math.min(98, Math.max(25, callQualityScore));
    let aiSummary = "";
    if (status !== "Answered") {
      aiSummary = `Call to ${leadName} resulted in "${status}". AI recommends triggering an automated WhatsApp/SMS prompt and retrying tomorrow morning.`;
    } else if (outcome === "Interested") {
      aiSummary = `Engaging conversation with ${leadName} (${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s). Prospect showed high engagement regarding platform capabilities and requested commercial details.`;
    } else if (outcome === "Converted") {
      aiSummary = `Successful closing call with ${leadName}! Payment/agreement agreed upon. Onboarding handover initiated.`;
    } else if (outcome === "Follow-up Required") {
      aiSummary = `Constructive touchpoint with ${leadName}. Prospect needs to align with internal decision makers. Scheduled follow-up recommended with updated case studies.`;
    } else if (outcome === "Not Interested") {
      aiSummary = `${leadName} indicated current solutions meet their needs or timing is mismatched. Logged objections for quarterly re-engagement.`;
    } else {
      aiSummary = `Call logged with outcome "${outcome}". Next touchpoint queued for optimal conversion timing.`;
    }
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + (outcome === "Interested" ? 1 : 3));
    const recDate = tomorrow.toISOString().split("T")[0];
    return {
      sentiment,
      interestScore,
      callQualityScore,
      keyTopics,
      customerObjections,
      aiSummary,
      smartFollowUpSuggestion: {
        recommendedDate: recDate,
        recommendedTime: "11:30 AM",
        agenda: outcome === "Interested" ? "Present tailored enterprise proposal & answer technical inquiries" : "Check in on stakeholder feedback and share ROI comparison sheet"
      }
    };
  }
};

// src/data/mockData.ts
var INITIAL_USERS = [
  {
    id: "usr-thara",
    name: "Thara Maps",
    email: "thara23maps@gmail.com",
    role: "manager",
    status: "active",
    phone: "+91 98200 99881",
    joinedDate: "2023-01-01"
  },
  {
    id: "mgr-1",
    name: "Aarav Singhania",
    email: "manager@example.com",
    role: "manager",
    status: "active",
    phone: "+91 98201 11223",
    joinedDate: "2023-01-15"
  },
  {
    id: "mgr-2",
    name: "Meera Deshmukh",
    email: "meera.manager@example.com",
    role: "manager",
    status: "active",
    phone: "+91 98202 22334",
    joinedDate: "2023-03-20"
  },
  {
    id: "sales-1",
    name: "Rajesh Nair",
    email: "salesperson@example.com",
    role: "salesperson",
    status: "active",
    phone: "+91 98450 33445",
    assignedLeadsCount: 12,
    callsTodayCount: 14,
    conversionsCount: 9,
    joinedDate: "2023-04-10"
  },
  {
    id: "sales-2",
    name: "Neha Kapoor",
    email: "neha.k@example.com",
    role: "salesperson",
    status: "active",
    phone: "+91 98111 44556",
    assignedLeadsCount: 15,
    callsTodayCount: 18,
    conversionsCount: 12,
    joinedDate: "2023-05-01"
  },
  {
    id: "sales-3",
    name: "Aditya Sen",
    email: "aditya.sen@example.com",
    role: "salesperson",
    status: "active",
    phone: "+91 98300 55667",
    assignedLeadsCount: 10,
    callsTodayCount: 11,
    conversionsCount: 7,
    joinedDate: "2023-06-15"
  },
  {
    id: "sales-4",
    name: "Pooja Hegde",
    email: "pooja.hegde@example.com",
    role: "salesperson",
    status: "active",
    phone: "+91 98860 66778",
    assignedLeadsCount: 14,
    callsTodayCount: 16,
    conversionsCount: 11,
    joinedDate: "2023-08-01"
  },
  {
    id: "sales-5",
    name: "Vikram Joshi",
    email: "vikram.j@example.com",
    role: "salesperson",
    status: "active",
    phone: "+91 98920 77889",
    assignedLeadsCount: 8,
    callsTodayCount: 7,
    conversionsCount: 5,
    joinedDate: "2023-09-10"
  }
];
var RAW_LEADS = [
  {
    id: "LEAD-1001",
    name: "Raj Kumar",
    phone: "+91 98230 45678",
    email: "raj.kumar@apextech.in",
    company: "Apex Technologies Pvt Ltd",
    source: "Website",
    priority: "High",
    status: "Interested",
    assignedTo: "sales-1",
    notes: "Looking for 50-agent enterprise telephony integration. Budget approved for Q3.",
    createdAt: "2026-08-10T10:30:00Z",
    updatedAt: "2026-08-20T14:15:00Z",
    lastContactedAt: "2026-08-20T14:15:00Z",
    nextFollowUpAt: "2026-08-21T11:00:00Z",
    city: "Bengaluru",
    estimatedDealValue: 45e4
  },
  {
    id: "LEAD-1002",
    name: "Priya Sharma",
    phone: "+91 98112 34567",
    email: "priya.sharma@zenithretail.com",
    company: "Zenith Retail Solutions",
    source: "Referral",
    priority: "High",
    status: "Follow-up",
    assignedTo: "sales-1",
    notes: "Referred by Sunil from Reliance. Highly interested in automated CRM syncing.",
    createdAt: "2026-08-12T09:15:00Z",
    updatedAt: "2026-08-19T16:45:00Z",
    lastContactedAt: "2026-08-19T16:45:00Z",
    nextFollowUpAt: "2026-08-21T14:30:00Z",
    city: "Mumbai",
    estimatedDealValue: 62e4
  },
  {
    id: "LEAD-1003",
    name: "Vikram Malhotra",
    phone: "+91 98765 43210",
    email: "vikram@malhotralogistics.com",
    company: "Malhotra Logistics & Cargo",
    source: "Facebook",
    priority: "Medium",
    status: "Contacted",
    assignedTo: "sales-1",
    notes: "Discussed fleet tracking and voice alerts. Requested customized pricing sheet.",
    createdAt: "2026-08-14T11:20:00Z",
    updatedAt: "2026-08-18T10:00:00Z",
    lastContactedAt: "2026-08-18T10:00:00Z",
    city: "Delhi NCR",
    estimatedDealValue: 28e4
  },
  {
    id: "LEAD-1004",
    name: "Ananya Iyer",
    phone: "+91 99401 23456",
    email: "ananya.iyer@chennaifin.org",
    company: "Chennai Capital & Finance",
    source: "Website",
    priority: "High",
    status: "Converted",
    assignedTo: "sales-1",
    notes: "Signed 1-year annual contract for 30 seats. Full payment processed via NEFT.",
    createdAt: "2026-08-01T08:45:00Z",
    updatedAt: "2026-08-17T15:30:00Z",
    lastContactedAt: "2026-08-17T15:30:00Z",
    city: "Chennai",
    estimatedDealValue: 85e4
  },
  {
    id: "LEAD-1005",
    name: "Rahul Verma",
    phone: "+91 98200 98765",
    email: "rahul.v@vermahealth.co.in",
    company: "Verma Healthcare & Diagnostics",
    source: "Instagram",
    priority: "Low",
    status: "New",
    assignedTo: "sales-1",
    notes: "Inquired about patient reminder automated calling service.",
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-08-20T08:00:00Z",
    city: "Pune",
    estimatedDealValue: 15e4
  },
  {
    id: "LEAD-1006",
    name: "Sunita Rao",
    phone: "+91 98490 87654",
    email: "sunita.rao@hyderabadtech.in",
    company: "Deccan Software Systems",
    source: "Advertisement",
    priority: "High",
    status: "Interested",
    assignedTo: "sales-2",
    notes: "Wants integration with existing HubSpot instance. CTO joined the discovery call.",
    createdAt: "2026-08-11T14:10:00Z",
    updatedAt: "2026-08-20T11:00:00Z",
    lastContactedAt: "2026-08-20T11:00:00Z",
    nextFollowUpAt: "2026-08-22T10:00:00Z",
    city: "Hyderabad",
    estimatedDealValue: 54e4
  },
  {
    id: "LEAD-1007",
    name: "Amit Patel",
    phone: "+91 98250 12345",
    email: "amit.patel@gujaratchem.com",
    company: "Gujarat Specialty Chemicals",
    source: "CSV Import",
    priority: "Medium",
    status: "Contacted",
    assignedTo: "sales-2",
    notes: "Followed up after trade expo. Sent product overview PDF.",
    createdAt: "2026-08-13T10:00:00Z",
    updatedAt: "2026-08-19T13:20:00Z",
    lastContactedAt: "2026-08-19T13:20:00Z",
    city: "Ahmedabad",
    estimatedDealValue: 31e4
  },
  {
    id: "LEAD-1008",
    name: "Rohan Mehta",
    phone: "+91 98205 67890",
    email: "rohan@mehtaecommerce.com",
    company: "Mehta Omni-Commerce",
    source: "Website",
    priority: "High",
    status: "Converted",
    assignedTo: "sales-2",
    notes: "Completed onboarding. 45 agents live on the platform.",
    createdAt: "2026-08-05T09:00:00Z",
    updatedAt: "2026-08-16T12:00:00Z",
    lastContactedAt: "2026-08-16T12:00:00Z",
    city: "Mumbai",
    estimatedDealValue: 78e4
  },
  {
    id: "LEAD-1009",
    name: "Kavita Joshi",
    phone: "+91 94220 34567",
    email: "kavita.j@joshiinfra.in",
    company: "Joshi Infrastructure & Real Estate",
    source: "Referral",
    priority: "High",
    status: "Interested",
    assignedTo: "sales-2",
    notes: "Needs call center management for 5 luxury housing projects.",
    createdAt: "2026-08-15T11:45:00Z",
    updatedAt: "2026-08-20T16:00:00Z",
    lastContactedAt: "2026-08-20T16:00:00Z",
    nextFollowUpAt: "2026-08-21T15:00:00Z",
    city: "Nagpur",
    estimatedDealValue: 92e4
  },
  {
    id: "LEAD-1010",
    name: "Deepak Sharma",
    phone: "+91 98100 23456",
    email: "deepak@delhiedu.org",
    company: "NorthStar Education Group",
    source: "Manual Entry",
    priority: "Low",
    status: "Not Interested",
    assignedTo: "sales-3",
    notes: "Already signed long term contract with another telecom vendor last month.",
    createdAt: "2026-08-08T15:30:00Z",
    updatedAt: "2026-08-14T11:00:00Z",
    lastContactedAt: "2026-08-14T11:00:00Z",
    city: "New Delhi",
    estimatedDealValue: 12e4
  },
  {
    id: "LEAD-1011",
    name: "Neha Gupta",
    phone: "+91 99100 87654",
    email: "neha.gupta@gurgaonadvisors.com",
    company: "Gurgaon Financial Advisory",
    source: "Advertisement",
    priority: "Medium",
    status: "Follow-up",
    assignedTo: "sales-3",
    notes: "Requested security compliance sheet (ISO 27001 & SOC-2).",
    createdAt: "2026-08-16T13:00:00Z",
    updatedAt: "2026-08-19T10:30:00Z",
    lastContactedAt: "2026-08-19T10:30:00Z",
    nextFollowUpAt: "2026-08-21T16:30:00Z",
    city: "Gurugram",
    estimatedDealValue: 41e4
  },
  {
    id: "LEAD-1012",
    name: "Suresh Reddy",
    phone: "+91 98480 11223",
    email: "suresh@reddypharma.co",
    company: "Reddy Pharmaceuticals Ltd",
    source: "Website",
    priority: "High",
    status: "Converted",
    assignedTo: "sales-3",
    notes: "Enterprise plan confirmed. Contract executed for 3 years.",
    createdAt: "2026-08-03T11:00:00Z",
    updatedAt: "2026-08-15T14:20:00Z",
    lastContactedAt: "2026-08-15T14:20:00Z",
    city: "Hyderabad",
    estimatedDealValue: 12e5
  },
  {
    id: "LEAD-1013",
    name: "Sneha Patil",
    phone: "+91 98220 99887",
    email: "sneha.patil@patilhospitality.com",
    company: "Patil Hotels & Resorts",
    source: "Facebook",
    priority: "Medium",
    status: "Contacted",
    assignedTo: "sales-4",
    notes: "Call answered by GM. Scheduled detailed demo with reservations team.",
    createdAt: "2026-08-17T09:30:00Z",
    updatedAt: "2026-08-20T12:15:00Z",
    lastContactedAt: "2026-08-20T12:15:00Z",
    city: "Goa",
    estimatedDealValue: 36e4
  },
  {
    id: "LEAD-1014",
    name: "Manoj Nair",
    phone: "+91 98470 55443",
    email: "manoj.nair@cochinshipping.in",
    company: "Cochin Maritime Logistics",
    source: "Website",
    priority: "High",
    status: "Interested",
    assignedTo: "sales-4",
    notes: "Urgent requirement for port dispatch call recording and live supervisor monitoring.",
    createdAt: "2026-08-14T16:00:00Z",
    updatedAt: "2026-08-20T15:10:00Z",
    lastContactedAt: "2026-08-20T15:10:00Z",
    nextFollowUpAt: "2026-08-21T12:00:00Z",
    city: "Kochi",
    estimatedDealValue: 59e4
  },
  {
    id: "LEAD-1015",
    name: "Pooja Aggarwal",
    phone: "+91 98101 66554",
    email: "pooja@aggarwaltextiles.com",
    company: "Aggarwal Export Textiles",
    source: "Referral",
    priority: "Medium",
    status: "Follow-up",
    assignedTo: "sales-4",
    notes: "Owner was travelling abroad. Follow-up planned upon return.",
    createdAt: "2026-08-09T14:30:00Z",
    updatedAt: "2026-08-18T17:00:00Z",
    lastContactedAt: "2026-08-18T17:00:00Z",
    nextFollowUpAt: "2026-08-21T10:30:00Z",
    city: "Surat",
    estimatedDealValue: 38e4
  },
  {
    id: "LEAD-1016",
    name: "Vivek Joshi",
    phone: "+91 98290 77665",
    email: "vivek.j@jaipurjewels.com",
    company: "Jaipur Heritage Gems",
    source: "Instagram",
    priority: "Low",
    status: "Lost",
    assignedTo: "sales-5",
    notes: "Decided to continue with existing WhatsApp business account without CRM.",
    createdAt: "2026-08-04T10:15:00Z",
    updatedAt: "2026-08-12T16:00:00Z",
    lastContactedAt: "2026-08-12T16:00:00Z",
    city: "Jaipur",
    estimatedDealValue: 14e4
  },
  {
    id: "LEAD-1017",
    name: "Shruti Mukherjee",
    phone: "+91 98310 88990",
    email: "shruti@kolkatadesign.co",
    company: "Mukherjee Creative Media",
    source: "Website",
    priority: "Medium",
    status: "New",
    assignedTo: "sales-5",
    notes: "Filled inquiry form on homepage pricing page.",
    createdAt: "2026-08-20T09:40:00Z",
    updatedAt: "2026-08-20T09:40:00Z",
    city: "Kolkata",
    estimatedDealValue: 22e4
  },
  {
    id: "LEAD-1018",
    name: "Karthik Subramanian",
    phone: "+91 98402 33221",
    email: "karthik@madrasauto.com",
    company: "Madras Auto Components",
    source: "Referral",
    priority: "High",
    status: "Interested",
    assignedTo: "sales-5",
    notes: "Managing Director wants custom CRM fields for Tier-1 automotive leads.",
    createdAt: "2026-08-16T12:00:00Z",
    updatedAt: "2026-08-20T10:45:00Z",
    lastContactedAt: "2026-08-20T10:45:00Z",
    nextFollowUpAt: "2026-08-22T14:00:00Z",
    city: "Chennai",
    estimatedDealValue: 67e4
  },
  {
    id: "LEAD-1019",
    name: "Divya Venkatesh",
    phone: "+91 98455 77881",
    email: "divya@bangaloreb2b.in",
    company: "Venkatesh Agro Exports",
    source: "CSV Import",
    priority: "Medium",
    status: "Contacted",
    assignedTo: "sales-1",
    notes: "Expressed interest in multi-language calling templates (Kannada & Hindi).",
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-08-19T14:00:00Z",
    lastContactedAt: "2026-08-19T14:00:00Z",
    city: "Bengaluru",
    estimatedDealValue: 33e4
  },
  {
    id: "LEAD-1020",
    name: "Alok Mishra",
    phone: "+91 94150 44332",
    email: "alok.m@lucknowconst.in",
    company: "Awadh Developers & Infra",
    source: "Advertisement",
    priority: "High",
    status: "Follow-up",
    assignedTo: "sales-2",
    notes: "Follow-up on quotation sent yesterday. Pricing negotiation ongoing.",
    createdAt: "2026-08-13T15:00:00Z",
    updatedAt: "2026-08-20T13:30:00Z",
    lastContactedAt: "2026-08-20T13:30:00Z",
    nextFollowUpAt: "2026-08-21T09:30:00Z",
    city: "Lucknow",
    estimatedDealValue: 51e4
  },
  {
    id: "LEAD-1021",
    name: "Kiran Gokhale",
    phone: "+91 98224 55667",
    email: "kiran@puneconsulting.org",
    company: "Gokhale & Associates Financial",
    source: "Website",
    priority: "High",
    status: "Interested",
    assignedTo: "sales-3",
    notes: "Looking for smart follow-up triggers and call transcription summaries.",
    createdAt: "2026-08-17T11:00:00Z",
    updatedAt: "2026-08-20T15:00:00Z",
    lastContactedAt: "2026-08-20T15:00:00Z",
    nextFollowUpAt: "2026-08-22T11:30:00Z",
    city: "Pune",
    estimatedDealValue: 48e4
  },
  {
    id: "LEAD-1022",
    name: "Tanvi Saxena",
    phone: "+91 98710 22334",
    email: "tanvi@saxenamarketing.com",
    company: "Saxena Global Digital Agency",
    source: "Referral",
    priority: "Medium",
    status: "Converted",
    assignedTo: "sales-4",
    notes: "Closed successfully! Team onboarding scheduled for Monday morning.",
    createdAt: "2026-08-07T10:00:00Z",
    updatedAt: "2026-08-18T16:30:00Z",
    lastContactedAt: "2026-08-18T16:30:00Z",
    city: "Noida",
    estimatedDealValue: 69e4
  },
  {
    id: "LEAD-1023",
    name: "Harish Choudhary",
    phone: "+91 94140 11998",
    email: "harish@choudharyminerals.in",
    company: "Rajasthan Mineral Corporation",
    source: "Manual Entry",
    priority: "Low",
    status: "New",
    assignedTo: "sales-1",
    notes: "Walk-in lead from industrial summit in Udaipur.",
    createdAt: "2026-08-20T12:00:00Z",
    updatedAt: "2026-08-20T12:00:00Z",
    city: "Udaipur",
    estimatedDealValue: 19e4
  },
  {
    id: "LEAD-1024",
    name: "Bhavna Menon",
    phone: "+91 98460 77112",
    email: "bhavna@menonayur.com",
    company: "Kerala Ayurvedic Healing",
    source: "Website",
    priority: "High",
    status: "Interested",
    assignedTo: "sales-2",
    notes: "Fast growing wellness clinic network. Need 25 lines with recording.",
    createdAt: "2026-08-18T08:30:00Z",
    updatedAt: "2026-08-20T17:00:00Z",
    lastContactedAt: "2026-08-20T17:00:00Z",
    nextFollowUpAt: "2026-08-21T16:00:00Z",
    city: "Kozhikode",
    estimatedDealValue: 53e4
  },
  {
    id: "LEAD-1025",
    name: "Gaurav Bhatia",
    phone: "+91 98118 99001",
    email: "gaurav@bhatiainsurance.in",
    company: "Bhatia Risk Advisors",
    source: "Advertisement",
    priority: "Medium",
    status: "Follow-up",
    assignedTo: "sales-1",
    notes: "Reviewing proposal with financial committee.",
    createdAt: "2026-08-12T13:45:00Z",
    updatedAt: "2026-08-19T11:15:00Z",
    lastContactedAt: "2026-08-19T11:15:00Z",
    nextFollowUpAt: "2026-08-21T14:00:00Z",
    city: "Chandigarh",
    estimatedDealValue: 34e4
  },
  {
    id: "LEAD-1026",
    name: "Shalini Swaminathan",
    phone: "+91 98409 66778",
    email: "shalini@swamienergy.com",
    company: "Swami Clean Energy Solutions",
    source: "Referral",
    priority: "High",
    status: "Interested",
    assignedTo: "sales-3",
    notes: "Solar installation company scaling sales call center to 40 reps.",
    createdAt: "2026-08-16T14:00:00Z",
    updatedAt: "2026-08-20T16:30:00Z",
    lastContactedAt: "2026-08-20T16:30:00Z",
    nextFollowUpAt: "2026-08-22T15:00:00Z",
    city: "Coimbatore",
    estimatedDealValue: 72e4
  },
  {
    id: "LEAD-1027",
    name: "Tarun Bansal",
    phone: "+91 98720 44556",
    email: "tarun@bansalplastics.com",
    company: "Bansal Polymers Industries",
    source: "CSV Import",
    priority: "Low",
    status: "Not Interested",
    assignedTo: "sales-4",
    notes: "Does not require cloud CRM telephony currently.",
    createdAt: "2026-08-10T10:00:00Z",
    updatedAt: "2026-08-15T12:00:00Z",
    lastContactedAt: "2026-08-15T12:00:00Z",
    city: "Ludhiana",
    estimatedDealValue: 11e4
  },
  {
    id: "LEAD-1028",
    name: "Madhavi Sen",
    phone: "+91 98305 11223",
    email: "madhavi@eastindialogistics.in",
    company: "East India Cargo & Freight",
    source: "Website",
    priority: "Medium",
    status: "Contacted",
    assignedTo: "sales-5",
    notes: "Requested product demo recording to share with managing partners.",
    createdAt: "2026-08-18T15:20:00Z",
    updatedAt: "2026-08-20T11:40:00Z",
    lastContactedAt: "2026-08-20T11:40:00Z",
    city: "Kolkata",
    estimatedDealValue: 39e4
  },
  {
    id: "LEAD-1029",
    name: "Nitin Kulkarni",
    phone: "+91 98221 88776",
    email: "nitin.k@kulkarniauto.com",
    company: "Kulkarni Precision Auto",
    source: "Manual Entry",
    priority: "High",
    status: "Converted",
    assignedTo: "sales-1",
    notes: "Closed quarterly plan! Payment received and accounts provisioned.",
    createdAt: "2026-08-02T10:00:00Z",
    updatedAt: "2026-08-17T14:00:00Z",
    lastContactedAt: "2026-08-17T14:00:00Z",
    city: "Aurangabad",
    estimatedDealValue: 61e4
  },
  {
    id: "LEAD-1030",
    name: "Ishita Ganguly",
    phone: "+91 98319 99881",
    email: "ishita@gangulyedu.in",
    company: "Ganguly Institute of Learning",
    source: "Facebook",
    priority: "Medium",
    status: "New",
    assignedTo: "sales-2",
    notes: "Inquired about admissions call center management and IVR routing.",
    createdAt: "2026-08-20T16:15:00Z",
    updatedAt: "2026-08-20T16:15:00Z",
    city: "Kolkata",
    estimatedDealValue: 35e4
  }
];
var INITIAL_LEADS = RAW_LEADS.map((lead) => {
  const assignedUser = INITIAL_USERS.find((u) => u.id === lead.assignedTo);
  const aiAnalysis = LocalAIService.scoreLead(lead);
  return {
    ...lead,
    assignedToName: assignedUser?.name || "Unassigned",
    aiAnalysis
  };
});
var INITIAL_CALLS = [
  {
    id: "CALL-5001",
    leadId: "LEAD-1001",
    leadName: "Raj Kumar",
    leadPhone: "+91 98230 45678",
    salespersonId: "sales-1",
    salespersonName: "Rajesh Nair",
    startedAt: "2026-08-20T14:10:00Z",
    endedAt: "2026-08-20T14:14:32Z",
    durationSeconds: 272,
    status: "Answered",
    outcome: "Interested",
    notes: "Spoke with Raj. Discussed enterprise features, SLA terms, and security compliance. He wants a proposal sent for 50 agents before tomorrow morning.",
    createdAt: "2026-08-20T14:15:00Z",
    aiInsight: {
      sentiment: "Positive",
      interestScore: 9,
      callQualityScore: 92,
      keyTopics: ["Enterprise Telephony", "SLA Terms & Security", "50-Seat Pricing"],
      customerObjections: ["Competitor pricing comparison"],
      aiSummary: "Highly positive conversation with Raj Kumar. Strong buying intent confirmed with budget allocated for Q3.",
      smartFollowUpSuggestion: {
        recommendedDate: "2026-08-21",
        recommendedTime: "11:00 AM",
        agenda: "Review commercial proposal & confirm security questionnaire"
      }
    }
  },
  {
    id: "CALL-5002",
    leadId: "LEAD-1002",
    leadName: "Priya Sharma",
    leadPhone: "+91 98112 34567",
    salespersonId: "sales-1",
    salespersonName: "Rajesh Nair",
    startedAt: "2026-08-19T16:40:00Z",
    endedAt: "2026-08-19T16:44:14Z",
    durationSeconds: 254,
    status: "Answered",
    outcome: "Follow-up Required",
    notes: "Priya requested a demonstration of the CRM sync and analytics dashboards for her team managers next Tuesday.",
    createdAt: "2026-08-19T16:45:00Z",
    aiInsight: {
      sentiment: "Positive",
      interestScore: 8,
      callQualityScore: 88,
      keyTopics: ["CRM Integration", "Manager Analytics", "Live Dashboards"],
      customerObjections: ["Onboarding timeline requirement"],
      aiSummary: "Good progress made. Decision maker involved. Scheduled live product demo with leadership.",
      smartFollowUpSuggestion: {
        recommendedDate: "2026-08-21",
        recommendedTime: "02:30 PM",
        agenda: "Deliver customized product walkthrough for retail managers"
      }
    }
  },
  {
    id: "CALL-5003",
    leadId: "LEAD-1003",
    leadName: "Vikram Malhotra",
    leadPhone: "+91 98765 43210",
    salespersonId: "sales-1",
    salespersonName: "Rajesh Nair",
    startedAt: "2026-08-18T09:58:00Z",
    endedAt: "2026-08-18T10:00:00Z",
    durationSeconds: 120,
    status: "Answered",
    outcome: "Call Later",
    notes: "Vikram was in a transit meeting. Asked to call back later in the week.",
    createdAt: "2026-08-18T10:00:00Z",
    aiInsight: {
      sentiment: "Neutral",
      interestScore: 6,
      callQualityScore: 65,
      keyTopics: ["Logistics Tracking", "Timing Availability"],
      customerObjections: ["In transit / unavailable"],
      aiSummary: "Short touchpoint. Customer engaged politely but requested reschedule due to external meeting.",
      smartFollowUpSuggestion: {
        recommendedDate: "2026-08-21",
        recommendedTime: "04:00 PM",
        agenda: "Re-engage regarding voice alert system"
      }
    }
  },
  {
    id: "CALL-5004",
    leadId: "LEAD-1006",
    leadName: "Sunita Rao",
    leadPhone: "+91 98490 87654",
    salespersonId: "sales-2",
    salespersonName: "Neha Kapoor",
    startedAt: "2026-08-20T10:50:00Z",
    endedAt: "2026-08-20T10:59:30Z",
    durationSeconds: 570,
    status: "Answered",
    outcome: "Interested",
    notes: "Detailed technical call with Sunita and her CTO. Walked through API webhooks and data export capabilities.",
    createdAt: "2026-08-20T11:00:00Z",
    aiInsight: {
      sentiment: "Positive",
      interestScore: 9,
      callQualityScore: 95,
      keyTopics: ["API Webhooks", "Data Export", "HubSpot Integration"],
      customerObjections: ["Webhook latency guarantees"],
      aiSummary: "Outstanding discovery call. CTO confirmed technical feasibility. Sending contract for legal review.",
      smartFollowUpSuggestion: {
        recommendedDate: "2026-08-22",
        recommendedTime: "10:00 AM",
        agenda: "Review API sandbox test results"
      }
    }
  },
  {
    id: "CALL-5005",
    leadId: "LEAD-1010",
    leadName: "Deepak Sharma",
    leadPhone: "+91 98100 23456",
    salespersonId: "sales-3",
    salespersonName: "Aditya Sen",
    startedAt: "2026-08-14T10:55:00Z",
    endedAt: "2026-08-14T10:59:00Z",
    durationSeconds: 240,
    status: "Answered",
    outcome: "Not Interested",
    notes: "Prospect locked in multi-year contract with existing vendor. Marked as Not Interested.",
    createdAt: "2026-08-14T11:00:00Z",
    aiInsight: {
      sentiment: "Negative",
      interestScore: 2,
      callQualityScore: 50,
      keyTopics: ["Incumbent Contract Lock-in"],
      customerObjections: ["Already renewed contract for 24 months"],
      aiSummary: "Disqualified lead for current fiscal year due to vendor lock-in. Re-queue in Q2 next year."
    }
  }
];
var INITIAL_FOLLOW_UPS = [
  {
    id: "FU-8001",
    leadId: "LEAD-1001",
    leadName: "Raj Kumar",
    leadPhone: "+91 98230 45678",
    salespersonId: "sales-1",
    salespersonName: "Rajesh Nair",
    scheduledDate: "2026-08-21",
    scheduledTime: "11:00",
    reminder: "15 minutes before",
    status: "Pending",
    notes: "Present finalized 50-agent commercial proposal and SLA package.",
    createdAt: "2026-08-20T14:15:00Z",
    updatedAt: "2026-08-20T14:15:00Z",
    priority: "High"
  },
  {
    id: "FU-8002",
    leadId: "LEAD-1002",
    leadName: "Priya Sharma",
    leadPhone: "+91 98112 34567",
    salespersonId: "sales-1",
    salespersonName: "Rajesh Nair",
    scheduledDate: "2026-08-21",
    scheduledTime: "14:30",
    reminder: "30 minutes before",
    status: "Pending",
    notes: "Walkthrough demonstration with retail branch heads.",
    createdAt: "2026-08-19T16:45:00Z",
    updatedAt: "2026-08-19T16:45:00Z",
    priority: "High"
  },
  {
    id: "FU-8003",
    leadId: "LEAD-1009",
    leadName: "Kavita Joshi",
    leadPhone: "+91 94220 34567",
    salespersonId: "sales-2",
    salespersonName: "Neha Kapoor",
    scheduledDate: "2026-08-21",
    scheduledTime: "15:00",
    reminder: "1 hour before",
    status: "Pending",
    notes: "Review multi-property calling workflow for luxury housing sales.",
    createdAt: "2026-08-20T16:00:00Z",
    updatedAt: "2026-08-20T16:00:00Z",
    priority: "High"
  },
  {
    id: "FU-8004",
    leadId: "LEAD-1020",
    leadName: "Alok Mishra",
    leadPhone: "+91 94150 44332",
    salespersonId: "sales-2",
    salespersonName: "Neha Kapoor",
    scheduledDate: "2026-08-20",
    scheduledTime: "09:30",
    reminder: "15 minutes before",
    status: "Overdue",
    notes: "Check if purchase order approval was cleared by the board.",
    createdAt: "2026-08-19T10:00:00Z",
    updatedAt: "2026-08-20T18:00:00Z",
    priority: "High"
  },
  {
    id: "FU-8005",
    leadId: "LEAD-1011",
    leadName: "Neha Gupta",
    leadPhone: "+91 99100 87654",
    salespersonId: "sales-3",
    salespersonName: "Aditya Sen",
    scheduledDate: "2026-08-21",
    scheduledTime: "16:30",
    reminder: "15 minutes before",
    status: "Pending",
    notes: "Share compliance documents and audit certifications.",
    createdAt: "2026-08-19T10:30:00Z",
    updatedAt: "2026-08-19T10:30:00Z",
    priority: "Medium"
  }
];
var INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    userId: "sales-1",
    title: "High Priority Lead Assigned",
    message: "Manager assigned new high-value lead Raj Kumar (Apex Technologies).",
    type: "lead_assigned",
    read: false,
    createdAt: "2026-08-20T10:30:00Z",
    linkId: "LEAD-1001"
  },
  {
    id: "notif-2",
    userId: "sales-1",
    title: "Follow-up Scheduled Today",
    message: "Follow-up with Priya Sharma (Zenith Retail) at 2:30 PM.",
    type: "followup_due",
    read: false,
    createdAt: "2026-08-20T08:00:00Z",
    linkId: "FU-8002"
  },
  {
    id: "notif-3",
    userId: "mgr-1",
    title: "New Deal Converted! \u{1F389}",
    message: "Rajesh Nair successfully converted Ananya Iyer (Chennai Capital & Finance - \u20B98,50,000).",
    type: "conversion",
    read: false,
    createdAt: "2026-08-17T15:30:00Z",
    linkId: "LEAD-1004"
  },
  {
    id: "notif-4",
    userId: "mgr-1",
    title: "Overdue Follow-up Alert",
    message: "Lead Alok Mishra has an overdue follow-up assigned to Neha Kapoor.",
    type: "overdue_alert",
    read: false,
    createdAt: "2026-08-20T10:00:00Z",
    linkId: "FU-8004"
  }
];
var INITIAL_ACTIVITY_LOGS = [
  {
    id: "act-1",
    userId: "sales-1",
    userName: "Rajesh Nair",
    userRole: "salesperson",
    action: "Called Lead",
    entityType: "Call",
    entityId: "CALL-5001",
    entityName: "Raj Kumar",
    description: "Completed 4m 32s discovery call with Raj Kumar. Outcome: Interested.",
    createdAt: "2026-08-20T14:15:00Z"
  },
  {
    id: "act-2",
    userId: "mgr-1",
    userName: "Aarav Singhania",
    userRole: "manager",
    action: "Assigned Leads",
    entityType: "Lead",
    entityId: "LEAD-1001",
    entityName: "Batch of 6 leads",
    description: "Assigned 6 inbound website leads to Rajesh Nair and Neha Kapoor.",
    createdAt: "2026-08-20T10:30:00Z"
  },
  {
    id: "act-3",
    userId: "sales-2",
    userName: "Neha Kapoor",
    userRole: "salesperson",
    action: "Called Lead",
    entityType: "Call",
    entityId: "CALL-5004",
    entityName: "Sunita Rao",
    description: "Technical demo call with CTO of Deccan Software. Outcome: Interested.",
    createdAt: "2026-08-20T11:00:00Z"
  },
  {
    id: "act-4",
    userId: "sales-1",
    userName: "Rajesh Nair",
    userRole: "salesperson",
    action: "Closed Deal",
    entityType: "Lead",
    entityId: "LEAD-1004",
    entityName: "Ananya Iyer",
    description: "Marked Chennai Capital & Finance as Converted (\u20B98,50,000).",
    createdAt: "2026-08-17T15:30:00Z"
  }
];

// src/server/db.ts
var BackendDatabase = class {
  static {
    this.organization = {
      id: "org-salescall-pro",
      name: "SalesCall Enterprise Cloud Inc.",
      domain: "salescallpro.ai",
      plan: "Enterprise Pro Tier",
      createdAt: "2025-01-01T00:00:00.000Z"
    };
  }
  static {
    this.users = [...INITIAL_USERS];
  }
  static {
    this.leads = [...INITIAL_LEADS];
  }
  static {
    this.calls = [...INITIAL_CALLS];
  }
  static {
    this.followUps = [...INITIAL_FOLLOW_UPS];
  }
  static {
    this.notifications = [...INITIAL_NOTIFICATIONS];
  }
  static {
    this.activityLogs = [...INITIAL_ACTIVITY_LOGS];
  }
  static {
    this.auditLogs = [];
  }
  static {
    this.recordings = {};
  }
  static {
    this.transcripts = {};
  }
  static {
    this.aiAnalyses = {};
  }
  static {
    // Live sales reps status tracking
    this.liveStatus = {};
  }
  static {
    this.initialized = false;
  }
  static initialize() {
    if (this.initialized) return;
    this.initialized = true;
    this.calls.forEach((c) => {
      this.recordings[c.id] = {
        id: `rec-${c.id}`,
        organizationId: this.organization.id,
        callId: c.id,
        storagePath: `recordings/2026/08/${c.id}.wav`,
        durationSeconds: c.durationSeconds || 140,
        audioUrl: `https://actions.google.com/sounds/v1/telecommunications/phone_dial_tone.ogg`,
        audioChannels: 2,
        mimeType: "audio/wav",
        fileSizeBytes: 245e4,
        createdAt: c.createdAt
      };
      const isSuccessful = c.outcome === "Interested" || c.outcome === "Converted";
      this.transcripts[c.id] = [
        {
          id: `tr-${c.id}-1`,
          organizationId: this.organization.id,
          callId: c.id,
          speaker: "SALESPERSON",
          speakerName: c.salespersonName,
          channel: 0,
          timestamp: "00:05",
          offsetSeconds: 5,
          text: `Hello ${c.leadName}, this is ${c.salespersonName} from SalesCall Pro. I saw your request regarding cloud telephony and CRM integration.`,
          confidence: 0.98,
          createdAt: c.createdAt
        },
        {
          id: `tr-${c.id}-2`,
          organizationId: this.organization.id,
          callId: c.id,
          speaker: "CUSTOMER",
          speakerName: c.leadName,
          channel: 1,
          timestamp: "00:18",
          offsetSeconds: 18,
          text: isSuccessful ? `Hi ${c.salespersonName}! Yes, our team is currently upgrading 45 sales reps and we require real-time AI battlecards and automated call summaries.` : `Hello. We already evaluated our budget and decided to stay with our current phone system for this quarter.`,
          confidence: 0.96,
          createdAt: c.createdAt
        },
        {
          id: `tr-${c.id}-3`,
          organizationId: this.organization.id,
          callId: c.id,
          speaker: "SALESPERSON",
          speakerName: c.salespersonName,
          channel: 0,
          timestamp: "00:42",
          offsetSeconds: 42,
          text: isSuccessful ? `That is exactly what we specialize in. We can have your entire outbound team provisioned in less than 24 hours with zero hardware required.` : `Understood. May I send you a 1-page comparison sheet in case your volume needs expand next quarter?`,
          confidence: 0.99,
          createdAt: c.createdAt
        },
        {
          id: `tr-${c.id}-4`,
          organizationId: this.organization.id,
          callId: c.id,
          speaker: "CUSTOMER",
          speakerName: c.leadName,
          channel: 1,
          timestamp: "01:15",
          offsetSeconds: 75,
          text: isSuccessful ? `That sounds very promising. Please schedule a tailored live demo for our operations team tomorrow at 11 AM.` : `Sure, you can email that over. Thank you.`,
          confidence: 0.97,
          createdAt: c.createdAt
        }
      ];
      const isSuccess = c.outcome === "Interested" || c.outcome === "Converted";
      this.aiAnalyses[c.id] = {
        id: `ai-${c.id}`,
        organizationId: this.organization.id,
        callId: c.id,
        salespersonId: c.salespersonId,
        leadId: c.leadId,
        summary: isSuccess ? `Customer showed strong interest in the 45-seat telephony upgrade and requested a tailored live demo.
Next step: Follow up tomorrow at 11:00 AM to present the technical architecture.` : `Customer indicated budget allocation was locked with their current provider for this quarter.
Next step: Send quarterly comparison sheet and re-engage in 90 days.`,
        sentiment: isSuccess ? "Positive" : "Neutral",
        sentimentTrend: {
          start: "Neutral",
          middle: isSuccess ? "Positive" : "Neutral",
          end: isSuccess ? "Positive" : "Negative"
        },
        intent: isSuccess ? "Demo" : "Not Interested",
        intentLevel: isSuccess ? "High Intent" : "Low Intent",
        outcomeClassification: isSuccess ? "SUCCESSFUL" : "UNSUCCESSFUL",
        successReason: isSuccess ? "Customer agreed to product demo for 45 reps" : void 0,
        failureReason: !isSuccess ? "Budget locked with existing provider for current quarter" : void 0,
        successReasonAi: isSuccess ? [
          "Customer showed strong interest in real-time AI battlecards",
          "Fast 24-hour provisioning timeline addressed their migration concerns",
          "Clear decision-maker demo scheduled"
        ] : void 0,
        failureReasonAi: !isSuccess ? [
          "Budgetary constraints for current fiscal quarter",
          "Incumbent contract active for 6 more months"
        ] : void 0,
        nextAction: isSuccess ? "Send calendar invitation for live demo tomorrow at 11:00 AM." : "Enroll prospect into 90-day automated educational drip campaign.",
        callQualityScore: isSuccess ? 88 : 64,
        qualityScoreBreakdown: {
          opening: isSuccess ? 19 : 15,
          discovery: isSuccess ? 18 : 12,
          productExplanation: isSuccess ? 18 : 13,
          objectionHandling: isSuccess ? 16 : 11,
          closing: isSuccess ? 17 : 13
        },
        confidence: 92,
        aiModel: "Gemini 2.5 Flash Telephony Analytics",
        keyTopics: isSuccess ? ["Cloud Telephony", "AI Battlecards", "CRM Sync", "Seat Licensing"] : ["Budget Constraints", "Contract Duration", "Follow-up Timeline"],
        customerObjections: isSuccess ? ["Migration complexity from legacy PBX"] : ["No budget this quarter", "Contract active with competitor"],
        createdAt: c.createdAt,
        updatedAt: c.createdAt
      };
    });
    const salesReps = this.users.filter((u) => u.role === "salesperson");
    salesReps.forEach((rep, idx) => {
      const statuses = ["ONLINE", "ON_CALL", "ONLINE", "ONLINE", "OFFLINE"];
      const currentStatus = statuses[idx % statuses.length];
      const repCalls = this.calls.filter((c) => c.salespersonId === rep.id);
      const successfulCalls = repCalls.filter(
        (c) => c.outcome === "Interested" || c.outcome === "Converted"
      ).length;
      const successRate = repCalls.length > 0 ? Math.round(successfulCalls / repCalls.length * 100) : 70;
      this.liveStatus[rep.id] = {
        userId: rep.id,
        status: currentStatus,
        currentActivity: currentStatus === "ON_CALL" ? "Dialing outbound prospect" : currentStatus === "ONLINE" ? "Reviewing lead queue & AI battlecards" : "Away from workstation",
        currentLeadId: currentStatus === "ON_CALL" ? "LEAD-1001" : void 0,
        currentLeadName: currentStatus === "ON_CALL" ? "Raj Kumar (Apex Tech)" : void 0,
        callStartedAt: currentStatus === "ON_CALL" ? new Date(Date.now() - 4 * 60 * 1e3 - 32 * 1e3).toISOString() : void 0,
        lastActivityAt: new Date(Date.now() - (idx + 1) * 45 * 1e3).toISOString(),
        todayCallsCount: rep.callsTodayCount || repCalls.length || 12,
        todaySuccessRate: successRate
      };
    });
    this.logAudit({
      userId: "usr-thara",
      userName: "Thara Maps",
      userRole: "manager",
      action: "SYSTEM_INITIALIZATION",
      resourceType: "USER",
      resourceId: "org-salescall-pro",
      metadata: { note: "Organization database securely booted." }
    });
  }
  // Audit Logging
  static logAudit(params) {
    const log = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      organizationId: this.organization.id,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    return log;
  }
  // Activity Logging
  static logActivity(params) {
    const activity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      description: params.description,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.activityLogs.unshift(activity);
    if (this.activityLogs.length > 300) {
      this.activityLogs = this.activityLogs.slice(0, 300);
    }
    return activity;
  }
};
BackendDatabase.initialize();

// src/server/auth.ts
var AuthMiddleware = class {
  /**
   * Identifies user from headers (e.g. x-user-id or Authorization Bearer)
   */
  static authenticate(req, res, next) {
    const userId = req.headers["x-user-id"] || req.query.userId;
    const userRole = req.headers["x-user-role"] || req.query.userRole;
    if (userId) {
      let user = BackendDatabase.users.find((u) => u.id === userId);
      if (!user && (userRole === "manager" || userRole === "salesperson")) {
        user = {
          id: userId,
          name: req.headers["x-user-name"] || "Authenticated User",
          email: req.headers["x-user-email"] || `${userId}@salescallpro.ai`,
          role: userRole,
          status: "active",
          joinedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        };
        BackendDatabase.users.push(user);
      }
      if (user) {
        req.user = user;
        req.organizationId = BackendDatabase.organization.id;
        return next();
      }
    }
    req.user = BackendDatabase.users[0];
    req.organizationId = BackendDatabase.organization.id;
    next();
  }
  /**
   * Enforces Manager Role Only
   */
  static requireManager(req, res, next) {
    if (!req.user || req.user.role !== "manager") {
      BackendDatabase.logAudit({
        userId: req.user?.id || "anonymous",
        userName: req.user?.name || "Unauthorized User",
        userRole: req.user?.role || "salesperson",
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resourceType: "REPORT",
        resourceId: req.originalUrl,
        metadata: { status: 403, reason: "Manager role required" }
      });
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Access Denied: This resource requires Sales Manager executive privileges."
      });
    }
    next();
  }
  /**
   * Enforces that a salesperson can ONLY access their own resource
   */
  static enforceOwnership(paramKey = "salespersonId") {
    return (req, res, next) => {
      const targetId = req.params[paramKey] || req.query[paramKey] || req.body[paramKey];
      if (req.user?.role === "manager") {
        return next();
      }
      if (req.user?.role === "salesperson" && targetId && targetId !== req.user.id) {
        BackendDatabase.logAudit({
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: "CROSS_SALESPERSON_ACCESS_BLOCKED",
          resourceType: "CALL",
          resourceId: String(targetId),
          metadata: { status: 403, requestedPath: req.originalUrl }
        });
        return res.status(403).json({
          error: "FORBIDDEN",
          message: "Access Denied: A salesperson is strictly prohibited from accessing another representative's calls or records."
        });
      }
      next();
    };
  }
};

// src/server/services/realtimeService.ts
var RealtimeService = class {
  static {
    this.clients = [];
  }
  static addClient(id, res, userId, role) {
    this.clients.push({ id, res, userId, role });
  }
  static removeClient(id) {
    this.clients = this.clients.filter((c) => c.id !== id);
  }
  static broadcast(payload) {
    const data = `data: ${JSON.stringify(payload)}

`;
    this.clients.forEach((client) => {
      if (client.role === "manager" || client.userId === payload.userId) {
        try {
          client.res.write(data);
        } catch (e) {
        }
      }
    });
  }
};

// src/server/services/aiCallAnalysisService.ts
import { GoogleGenAI } from "@google/genai";
var AiCallAnalysisService = class {
  /**
   * Generates or extracts full AI Call Overview and Deep Analysis
   */
  static async analyzeCall(params) {
    const {
      callId,
      salespersonId,
      salespersonName,
      leadId,
      leadName,
      leadCompany,
      durationSeconds,
      status,
      outcome,
      notes,
      transcripts
    } = params;
    const isConnected = status === "Answered";
    const isSuccess = outcome === "Interested" || outcome === "Converted";
    const notesLower = (notes || "").toLowerCase();
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && transcripts && transcripts.length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const transcriptText = transcripts.map((t) => `${t.speaker === "SALESPERSON" ? salespersonName : leadName}: ${t.text}`).join("\n");
        const prompt = `You are an elite Sales Call Intelligence AI analyzer.
Analyze the following sales call transcript and outcome:

Call Details:
- Sales Rep: ${salespersonName}
- Lead Name: ${leadName} (${leadCompany || "Direct Prospect"})
- Call Duration: ${durationSeconds} seconds
- Outcome: ${outcome}
- Rep Notes: ${notes}

Transcript:
${transcriptText}

Respond ONLY with valid JSON in the following strict schema:
{
  "summary": "EXACTLY 2 SHORT LINES MAXIMUM. Line 1: What happened in the call. Line 2: Next step.",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "sentimentTrend": {
    "start": "Positive" | "Neutral" | "Negative",
    "middle": "Positive" | "Neutral" | "Negative",
    "end": "Positive" | "Neutral" | "Negative"
  },
  "intent": "Purchase" | "Demo" | "Pricing" | "Information" | "Follow-up" | "Not Interested",
  "intentLevel": "High Intent" | "Medium Intent" | "Low Intent",
  "outcomeClassification": "SUCCESSFUL" | "UNSUCCESSFUL",
  "successReason": "One clear line if successful or null",
  "failureReason": "One clear line if unsuccessful or null",
  "successReasonAi": ["bullet 1", "bullet 2", "bullet 3"],
  "failureReasonAi": ["bullet 1", "bullet 2"],
  "nextAction": "One clear prescriptive sentence",
  "callQualityScore": number between 40 and 96,
  "qualityScoreBreakdown": {
    "opening": number out of 20,
    "discovery": number out of 20,
    "productExplanation": number out of 20,
    "objectionHandling": number out of 20,
    "closing": number out of 20
  },
  "confidence": number between 85 and 96,
  "keyTopics": ["Topic 1", "Topic 2"],
  "customerObjections": ["Objection 1"]
}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        const rawJson = response.text?.trim();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return {
            id: `ai-${callId}`,
            organizationId: "org-salescall-pro",
            callId,
            salespersonId,
            leadId,
            summary: parsed.summary || (isSuccess ? `Customer showed strong interest in the solution and requested a product demonstration.
Next step: Follow up tomorrow to confirm the scheduled walkthrough.` : `Customer currently deferred decision due to budget constraints.
Next step: Re-engage in 90 days with updated pricing.`),
            sentiment: parsed.sentiment || (isSuccess ? "Positive" : "Neutral"),
            sentimentTrend: parsed.sentimentTrend || {
              start: "Neutral",
              middle: isSuccess ? "Positive" : "Neutral",
              end: isSuccess ? "Positive" : "Neutral"
            },
            intent: parsed.intent || (isSuccess ? "Demo" : "Information"),
            intentLevel: parsed.intentLevel || (isSuccess ? "High Intent" : "Medium Intent"),
            outcomeClassification: parsed.outcomeClassification || (isSuccess ? "SUCCESSFUL" : "UNSUCCESSFUL"),
            successReason: parsed.successReason || (isSuccess ? "Customer agreed to product demo." : void 0),
            failureReason: parsed.failureReason || (!isSuccess ? "Budget locked with existing provider." : void 0),
            successReasonAi: parsed.successReasonAi || (isSuccess ? ["Strong value proposition alignment", "Addressed cloud migration questions", "Confirmed decision maker involvement"] : void 0),
            failureReasonAi: parsed.failureReasonAi || (!isSuccess ? ["Budgetary restriction this quarter", "Active vendor agreement in place"] : void 0),
            nextAction: parsed.nextAction || (isSuccess ? "Follow up tomorrow at 10:00 AM to confirm demo." : "Send quarterly product overview sheet."),
            callQualityScore: parsed.callQualityScore || (isSuccess ? 86 : 68),
            qualityScoreBreakdown: parsed.qualityScoreBreakdown || {
              opening: isSuccess ? 18 : 14,
              discovery: isSuccess ? 17 : 13,
              productExplanation: isSuccess ? 18 : 14,
              objectionHandling: isSuccess ? 16 : 12,
              closing: isSuccess ? 17 : 15
            },
            confidence: parsed.confidence || 91,
            aiModel: "Gemini 2.5 Flash Telephony Analytics",
            keyTopics: parsed.keyTopics || ["Cloud Telephony", "Softphone Workflow", "CRM Integration"],
            customerObjections: parsed.customerObjections || ["Pricing", "Setup Time"],
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      } catch (err) {
        console.warn("Gemini AI call analysis error, using algorithmic fallback:", err);
      }
    }
    let sentiment = "Neutral";
    let intent = "Information";
    let intentLevel = "Medium Intent";
    let qualityScore = 70;
    const keyTopics = ["Cloud Telephony", "Outbound Softphone"];
    const customerObjections = [];
    if (isConnected) {
      if (durationSeconds > 180) qualityScore += 16;
      else if (durationSeconds > 60) qualityScore += 8;
      else qualityScore -= 8;
      if (isSuccess) {
        sentiment = "Positive";
        intent = outcome === "Converted" ? "Purchase" : "Demo";
        intentLevel = "High Intent";
        qualityScore += 12;
        keyTopics.push("Enterprise Pricing", "Live AI Battlecards", "CRM Sync");
      } else if (outcome === "Follow-up Required" || outcome === "Call Later") {
        sentiment = "Neutral";
        intent = "Follow-up";
        intentLevel = "Medium Intent";
        qualityScore += 4;
        keyTopics.push("Timeline Alignment", "Internal Review");
      } else {
        sentiment = "Negative";
        intent = "Not Interested";
        intentLevel = "Low Intent";
        qualityScore = Math.max(45, qualityScore - 18);
        customerObjections.push("Budget locked with competitor", "No current requirement");
      }
    } else {
      sentiment = "Neutral";
      intent = "Information";
      intentLevel = "Low Intent";
      qualityScore = 40;
      keyTopics.push("Voicemail / Unanswered");
    }
    if (notesLower.includes("pricing") || notesLower.includes("expensive")) {
      customerObjections.push("Pricing & seat cost concerns");
    }
    if (notesLower.includes("demo")) {
      keyTopics.push("Product Demonstration");
    }
    const line1 = isSuccess ? `Customer showed strong interest in the solution and agreed to next steps after reviewing cloud telephony features.` : isConnected ? `Customer discussed requirement but currently deferred implementation due to timeline or budget constraints.` : `Call was unanswered after several rings; voicemail left with company callback number.`;
    const line2 = isSuccess ? `Next step: Follow up tomorrow at 10:00 AM to finalize the proposal and schedule technical onboarding.` : isConnected ? `Next step: Send product comparison sheet and schedule follow-up in 30 days.` : `Next step: Re-attempt outbound contact during tomorrow's peak connection window at 11:30 AM.`;
    const summary = `${line1}
${line2}`;
    const qualityBreakdown = {
      opening: isSuccess ? 18 : 14,
      discovery: isSuccess ? 17 : 13,
      productExplanation: isSuccess ? 18 : 14,
      objectionHandling: isSuccess ? 16 : 12,
      closing: isSuccess ? 17 : 13
    };
    return {
      id: `ai-${callId}`,
      organizationId: "org-salescall-pro",
      callId,
      salespersonId,
      leadId,
      summary,
      sentiment,
      sentimentTrend: {
        start: "Neutral",
        middle: isSuccess ? "Positive" : "Neutral",
        end: isSuccess ? "Positive" : isConnected ? "Neutral" : "Neutral"
      },
      intent,
      intentLevel,
      outcomeClassification: isSuccess ? "SUCCESSFUL" : "UNSUCCESSFUL",
      successReason: isSuccess ? "Customer agreed to product demo and confirmed buying interest." : void 0,
      failureReason: !isSuccess && isConnected ? "Customer cited budget constraints with current incumbent." : void 0,
      successReasonAi: isSuccess ? [
        "Customer showed strong interest in automated AI call notes",
        "Pricing structure matched their budget threshold",
        "Decision maker was engaged and confirmed next demo step"
      ] : void 0,
      failureReasonAi: !isSuccess && isConnected ? [
        "Customer objected to migration timing",
        "Existing contract active for 6 more months"
      ] : void 0,
      nextAction: isSuccess ? "Follow up tomorrow at 10:00 AM." : "Send follow-up email with collateral.",
      callQualityScore: qualityScore,
      qualityScoreBreakdown: qualityBreakdown,
      confidence: 90,
      aiModel: "SalesCall Pro AI Intelligence Engine",
      keyTopics,
      customerObjections,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};

// src/server/services/performanceService.ts
var PerformanceService = class {
  /**
   * Computes comprehensive metrics for a given salesperson or all salespeople
   */
  static calculateRepMetrics(salespersonId, timeframe = "today") {
    const user = BackendDatabase.users.find((u) => u.id === salespersonId);
    const now = /* @__PURE__ */ new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
    let calls = BackendDatabase.calls.filter((c) => c.salespersonId === salespersonId);
    let leads = BackendDatabase.leads.filter((l) => l.assignedTo === salespersonId);
    let followUps = BackendDatabase.followUps.filter((f) => f.salespersonId === salespersonId);
    if (timeframe === "today") {
      calls = calls.filter((c) => c.createdAt.startsWith(todayStr));
      followUps = followUps.filter((f) => f.scheduledDate === todayStr);
    } else if (timeframe === "7days") {
      calls = calls.filter((c) => new Date(c.createdAt) >= sevenDaysAgo);
    } else if (timeframe === "30days") {
      calls = calls.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo);
    }
    const totalCalls = calls.length;
    const attendedCalls = calls.filter((c) => c.status === "Answered").length;
    const connectedCalls = attendedCalls;
    const missedCalls = calls.filter((c) => c.status === "No Answer").length;
    const failedCalls = calls.filter((c) => c.status === "Failed" || c.status === "Busy").length;
    const successfulCalls = calls.filter(
      (c) => c.outcome === "Interested" || c.outcome === "Converted"
    ).length;
    const unsuccessfulCalls = attendedCalls - successfulCalls;
    const successRate = attendedCalls > 0 ? Math.round(successfulCalls / attendedCalls * 100) : 0;
    const conversions = leads.filter((l) => l.status === "Converted").length;
    const conversionRate = leads.length > 0 ? Number((conversions / leads.length * 100).toFixed(1)) : 0;
    const totalTalkTime = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
    const averageCallDuration = attendedCalls > 0 ? Math.round(totalTalkTime / attendedCalls) : 0;
    const followupsCompleted = followUps.filter((f) => f.status === "Completed").length;
    const followupsPending = followUps.filter((f) => f.status === "Pending").length;
    const followupsMissed = followUps.filter((f) => f.status === "Overdue").length;
    let performanceScore = 70;
    if (totalCalls > 0 || leads.length > 0) {
      const srPart = successRate / 100 * 35;
      const crPart = Math.min(25, conversionRate / 30 * 25);
      const ttPart = Math.min(20, totalTalkTime / (timeframe === "today" ? 1800 : 7200) * 20);
      const fuPart = followupsCompleted + followupsPending > 0 ? followupsCompleted / (followupsCompleted + followupsPending + followupsMissed) * 20 : 15;
      performanceScore = Math.min(99, Math.max(45, Math.round(srPart + crPart + ttPart + fuPart)));
    }
    return {
      userId: salespersonId,
      userName: user?.name || "Sales Representative",
      email: user?.email || "",
      role: user?.role || "salesperson",
      timeframe,
      totalCalls,
      attendedCalls,
      connectedCalls,
      missedCalls,
      failedCalls,
      successfulCalls,
      unsuccessfulCalls,
      successRate,
      conversions,
      conversionRate,
      totalTalkTime,
      averageCallDuration,
      followupsCompleted,
      followupsPending,
      followupsMissed,
      performanceScore,
      assignedLeadsCount: leads.length
    };
  }
  /**
   * Computes organization-wide team metrics
   */
  static calculateTeamMetrics(timeframe = "today") {
    const salesReps = BackendDatabase.users.filter((u) => u.role === "salesperson");
    const repStats = salesReps.map((rep) => this.calculateRepMetrics(rep.id, timeframe));
    const totalCalls = repStats.reduce((acc, r) => acc + r.totalCalls, 0);
    const attendedCalls = repStats.reduce((acc, r) => acc + r.attendedCalls, 0);
    const connectedCalls = repStats.reduce((acc, r) => acc + r.connectedCalls, 0);
    const successfulCalls = repStats.reduce((acc, r) => acc + r.successfulCalls, 0);
    const unsuccessfulCalls = repStats.reduce((acc, r) => acc + r.unsuccessfulCalls, 0);
    const successRate = attendedCalls > 0 ? Math.round(successfulCalls / attendedCalls * 100) : 0;
    const conversions = repStats.reduce((acc, r) => acc + r.conversions, 0);
    const totalTalkTime = repStats.reduce((acc, r) => acc + r.totalTalkTime, 0);
    const averageCallDuration = attendedCalls > 0 ? Math.round(totalTalkTime / attendedCalls) : 0;
    const followupsCompleted = repStats.reduce((acc, r) => acc + r.followupsCompleted, 0);
    const followupsMissed = repStats.reduce((acc, r) => acc + r.followupsMissed, 0);
    const teamPerformanceScore = repStats.length > 0 ? Math.round(
      repStats.reduce((acc, r) => acc + r.performanceScore, 0) / repStats.length
    ) : 78;
    return {
      organizationId: BackendDatabase.organization.id,
      organizationName: BackendDatabase.organization.name,
      timeframe,
      totalReps: salesReps.length,
      totalCalls,
      attendedCalls,
      connectedCalls,
      successfulCalls,
      unsuccessfulCalls,
      successRate,
      conversions,
      totalTalkTime,
      averageCallDuration,
      followupsCompleted,
      followupsMissed,
      teamPerformanceScore,
      salespeople: repStats
    };
  }
};

// src/server/services/assignmentService.ts
var AssignmentService = class {
  /**
   * Evaluates all sales representatives and provides weighted AI recommendations
   * for assigning an important or HOT lead.
   */
  static getRecommendationsForLead(leadId) {
    const lead = BackendDatabase.leads.find((l) => l.id === leadId);
    const salespeople = BackendDatabase.users.filter((u) => u.role === "salesperson");
    const recommendations = salespeople.map((rep) => {
      const metrics = PerformanceService.calculateRepMetrics(rep.id, "30days");
      const liveState = BackendDatabase.liveStatus[rep.id] || {
        status: "ONLINE",
        lastActivityAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const successRateScore = Math.round(metrics.successRate / 100 * 30);
      const conversionRateScore = Math.min(25, Math.round(metrics.conversionRate / 25 * 25));
      const repLeads = BackendDatabase.leads.filter((l) => l.assignedTo === rep.id);
      const similarSourceLeads = repLeads.filter(
        (l) => lead && l.source === lead.source
      );
      const similarConversions = similarSourceLeads.filter((l) => l.status === "Converted").length;
      const similarLeadScore = similarSourceLeads.length > 0 ? Math.min(20, Math.round(similarConversions / similarSourceLeads.length * 20) + 8) : 12;
      const activeWorkload = repLeads.filter(
        (l) => l.status !== "Converted" && l.status !== "Lost"
      ).length;
      let workloadScore = 15;
      if (activeWorkload > 18) workloadScore = 6;
      else if (activeWorkload > 12) workloadScore = 10;
      else if (activeWorkload > 8) workloadScore = 13;
      else workloadScore = 15;
      let availabilityScore = 10;
      if (liveState.status === "ONLINE") availabilityScore = 10;
      else if (liveState.status === "ON_CALL") availabilityScore = 7;
      else availabilityScore = 3;
      const totalScore = Math.min(
        99,
        Math.max(
          40,
          successRateScore + conversionRateScore + similarLeadScore + workloadScore + availabilityScore
        )
      );
      let reason = `Recommended because of high ${metrics.successRate}% call success rate and strong track record with ${lead?.source || "inbound"} prospects.`;
      if (liveState.status === "ONLINE" && activeWorkload < 10) {
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
    recommendations.sort((a, b) => b.score - a.score);
    return {
      lead,
      recommendations
    };
  }
};

// src/server/services/reportExportService.ts
import * as XLSX from "xlsx";
var ReportExportService = class {
  /**
   * Generates a complete XLSX workbook buffer for a salesperson or team
   */
  static generateReport(params) {
    const { targetType, targetId, requestingUserRole, requestingUserId } = params;
    if (requestingUserRole === "salesperson" && targetId && targetId !== requestingUserId) {
      throw new Error("FORBIDDEN: You are not authorized to export another salesperson's data.");
    }
    const wb = XLSX.utils.book_new();
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toISOString().split("T")[0];
    let targetName = "Entire_Sales_Team";
    let calls = BackendDatabase.calls;
    let leads = BackendDatabase.leads;
    let followUps = BackendDatabase.followUps;
    if (targetType === "salesperson" && targetId) {
      const rep = BackendDatabase.users.find((u) => u.id === targetId);
      targetName = (rep?.name || "Salesperson").replace(/\s+/g, "_");
      calls = calls.filter((c) => c.salespersonId === targetId);
      leads = leads.filter((l) => l.assignedTo === targetId);
      followUps = followUps.filter((f) => f.salespersonId === targetId);
    }
    const totalCalls = calls.length;
    const answeredCalls = calls.filter((c) => c.status === "Answered").length;
    const successfulCalls = calls.filter(
      (c) => c.outcome === "Interested" || c.outcome === "Converted"
    ).length;
    const convertedDeals = leads.filter((l) => l.status === "Converted").length;
    const successRate = answeredCalls > 0 ? Math.round(successfulCalls / answeredCalls * 100) : 0;
    const totalTalkTimeSecs = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
    const summaryData = [
      ["SalesCall Pro Enterprise Report", "Generated: " + now.toLocaleString("en-IN")],
      ["Report Scope", targetType === "team" ? "Organization-Wide Team" : `Salesperson: ${targetName}`],
      [],
      ["Metric Name", "Metric Value", "Notes"],
      ["Total Outbound Calls Logged", totalCalls, "All dialed attempts"],
      ["Attended / Connected Calls", answeredCalls, "Spoke with customer (WebRTC)"],
      ["Successful Calls (Interested / Converted)", successfulCalls, "Positive outcome"],
      ["Unsuccessful Calls", answeredCalls - successfulCalls, "Lost or disqualified"],
      ["Call Success Rate %", `${successRate}%`, "Successful / Attended * 100"],
      ["Total Closed Won Deals", convertedDeals, "Closed contracts"],
      ["Total Talk Time (Seconds)", totalTalkTimeSecs, `${Math.floor(totalTalkTimeSecs / 60)} minutes`],
      ["Total Active Leads Assigned", leads.length, "Pipeline volume"],
      ["Scheduled Follow-ups", followUps.length, "Scheduled touchpoints"]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");
    const callRows = [
      [
        "Call ID",
        "Date & Time",
        "Sales Representative",
        "Customer Name",
        "Phone Number",
        "Duration (s)",
        "Status",
        "Outcome",
        "Outcome Reason",
        "Representative Notes"
      ],
      ...calls.map((c) => {
        const ai = BackendDatabase.aiAnalyses[c.id];
        return [
          c.id,
          c.startedAt,
          c.salespersonName,
          c.leadName,
          c.leadPhone,
          c.durationSeconds,
          c.status,
          c.outcome,
          ai?.successReason || ai?.failureReason || c.outcome,
          c.notes || ""
        ];
      })
    ];
    const wsCalls = XLSX.utils.aoa_to_sheet(callRows);
    XLSX.utils.book_append_sheet(wb, wsCalls, "Call History");
    const aiRows = [
      [
        "Call ID",
        "Customer Name",
        "AI Summary (2-Line Overview)",
        "Sentiment",
        "Customer Intent",
        "Call Quality Score (/100)",
        "Opening (/20)",
        "Discovery (/20)",
        "Product Explanation (/20)",
        "Objection Handling (/20)",
        "Closing (/20)",
        "AI Success Reason",
        "AI Failure Reason",
        "Next Recommended Action",
        "AI Confidence"
      ],
      ...calls.map((c) => {
        const ai = BackendDatabase.aiAnalyses[c.id];
        return [
          c.id,
          c.leadName,
          ai?.summary || "AI Analysis pending",
          ai?.sentiment || "Neutral",
          ai?.intent || "Information",
          ai?.callQualityScore || 70,
          ai?.qualityScoreBreakdown?.opening || 14,
          ai?.qualityScoreBreakdown?.discovery || 14,
          ai?.qualityScoreBreakdown?.productExplanation || 14,
          ai?.qualityScoreBreakdown?.objectionHandling || 14,
          ai?.qualityScoreBreakdown?.closing || 14,
          ai?.successReason || "",
          ai?.failureReason || "",
          ai?.nextAction || "",
          `${ai?.confidence || 90}%`
        ];
      })
    ];
    const wsAi = XLSX.utils.aoa_to_sheet(aiRows);
    XLSX.utils.book_append_sheet(wb, wsAi, "AI Call Insights");
    const fuRows = [
      ["Follow-up ID", "Customer Name", "Phone", "Assigned Rep", "Scheduled Date", "Time", "Status", "Priority", "Notes"],
      ...followUps.map((f) => [
        f.id,
        f.leadName,
        f.leadPhone,
        f.salespersonName,
        f.scheduledDate,
        f.scheduledTime,
        f.status,
        f.priority || "Medium",
        f.notes || ""
      ])
    ];
    const wsFu = XLSX.utils.aoa_to_sheet(fuRows);
    XLSX.utils.book_append_sheet(wb, wsFu, "Follow-ups");
    const filename = `SalesCallPro_${targetName}_${dateStr}.xlsx`;
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    BackendDatabase.logAudit({
      userId: requestingUserId,
      userName: targetName,
      userRole: requestingUserRole,
      action: "EXPORT_EXCEL_REPORT",
      resourceType: "REPORT",
      resourceId: filename,
      metadata: { targetType, targetId, rowCount: calls.length }
    });
    return { buffer, filename };
  }
};

// src/server/routes/apiRouter.ts
var apiRouter = Router();
apiRouter.use(AuthMiddleware.authenticate);
apiRouter.get("/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const userId = req.user?.id || "anonymous";
  const role = req.user?.role || "salesperson";
  RealtimeService.addClient(clientId, res, userId, role);
  res.write(
    `data: ${JSON.stringify({
      type: "CONNECTED",
      userId,
      role,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    })}

`
  );
  req.on("close", () => {
    RealtimeService.removeClient(clientId);
  });
});
apiRouter.post("/salesperson/status", (req, res) => {
  const { status, currentActivity, currentLeadId, currentLeadName, currentCallId } = req.body;
  const user = req.user;
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });
  const prev = BackendDatabase.liveStatus[user.id];
  const updated = {
    userId: user.id,
    userName: user.name,
    email: user.email,
    status: status || prev?.status || "ONLINE",
    currentActivity: currentActivity || (status === "ON_CALL" ? "On Live Call" : "Online & Ready"),
    currentLeadId: currentLeadId !== void 0 ? currentLeadId : prev?.currentLeadId,
    currentLeadName: currentLeadName !== void 0 ? currentLeadName : prev?.currentLeadName,
    currentCallId: currentCallId !== void 0 ? currentCallId : prev?.currentCallId,
    callStartedAt: status === "ON_CALL" ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
    lastActivityAt: (/* @__PURE__ */ new Date()).toISOString(),
    todayCallsCount: prev?.todayCallsCount || user.callsTodayCount || 0,
    todaySuccessRate: prev?.todaySuccessRate || 72,
    performanceScore: prev?.performanceScore || 85
  };
  BackendDatabase.liveStatus[user.id] = updated;
  RealtimeService.broadcast({
    type: status === "OFFLINE" ? "SALESPERSON_OFFLINE" : status === "ON_CALL" ? "CALL_STARTED" : "SALESPERSON_ONLINE",
    userId: user.id,
    userName: user.name,
    data: updated,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.json({ success: true, liveStatus: updated });
});
apiRouter.get("/manager/dashboard", AuthMiddleware.requireManager, (req, res) => {
  const teamMetrics = PerformanceService.calculateTeamMetrics("today");
  const liveReps = BackendDatabase.users.filter((u) => u.role === "salesperson").map((rep) => {
    const live = BackendDatabase.liveStatus[rep.id] || {
      userId: rep.id,
      status: "ONLINE",
      currentActivity: "Available",
      lastActivityAt: (/* @__PURE__ */ new Date()).toISOString(),
      todayCallsCount: 0,
      todaySuccessRate: 70
    };
    const repMetrics = PerformanceService.calculateRepMetrics(rep.id, "today");
    return {
      id: rep.id,
      name: rep.name,
      email: rep.email,
      phone: rep.phone,
      status: live.status,
      currentActivity: live.currentActivity,
      currentLeadName: live.currentLeadName,
      callStartedAt: live.callStartedAt,
      lastActivityAt: live.lastActivityAt,
      todayCalls: repMetrics.totalCalls,
      attendedCalls: repMetrics.attendedCalls,
      successfulCalls: repMetrics.successfulCalls,
      successRate: repMetrics.successRate,
      conversions: repMetrics.conversions,
      performanceScore: repMetrics.performanceScore
    };
  });
  const executiveSummary = [
    `Your sales team completed ${teamMetrics.totalCalls} calls today with a ${teamMetrics.successRate}% overall success rate across ${teamMetrics.attendedCalls} attended discussions.`,
    liveReps.length > 0 ? `${liveReps.reduce((prev, curr) => curr.successRate > prev.successRate ? curr : prev).name} currently leads team performance with a ${liveReps.reduce((prev, curr) => curr.successRate > prev.successRate ? curr : prev).successRate}% call success rate.` : `All sales representatives are synchronized.`,
    `${BackendDatabase.leads.filter((l) => l.priority === "High" && l.status === "New").length} HOT priority leads are currently awaiting first outbound contact.`
  ];
  return res.json({
    organization: BackendDatabase.organization,
    teamMetrics,
    liveTeamActivity: liveReps,
    executiveSummary,
    recentActivityLogs: BackendDatabase.activityLogs.slice(0, 20)
  });
});
apiRouter.get("/manager/team", AuthMiddleware.requireManager, (req, res) => {
  const timeframe = req.query.timeframe || "today";
  const teamMetrics = PerformanceService.calculateTeamMetrics(timeframe);
  return res.json(teamMetrics);
});
apiRouter.get("/manager/team/:salespersonId", AuthMiddleware.requireManager, (req, res) => {
  const { salespersonId } = req.params;
  const timeframe = req.query.timeframe || "30days";
  const rep = BackendDatabase.users.find((u) => u.id === salespersonId);
  if (!rep) return res.status(404).json({ error: "Salesperson not found" });
  const metrics = PerformanceService.calculateRepMetrics(salespersonId, timeframe);
  const repCalls = BackendDatabase.calls.filter((c) => c.salespersonId === salespersonId);
  const repLeads = BackendDatabase.leads.filter((l) => l.assignedTo === salespersonId);
  const repFollowUps = BackendDatabase.followUps.filter((f) => f.salespersonId === salespersonId);
  return res.json({
    salesperson: rep,
    metrics,
    calls: repCalls,
    leads: repLeads,
    followUps: repFollowUps
  });
});
apiRouter.get("/manager/analytics", AuthMiddleware.requireManager, (req, res) => {
  const timeframe = req.query.timeframe || "today";
  const metrics = PerformanceService.calculateTeamMetrics(timeframe);
  const hourlyData = [
    { hour: "09:00 AM", calls: 14, connected: 11, successful: 8, conversions: 1 },
    { hour: "10:00 AM", calls: 28, connected: 22, successful: 17, conversions: 3 },
    { hour: "11:00 AM", calls: 42, connected: 36, successful: 29, conversions: 6 },
    { hour: "12:00 PM", calls: 24, connected: 18, successful: 12, conversions: 2 },
    { hour: "01:00 PM", calls: 16, connected: 11, successful: 7, conversions: 1 },
    { hour: "02:00 PM", calls: 35, connected: 29, successful: 21, conversions: 4 },
    { hour: "03:00 PM", calls: 46, connected: 39, successful: 31, conversions: 7 },
    { hour: "04:00 PM", calls: 30, connected: 23, successful: 16, conversions: 3 },
    { hour: "05:00 PM", calls: 18, connected: 14, successful: 9, conversions: 1 }
  ];
  const weeklyData = [
    { day: "Mon", calls: 135, attended: 108, successful: 78, conversions: 12, successRate: 72 },
    { day: "Tue", calls: 152, attended: 124, successful: 91, conversions: 15, successRate: 73 },
    { day: "Wed", calls: 168, attended: 139, successful: 104, conversions: 19, successRate: 75 },
    { day: "Thu", calls: 144, attended: 118, successful: 85, conversions: 14, successRate: 72 },
    { day: "Fri", calls: 159, attended: 130, successful: 96, conversions: 16, successRate: 74 },
    { day: "Sat", calls: 45, attended: 32, successful: 21, conversions: 3, successRate: 66 },
    { day: "Sun", calls: 18, attended: 12, successful: 7, conversions: 1, successRate: 58 }
  ];
  return res.json({
    metrics,
    hourlyData,
    weeklyData
  });
});
apiRouter.get("/manager/leads/recommendation", AuthMiddleware.requireManager, (req, res) => {
  const leadId = req.query.leadId;
  if (!leadId) return res.status(400).json({ error: "leadId is required" });
  const result = AssignmentService.getRecommendationsForLead(leadId);
  return res.json(result);
});
apiRouter.post("/manager/leads/assign", AuthMiddleware.requireManager, (req, res) => {
  const { leadIds, targetSalespersonId } = req.body;
  if (!leadIds || !targetSalespersonId) {
    return res.status(400).json({ error: "leadIds and targetSalespersonId are required" });
  }
  const targetRep = BackendDatabase.users.find((u) => u.id === targetSalespersonId);
  if (!targetRep) return res.status(404).json({ error: "Target salesperson not found" });
  const updatedLeads = [];
  leadIds.forEach((id) => {
    const lead = BackendDatabase.leads.find((l) => l.id === id);
    if (lead) {
      lead.assignedTo = targetRep.id;
      lead.assignedToName = targetRep.name;
      lead.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      updatedLeads.push(lead);
      BackendDatabase.logActivity({
        userId: req.user.id,
        userName: req.user.name,
        userRole: "manager",
        action: "LEAD_ASSIGNED",
        entityType: "Lead",
        entityId: lead.id,
        entityName: lead.name,
        description: `Manager assigned lead "${lead.name}" to representative ${targetRep.name}.`
      });
    }
  });
  RealtimeService.broadcast({
    type: "LEAD_ASSIGNED",
    userId: targetRep.id,
    userName: targetRep.name,
    data: { leadIds, targetSalespersonId },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.json({ success: true, updatedLeads });
});
apiRouter.get("/sales/dashboard", (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });
  const repMetrics = PerformanceService.calculateRepMetrics(user.id, "today");
  const myLeads = BackendDatabase.leads.filter((l) => l.assignedTo === user.id);
  const myCalls = BackendDatabase.calls.filter((c) => c.salespersonId === user.id);
  const myFollowUps = BackendDatabase.followUps.filter((f) => f.salespersonId === user.id);
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const pendingFollowupsToday = myFollowUps.filter(
    (f) => f.scheduledDate === todayStr && f.status === "Pending"
  );
  const overdueFollowups = myFollowUps.filter((f) => f.status === "Overdue");
  const dailySummary = [
    `You completed ${repMetrics.totalCalls} calls today with a ${repMetrics.successRate}% connection success rate.`,
    `You converted ${repMetrics.conversions} prospects into closed deals today.`,
    `You have ${pendingFollowupsToday.length} follow-ups scheduled for today (${overdueFollowups.length} overdue).`
  ];
  return res.json({
    metrics: repMetrics,
    leads: myLeads,
    calls: myCalls.slice(0, 15),
    followUps: myFollowUps,
    dailySummary
  });
});
apiRouter.get("/sales/analytics", (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });
  const timeframe = req.query.timeframe || "today";
  const repMetrics = PerformanceService.calculateRepMetrics(user.id, timeframe);
  const hourlyData = [
    { hour: "09:00 AM", calls: 2, connected: 2, successful: 1 },
    { hour: "10:00 AM", calls: 4, connected: 3, successful: 2 },
    { hour: "11:00 AM", calls: 6, connected: 5, successful: 4 },
    { hour: "12:00 PM", calls: 3, connected: 2, successful: 1 },
    { hour: "02:00 PM", calls: 5, connected: 4, successful: 3 },
    { hour: "03:00 PM", calls: 7, connected: 6, successful: 5 },
    { hour: "04:00 PM", calls: 4, connected: 3, successful: 2 }
  ];
  const weeklyData = [
    { day: "Mon", calls: 18, connected: 14, successful: 10, conversions: 2, successRate: 71 },
    { day: "Tue", calls: 22, connected: 17, successful: 13, conversions: 3, successRate: 76 },
    { day: "Wed", calls: 25, connected: 20, successful: 15, conversions: 4, successRate: 75 },
    { day: "Thu", calls: 19, connected: 15, successful: 11, conversions: 2, successRate: 73 },
    { day: "Fri", calls: 21, connected: 16, successful: 12, conversions: 3, successRate: 75 },
    { day: "Sat", calls: 6, connected: 4, successful: 2, conversions: 0, successRate: 50 }
  ];
  return res.json({
    metrics: repMetrics,
    hourlyData,
    weeklyData
  });
});
apiRouter.get("/calls", (req, res) => {
  const user = req.user;
  let calls = BackendDatabase.calls;
  if (user.role === "salesperson") {
    calls = calls.filter((c) => c.salespersonId === user.id);
  }
  return res.json(calls);
});
apiRouter.get("/calls/:callId", (req, res) => {
  const { callId } = req.params;
  const user = req.user;
  const call = BackendDatabase.calls.find((c) => c.id === callId);
  if (!call) return res.status(404).json({ error: "Call not found" });
  if (user.role === "salesperson" && call.salespersonId !== user.id) {
    return res.status(403).json({
      error: "FORBIDDEN",
      message: "Access Denied: You cannot view calls conducted by other representatives."
    });
  }
  const recording = BackendDatabase.recordings[callId];
  const transcripts = BackendDatabase.transcripts[callId] || [];
  const aiAnalysis = BackendDatabase.aiAnalyses[callId];
  BackendDatabase.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "VIEW_CALL_DETAIL",
    resourceType: "CALL",
    resourceId: callId
  });
  return res.json({
    call,
    recording,
    transcripts,
    aiAnalysis
  });
});
apiRouter.post("/calls", async (req, res) => {
  const user = req.user;
  const { leadId, leadName, leadPhone, durationSeconds, status, outcome, notes, transcripts } = req.body;
  const newCall = {
    id: `CALL-${Date.now().toString().slice(-6)}`,
    leadId,
    leadName,
    leadPhone,
    salespersonId: user.id,
    salespersonName: user.name,
    startedAt: new Date(Date.now() - (durationSeconds || 60) * 1e3).toISOString(),
    endedAt: (/* @__PURE__ */ new Date()).toISOString(),
    durationSeconds: durationSeconds || 60,
    status: status || "Answered",
    outcome: outcome || "Interested",
    notes: notes || "Call logged via softphone",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  BackendDatabase.calls.unshift(newCall);
  const aiAnalysis = await AiCallAnalysisService.analyzeCall({
    callId: newCall.id,
    salespersonId: user.id,
    salespersonName: user.name,
    leadId,
    leadName,
    durationSeconds: newCall.durationSeconds,
    status: newCall.status,
    outcome: newCall.outcome,
    notes: newCall.notes,
    transcripts
  });
  BackendDatabase.aiAnalyses[newCall.id] = aiAnalysis;
  BackendDatabase.recordings[newCall.id] = {
    id: `rec-${newCall.id}`,
    organizationId: BackendDatabase.organization.id,
    callId: newCall.id,
    storagePath: `recordings/2026/08/${newCall.id}.wav`,
    durationSeconds: newCall.durationSeconds,
    audioUrl: `https://actions.google.com/sounds/v1/telecommunications/phone_dial_tone.ogg`,
    audioChannels: 2,
    mimeType: "audio/wav",
    fileSizeBytes: 18e5,
    createdAt: newCall.createdAt
  };
  const lead = BackendDatabase.leads.find((l) => l.id === leadId);
  if (lead) {
    if (outcome === "Converted") lead.status = "Converted";
    else if (outcome === "Interested") lead.status = "Interested";
    else if (outcome === "Follow-up Required") lead.status = "Follow-up";
    else if (outcome === "Not Interested") lead.status = "Not Interested";
    lead.lastContactedAt = newCall.createdAt;
    lead.updatedAt = newCall.createdAt;
  }
  BackendDatabase.liveStatus[user.id] = {
    userId: user.id,
    status: "ONLINE",
    currentActivity: "Call completed & logged",
    lastActivityAt: (/* @__PURE__ */ new Date()).toISOString(),
    todayCallsCount: (BackendDatabase.liveStatus[user.id]?.todayCallsCount || 0) + 1,
    todaySuccessRate: 75
  };
  BackendDatabase.logActivity({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "CALL_ENDED",
    entityType: "Call",
    entityId: newCall.id,
    entityName: leadName,
    description: `Completed ${newCall.durationSeconds}s call with ${leadName}. Outcome: ${newCall.outcome}`
  });
  RealtimeService.broadcast({
    type: "CALL_ENDED",
    userId: user.id,
    userName: user.name,
    leadId,
    leadName,
    callId: newCall.id,
    data: { call: newCall, aiAnalysis },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.status(201).json({
    call: newCall,
    aiAnalysis
  });
});
apiRouter.get("/reports/export", (req, res) => {
  const user = req.user;
  const targetType = req.query.type || "team";
  const targetId = req.query.salespersonId;
  try {
    const { buffer, filename } = ReportExportService.generateReport({
      targetType: user.role === "salesperson" ? "salesperson" : targetType,
      targetId: user.role === "salesperson" ? user.id : targetId,
      requestingUserRole: user.role,
      requestingUserId: user.id
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err) {
    return res.status(403).json({ error: err.message || "Export error" });
  }
});

// server.ts
import dotenv from "dotenv";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(express.json());
app.use("/api", apiRouter);
var distPath = path.resolve(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(PORT, () => {
  console.log(`SalesCall Pro fullstack server running on port ${PORT}`);
});
