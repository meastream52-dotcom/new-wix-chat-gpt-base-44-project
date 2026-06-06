import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const QuoteSchema = z.object({
  // Label specs
  material: z.string(),
  shape: z.string(),
  widthIn: z.number().min(0.5).max(24),
  heightIn: z.number().min(0.5).max(24),
  quantity: z.number().min(1),
  colors: z.number().min(1).max(5),
  finish: z.string(),
  hasBarcode: z.boolean(),
  hasVariableData: z.boolean(),
  isReorder: z.boolean(),
  // Contact info
  name: z.string().min(1),
  company: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  // Estimate
  estimatedTotal: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = QuoteSchema.safeParse(body);

    if (!data.success) {
      return NextResponse.json({ error: "Invalid quote data" }, { status: 400 });
    }

    const quote = data.data;

    // Log the quote request (in production, save to DB and send email notification)
    console.log("[Quote Request]", {
      timestamp: new Date().toISOString(),
      contact: `${quote.name} <${quote.email}> — ${quote.company}`,
      specs: `${quote.quantity}x ${quote.widthIn}"×${quote.heightIn}" ${quote.material}, ${quote.colors}-color, ${quote.finish}`,
      estimate: quote.estimatedTotal,
    });

    // TODO: In production:
    // 1. Save to PostgreSQL Quote table via Prisma
    // 2. Send notification email to info@oceanlabel.com via Postmark/Resend
    // 3. Send confirmation email to the requester
    // 4. Optionally create a QuickBooks estimate

    // For now, send a notification email if POSTMARK_TOKEN is set
    if (process.env.POSTMARK_TOKEN) {
      try {
        await fetch("https://api.postmarkapp.com/email", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
          },
          body: JSON.stringify({
            From: process.env.POSTMARK_FROM_EMAIL || "noreply@oceanlabel.com",
            To: process.env.QUOTE_NOTIFICATION_EMAIL || "info@oceanlabel.com",
            Subject: `New Quote Request: ${quote.name} — ${quote.company}`,
            TextBody: [
              `New quote request from the website:`,
              ``,
              `Name: ${quote.name}`,
              `Company: ${quote.company}`,
              `Email: ${quote.email}`,
              `Phone: ${quote.phone || "Not provided"}`,
              ``,
              `Label Specs:`,
              `  Material: ${quote.material}`,
              `  Shape: ${quote.shape}`,
              `  Size: ${quote.widthIn}" × ${quote.heightIn}"`,
              `  Quantity: ${quote.quantity.toLocaleString()}`,
              `  Colors: ${quote.colors}`,
              `  Finish: ${quote.finish}`,
              `  Barcode: ${quote.hasBarcode ? "Yes" : "No"}`,
              `  Variable Data: ${quote.hasVariableData ? "Yes" : "No"}`,
              `  Reorder: ${quote.isReorder ? "Yes" : "No"}`,
              ``,
              quote.notes ? `Notes: ${quote.notes}` : "",
            ].join("\n"),
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send quote notification email:", emailErr);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, message: "Quote request received." });
  } catch (err) {
    console.error("Quote API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  // TODO: Return saved quote requests (admin-only, requires auth)
  return NextResponse.json({ quotes: [] });
}
