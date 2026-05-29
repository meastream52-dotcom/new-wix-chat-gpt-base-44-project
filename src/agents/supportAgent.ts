import { chat } from "@/lib/openai";
import { z } from "zod";

const TriageSchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  category: z.string(),
  draftResponse: z.string(),
  shouldEscalate: z.boolean(),
  estimatedResolutionTime: z.string(),
});

export type TriageResult = z.infer<typeof TriageSchema>;

export async function triageAndRespond(
  message: string,
  businessName: string,
  history: { role: string; content: string }[]
): Promise<string> {
  if (process.env.MOCK_MODE === "true") {
    return `Thank you for contacting ${businessName} support! I've received your message and will help you right away. Our team typically responds within 2 hours during business hours. Is there anything else you can share to help us resolve this faster?`;
  }

  const historyText = history.map((m) => `${m.role}: ${m.content}`).join("\n");
  return await chat(
    `You are a helpful customer support agent for ${businessName}. Be empathetic, professional, and solution-focused. Provide clear, actionable responses.`,
    `${historyText ? `Conversation history:\n${historyText}\n\n` : ""}Customer message: ${message}`,
    false
  );
}

export async function triageTicket(ticket: {
  subject: string;
  body: string;
  customerName?: string;
}, businessName: string): Promise<TriageResult> {
  if (process.env.MOCK_MODE === "true") {
    return {
      priority: "MEDIUM",
      category: "general",
      draftResponse: `Hi ${ticket.customerName ?? "there"},\n\nThank you for contacting ${businessName}. We've received your request regarding "${ticket.subject}" and will get back to you within 24 hours.\n\nBest,\n${businessName} Support`,
      shouldEscalate: false,
      estimatedResolutionTime: "1-2 business days",
    };
  }

  const result = await chat(
    `You are a support ticket triage expert for ${businessName}. Analyze tickets and return JSON.`,
    `Triage this support ticket:\nSubject: ${ticket.subject}\nMessage: ${ticket.body}\nCustomer: ${ticket.customerName ?? "Unknown"}\n\nReturn JSON: priority (LOW/MEDIUM/HIGH/URGENT), category (billing/technical/general/complaint), draftResponse, shouldEscalate, estimatedResolutionTime`,
    true
  );

  try {
    return TriageSchema.parse(JSON.parse(result));
  } catch {
    return {
      priority: "MEDIUM",
      category: "general",
      draftResponse: `Hi, thank you for reaching out to ${businessName}. We've received your request and will follow up shortly.`,
      shouldEscalate: false,
      estimatedResolutionTime: "1-2 business days",
    };
  }
}
