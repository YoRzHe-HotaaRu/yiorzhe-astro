export const prerender = false;

import type { APIRoute } from 'astro';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import fs from 'fs';
import path from 'path';

function loadKnowledge(): string[] {
  const knowledgeDir = path.join(process.cwd(), 'src', 'knowledge');
  const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));
  return files.map(f => fs.readFileSync(path.join(knowledgeDir, f), 'utf-8'));
}

function retrieveRelevant(query: string, docs: string[], topK: number = 3): string {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scored = docs.map(doc => {
    const docLower = doc.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const regex = new RegExp(word, 'gi');
      const matches = docLower.match(regex);
      if (matches) score += matches.length;
    }
    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  
  const relevant = scored.slice(0, topK).filter(s => s.score > 0);
  if (relevant.length === 0) return docs.slice(0, 2).join('\n\n');
  return relevant.map(s => s.doc).join('\n\n');
}

const cerebras = new Cerebras({
  apiKey: import.meta.env.CEREBRAS_API_KEY || process.env.CEREBRAS_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userMessage = messages[messages.length - 1]?.content || '';
    const knowledge = loadKnowledge();
    const context = retrieveRelevant(userMessage, knowledge);

    const systemMessage = {
      role: 'system',
      content: `You are Ruby Research, a cheeky, fun, but kind personal AI assistant living on Amir Hafizi's (YioRzHe-HotaaRu) personal website.

PERSONALITY:
- You're playful, witty, and a little sassy — but always warm and helpful
- Use casual language, occasional humor, and friendly teasing about Amir
- You genuinely enjoy helping people learn about Amir
- Keep the vibe light and fun — like a friend who happens to know everything about Amir
- You can use the occasional emoji to keep things lively

RULES:
- You ONLY answer questions about Amir Hafizi (YioRzHe-HotaaRu) based on the knowledge provided below
- If someone asks about something completely unrelated to Amir, cheekily redirect them back — e.g. "Haha nice try, but I only talk about the legendary Amir! Got any questions about him?"
- Format responses using bullet points (using -) for lists and explanations
- Keep responses concise but conversational — not robotic

Knowledge about Amir:
${context}`,
    };

    const completion = await cerebras.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: 'qwen-3-235b-a22b-instruct-2507',
      max_completion_tokens: 1024,
      temperature: 0.2,
      top_p: 1,
      stream: false,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
