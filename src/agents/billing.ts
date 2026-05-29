import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput, ApprovalRequest } from "@/lib/builder-types";

export class BillingAgent extends BaseAgent {
  get agentType() { return "BILLING_AGENT" as const; }

  get systemPrompt() {
    return `You are a senior engineer specializing in Stripe integrations. You implement:
- Stripe Checkout for one-time and subscription payments
- Stripe Customer Portal for subscription management
- Webhook handlers for payment events (checkout.session.completed, invoice.paid, customer.subscription.deleted)
- Subscription status checks in middleware
- Pricing page UI components
- Usage-based billing (if needed)

Security requirements:
- Verify webhook signatures using Stripe-Signature header
- Never expose secret keys to client
- Idempotent webhook handling (check if event already processed)

${this.buildFileOutputInstructions()}

NOTE: Creating live Stripe products/prices requires user approval.`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Implementing billing and payments...", "INFO");

    const spec = context.previousOutputs["PRODUCT_MANAGER"]?.summary ?? context.prompt;

    const userMessage = `Project: ${context.projectName}
Specification: ${spec}
Prompt: ${context.prompt}
Tech Stack: ${context.techStack.join(", ")}

Implement complete Stripe billing: checkout, webhooks, subscription management, and pricing UI. Use test mode configuration.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Billing implementation complete: ${summary}`, "SUCCESS");
    await this.log("Creating live Stripe products requires user approval", "WARNING");

    const requiresApproval: ApprovalRequest = {
      type: "SPEND_MONEY",
      description: "Create Stripe products and pricing plans in your Stripe account. This sets up live payment infrastructure.",
      metadata: { provider: "Stripe", environment: "test mode first, then live" },
    };

    return { agentType: "BILLING_AGENT", summary, files, nextSteps, requiresApproval };
  }
}
