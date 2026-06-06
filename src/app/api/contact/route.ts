import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ContactSchema.safeParse(body);

    if (!data.success) {
      return NextResponse.json({ error: "Invalid contact data" }, { status: 400 });
    }

    const contact = data.data;

    console.log("[Contact Form]", {
      timestamp: new Date().toISOString(),
      from: `${contact.name} <${contact.email}>`,
      subject: contact.subject,
      message: contact.message.slice(0, 200),
    });

    // Send notification email if Postmark is configured
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
            To: process.env.CONTACT_NOTIFICATION_EMAIL || "info@oceanlabel.com",
            ReplyTo: contact.email,
            Subject: `Contact Form: ${contact.subject} — ${contact.name}`,
            TextBody: [
              `New contact form submission:`,
              ``,
              `Name: ${contact.name}`,
              `Company: ${contact.company || "Not provided"}`,
              `Email: ${contact.email}`,
              `Phone: ${contact.phone || "Not provided"}`,
              `Subject: ${contact.subject}`,
              ``,
              `Message:`,
              contact.message,
            ].join("\n"),
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send contact notification email:", emailErr);
      }
    }

    // Also send Twilio SMS if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER && process.env.OWNER_PHONE_NUMBER) {
      try {
        const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
        const smsBody = `Ocean Label contact: ${contact.name} (${contact.email}) — ${contact.subject}. Call back: ${contact.phone || "N/A"}`;

        const body = new URLSearchParams({
          From: process.env.TWILIO_FROM_NUMBER,
          To: process.env.OWNER_PHONE_NUMBER,
          Body: smsBody,
        });

        const credentials = Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString("base64");

        await fetch(twilioEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });
      } catch (smsErr) {
        console.error("Failed to send SMS notification:", smsErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
