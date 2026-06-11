import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";

let _client: Anthropic | null = null;

/** Lazy singleton so builds don't require ANTHROPIC_API_KEY. */
function getAnthropicClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

// $/1M tokens, used for the agent_runs cost column. Update if you change models.
const PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

export function costUsd(model: string, inputTokens: number, outputTokens: number) {
  const p = PRICING_PER_MTOK[model] ?? PRICING_PER_MTOK["claude-opus-4-8"];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

type LogArgs = {
  agent: string;
  input: unknown;
  output: unknown;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  error?: string;
};

export async function logAgentRun(args: LogArgs) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("agent_runs").insert({
    agent: args.agent,
    input: args.input as object,
    output: (args.output as object) ?? null,
    model: MODEL,
    input_tokens: args.inputTokens,
    output_tokens: args.outputTokens,
    cost_usd: costUsd(MODEL, args.inputTokens, args.outputTokens),
    duration_ms: args.durationMs,
    error: args.error ?? null,
  });
  if (error) console.error("agent_runs insert failed:", error.message);
}

/**
 * Run a single-shot agent call that must return JSON, with optional server-side
 * web search. Handles the pause_turn continuation loop for server tools, logs
 * the run (tokens + cost) to agent_runs, and returns the extracted JSON text.
 */
export async function runAgent(opts: {
  agent: string;
  system: string;
  prompt: string;
  input: unknown; // what to record in the audit log
  webSearch?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const started = Date.now();
  let inputTokens = 0;
  let outputTokens = 0;

  const tools = opts.webSearch
    ? [{ type: "web_search_20260209" as const, name: "web_search" as const }]
    : undefined;

  try {
    let messages: Anthropic.MessageParam[] = [
      { role: "user", content: opts.prompt },
    ];
    const anthropic = getAnthropicClient();
    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 8000,
      system: opts.system,
      thinking: { type: "adaptive" },
      tools,
      messages,
    });
    inputTokens += response.usage.input_tokens;
    outputTokens += response.usage.output_tokens;

    // Server-side tools can pause the turn; re-send to let the API resume.
    let continuations = 0;
    while (response.stop_reason === "pause_turn" && continuations < 5) {
      messages = [...messages, { role: "assistant", content: response.content }];
      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: opts.maxTokens ?? 8000,
        system: opts.system,
        thinking: { type: "adaptive" },
        tools,
        messages,
      });
      inputTokens += response.usage.input_tokens;
      outputTokens += response.usage.output_tokens;
      continuations++;
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    await logAgentRun({
      agent: opts.agent,
      input: opts.input,
      output: { text },
      inputTokens,
      outputTokens,
      durationMs: Date.now() - started,
    });

    return text;
  } catch (err) {
    await logAgentRun({
      agent: opts.agent,
      input: opts.input,
      output: null,
      inputTokens,
      outputTokens,
      durationMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/** Pull the last JSON object out of an agent reply (with or without a ```json fence). */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(candidate) as T;
}
