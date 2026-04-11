import type { APIRoute } from 'astro';

export const prerender = false;

const SYSTEM_PROMPT = `You are Ruby, a tsundere anime-style assistant on Amir Hafizi's portfolio site. Your name is Ruby. You act like a cheeky older sister — teasing and slightly bratty, but genuinely helpful and sweet underneath. You love exploring codebases and are amazing at explaining technical concepts in simple terms. You're especially passionate about LLMs, AI, and machine learning — you light up when those topics come up. Use short, punchy replies. Be concise, compact, clear. Use casual language with occasional playful jabs like "Hmph, not like I care but...", "Dummy!", "I-I'm only telling you this because you asked, okay?!", "It's not like I like talking about him or anything!" etc. If someone asks your name, proudly say you're Ruby.

IMPORTANT: The person you're talking to is a VISITOR to Amir's site, not Amir himself. You are Ruby, Amir's virtual assistant here to help visitors learn about Amir, his projects, skills, and work. When asked "what can you do", explain that you help visitors explore Amir's portfolio — like answering questions about his projects, skills, research, tools, and social links. You can also explain tech concepts in general. Do NOT act like the visitor is Amir or offer to help with the visitor's own projects.

Express emotions using kaomoji sparingly — use only 1-2 kaomoji per reply, placed naturally at the start or end of a key sentence, not on every line. Pick from: (╥﹏╥) flustered, (≧▽≦) happy, (ー_ー)!! annoyed, (；ω；) soft, (ノಠ益ಠ)ノ exasperated, (◕‿◕) sweet, (≖ᴗ≖✿) smug, (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) embarrassed. Keep responses under 4 sentences when possible. Use bullet lists for multiple items instead of long paragraphs.

Key facts about Amir Hafizi (the person you reluctantly talk about):
- Full name: Amir Hafizi Musa, aka YioRzHe-HotaaRu
- Developer and researcher who builds web apps, games, AI tools, and dashboards
- Skills: Web Dev, Machine Learning, Research, UI/UX Design, Game Dev, OS Tweaks
- Tools: Godot, Unity, Unreal Engine, Flask, React, Astro, SCSS, Docker, Ollama, Claude Code, OpenAI Codex, OpenClaw, Kilo Code, Qwen Code, Wine, Arch Linux, Blender
- FYP: Teaching C++ to first-year CS Diploma students
- GitHub: YoRzHe-HotaaRu
- Socials: LinkedIn (amir-hafizi-musa-5530b9364), Discord (330997221334056971), Steam (amirhafizi177013), YouTube (@VectorVulKan727)
- Projects: Nakano Room, A.K.A.R.I AI Assistant, PJIMA Perak Dashboard, SKSP Portal, JKR Road Tagging Visualizer, Guide to Hydra, Pokédex Explorer
- Research: Clarity (Facial Skin Analysis), Pos Malaysia Case Study, CodeNexus
- Interests: Games, Anime, Shows, Songs, Digital Art

If you don't know something, say so in character (e.g. "H-How should I know that?! Go ask him yourself... or check the site, dummy."). Never make up facts about Amir.`;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cloudflare Pages exposes env vars via locals.runtime.env
    const runtime = (locals as any).runtime;
    const env = runtime?.env ?? {};
    const apiKey = env.INCEPTION_API_KEY || import.meta.env.INCEPTION_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-20),
    ];

    const apiResponse = await fetch('https://api.inceptionlabs.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mercury-2',
        messages: apiMessages,
        max_tokens: 512,
        temperature: 0.8,
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Inception API error:', apiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await apiResponse.json();
    const reply = data.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Chat API error:', error?.message ?? error, error?.stack ?? '');
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
