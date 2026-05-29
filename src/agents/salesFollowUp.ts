import { chat } from "@/lib/openai";
import { z } from "zod";

const QualificationSchema = z.object({
  score: z.number().min(0).max(1),
  tier: z.enum(["HOT", "WARM", "COLD", "UNQUALIFIED"]),
  reason: z.string(),
  recommendedNextStep: z.string(),
  estimatedValue: z.number().optional(),
});

const EmailDraftSchema = z.object({
  subject: z.string(),
  body: z.string(),
  tone: z.enum(["FORMAL", "CASUAL", "URGENT"]),
});

export type LeadQualification = z.infer<typeof QualificationSchema>;
export type EmailDraft = z.infer<typeof EmailDraftSchema>;

export async function qualifyLead(lead: {
  name: string;
  company?: string;
  source?: string;
  notes?: string;
  value?: number;
}, businessName: string): Promise<LeadQualification> {
  if (process.env.MOCK_MODE === "true") {
    return {
      score: 0.75,
      tier: "WARM",
      reason: "Lead came from a referral with a stated budget range.",
      recommendedNextStep: "Schedule a discovery call within 24 hours.",
    };
  }

  const result = await chat(
    `You are a sales qualification expert for ${businessName}. Evaluate leads and return JSON.`,
    `Evaluate this lead:\nName: ${lead.name}\nCompany: ${lead.company ?? "N/A"}\nSource: ${lead.source ?? "Unknown"}\nNotes: ${lead.notes ?? "None"}\nEstimated Value: ${lead.value ? "$" + lead.value : "Unknown"}\n\nReturn JSON: score (0-1), tier (HOT/WARM/COLD/UNQUALIFIED), reason, recommendedNextStep, estimatedValue`,
    true
  );

  try {
    return QualificationSchema.parse(JSON.parse(result));
  } catch {
    return {
      score: 0.5,
      tier: "WARM",
      reason: "Insufficient data to fully qualify.",
      recommendedNextStep: "Reach out to gather more information.",
    };
  }
}

export async function draftFollowUpEmail(lead: {
  name: string;
  company?: string;
  notes?: string;
}, businessName: string, stage: string): Promise<EmailDraft> {
  if (process.env.MOCK_MODE === "true") {
    return {
      subject: `Following up on your inquiry - ${businessName}`,
      body: `Hi ${lead.name},\n\nThank you for your interest in ${businessName}! I wanted to follow up on your recent inquiry and see if you had any questions.\n\nWe'd love to schedule a quick call to discuss how we can help. Are you available this week?\n\nBest regards,\nThe ${businessName} Team`,
      tone: "CASUAL",
    };
  }

  const result = await chat(
    `You are a sales copywriter for ${businessName}. Write concise, professional follow-up emails. Return JSON only.`,
    `Write a follow-up email for:\nLead: ${lead.name} (${lead.company ?? "individual"})\nDeal Stage: ${stage}\nContext: ${lead.notes ?? "General inquiry"}\n\nReturn JSON: subject, body (plain text, 3-4 short paragraphs), tone (FORMAL/CASUAL/URGENT)`,
    true
  );

  try {
    return EmailDraftSchema.parse(JSON.parse(result));
  } catch {
    return {
      subject: `Following up - ${businessName}`,
      body: `Hi ${lead.name},\n\nThank you for your interest. Let's connect to discuss your needs.\n\nBest,\n${businessName}`,
      tone: "CASUAL",
    };
  }
}
