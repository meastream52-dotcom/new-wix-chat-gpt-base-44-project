import { chat } from "@/lib/openai";

export async function answerFromKnowledgeBase(
  question: string,
  modules: { title: string; content: string }[],
  businessName: string
): Promise<string> {
  if (process.env.MOCK_MODE === "true") {
    return `Based on the training materials for ${businessName}, here's what I found: This topic is covered in our onboarding materials. Please review the relevant module for detailed guidance. If you need further clarification, contact your supervisor.`;
  }

  const context = modules
    .map((m) => `## ${m.title}\n${m.content.slice(0, 2000)}`)
    .join("\n\n");

  return await chat(
    `You are a training assistant for ${businessName}. Answer employee questions based on the provided knowledge base. Be clear, specific, and cite which training module your answer comes from. If the answer isn't in the materials, say so honestly.`,
    `Knowledge Base:\n${context}\n\nEmployee Question: ${question}`,
    false
  );
}

export async function generateLesson(
  topic: string,
  businessName: string,
  existingContext?: string
): Promise<{ title: string; content: string }> {
  if (process.env.MOCK_MODE === "true") {
    return {
      title: `Training Module: ${topic}`,
      content: `# ${topic}\n\n## Overview\nThis module covers ${topic} for ${businessName} employees.\n\n## Key Points\n1. Always follow company procedures\n2. When in doubt, ask your supervisor\n3. Document everything\n\n## Summary\nRemember: safety, professionalism, and attention to detail are our core values.`,
    };
  }

  const result = await chat(
    `You are a corporate trainer creating employee training materials for ${businessName}. Write comprehensive, practical training content in Markdown format.`,
    `Create a training module on: "${topic}"\n${existingContext ? `\nBusiness context: ${existingContext}` : ""}\n\nWrite a complete training module with: title, overview, key learning points (numbered), practical guidelines, and a summary. Use Markdown. Aim for 300-500 words.`,
    false
  );

  const titleMatch = result.match(/^#\s+(.+)$/m);
  return {
    title: titleMatch ? titleMatch[1] : topic,
    content: result,
  };
}
