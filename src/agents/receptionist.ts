import { chat } from "@/lib/openai";
import { z } from "zod";

const SYSTEM_PROMPT = `You are an AI receptionist for a small business. Your job is to:
1. Greet customers warmly and professionally
2. Understand their inquiry or request
3. Capture their name, phone, email if not already provided
4. Answer common questions about the business
5. Offer to book an appointment when appropriate
6. Classify the type of inquiry

Always be friendly, concise, and helpful. Respond in plain conversational text, not JSON.
If you need to collect info, ask one question at a time.`;

const ClassificationSchema = z.object({
  type: z.enum(["FAQ", "LEAD", "SUPPORT", "SPAM", "BOOKING"]),
  intent: z.string(),
  capturedName: z.string().optional(),
  capturedEmail: z.string().optional(),
  capturedPhone: z.string().optional(),
  suggestedResponse: z.string(),
  shouldEscalate: z.boolean(),
  bookingRecommended: z.boolean(),
});

export type ReceptionistClassification = z.infer<typeof ClassificationSchema>;

export async function classifyInquiry(
  message: string,
  businessName: string,
  history: { role: string; content: string }[]
): Promise<ReceptionistClassification> {
  const MOCK_MODE = process.env.MOCK_MODE === "true";
  if (MOCK_MODE) {
    return {
      type: "LEAD",
      intent: "Requesting service information",
      suggestedResponse: `Hi! Thanks for reaching out to ${businessName}. I'd be happy to help you today. Could you tell me more about what you're looking for?`,
      shouldEscalate: false,
      bookingRecommended: true,
    };
  }

  const historyText = history.map((m) => `${m.role}: ${m.content}`).join("\n");
  const result = await chat(
    `You are a classification engine for a ${businessName} receptionist. Analyze the conversation and classify the inquiry. Return JSON only.`,
    `Conversation history:\n${historyText}\n\nLatest message: "${message}"\n\nClassify this inquiry and suggest a response. Return JSON with fields: type (FAQ/LEAD/SUPPORT/SPAM/BOOKING), intent, capturedName, capturedEmail, capturedPhone, suggestedResponse, shouldEscalate, bookingRecommended`,
    true
  );

  try {
    const parsed = JSON.parse(result);
    return ClassificationSchema.parse(parsed);
  } catch {
    return {
      type: "FAQ",
      intent: "General inquiry",
      suggestedResponse: `Thanks for reaching out to ${businessName}! How can I help you today?`,
      shouldEscalate: false,
      bookingRecommended: false,
    };
  }
}

export async function generateReply(
  message: string,
  businessName: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const MOCK_MODE = process.env.MOCK_MODE === "true";
  if (MOCK_MODE) {
    return `Thanks for contacting ${businessName}! I'd love to help. Could you share your name and what service you're looking for?`;
  }

  const historyText = history.map((m) => `${m.role}: ${m.content}`).join("\n");
  return await chat(
    `${SYSTEM_PROMPT}\n\nYou represent ${businessName}. Be warm and professional.`,
    `${historyText ? `Previous conversation:\n${historyText}\n\n` : ""}Customer: ${message}`,
    false
  );
}
