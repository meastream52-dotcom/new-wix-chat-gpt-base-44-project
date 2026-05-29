import { chat } from "@/lib/openai";
import { z } from "zod";

const ExtractionSchema = z.object({
  fields: z.array(z.object({
    fieldName: z.string(),
    fieldValue: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  documentType: z.string(),
  summary: z.string(),
});

export type ExtractionResult = z.infer<typeof ExtractionSchema>;

export async function extractDocumentData(
  text: string,
  fileName: string
): Promise<ExtractionResult> {
  if (process.env.MOCK_MODE === "true") {
    return {
      documentType: "Contract",
      summary: "Service contract document with client details and payment terms.",
      fields: [
        { fieldName: "Document Type", fieldValue: "Service Contract", confidence: 0.95 },
        { fieldName: "Date", fieldValue: new Date().toISOString().split("T")[0], confidence: 0.9 },
        { fieldName: "Amount", fieldValue: "$0.00", confidence: 0.85 },
      ],
    };
  }

  const truncated = text.slice(0, 8000);
  const result = await chat(
    `You are a document data extraction expert. Extract all important fields from business documents including: names, dates, amounts, addresses, contract terms, action items, phone numbers, email addresses, and any other relevant data. Return JSON only.`,
    `Document: "${fileName}"\n\nContent:\n${truncated}\n\nExtract all important fields. Return JSON: { documentType: string, summary: string, fields: [{ fieldName, fieldValue, confidence (0-1) }] }`,
    true
  );

  try {
    return ExtractionSchema.parse(JSON.parse(result));
  } catch {
    return {
      documentType: "Unknown",
      summary: "Could not fully parse document.",
      fields: [],
    };
  }
}
