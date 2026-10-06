import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let message: unknown;
  try {
    message = (await req.json())?.message;
  } catch {
    return NextResponse.json({ reply: 'Invalid request.' }, { status: 400 });
  }
  if (typeof message !== 'string' || !message.trim() || message.length > 4000) {
    return NextResponse.json({ reply: 'Please enter a message of up to 4,000 characters.' }, { status: 400 });
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: 'The travel assistant is not configured yet.' }, { status: 503 });
  }
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-OpenRouter-Title': 'Travel',
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openrouter/auto',
        messages: [
          { role: 'system', content: 'You are a friendly travel assistant for Travel. Help with destinations, itineraries, and travel tips. Reply concisely in the same language as the user. Do not invent current prices, visa rules, or booking availability.' },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 600,
      }),
    });
    if (!response.ok) {
      const reply = response.status === 401 || response.status === 403
        ? 'The assistant API key was rejected. Please check its configuration.'
        : response.status === 402
          ? 'The assistant account needs OpenRouter credits.'
          : response.status === 429
            ? 'The assistant is busy. Please try again shortly.'
            : 'The assistant service is temporarily unavailable.';
      return NextResponse.json({ reply }, { status: response.status === 429 ? 429 : 503 });
    }
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return NextResponse.json({ reply: 'The assistant returned no answer. Please try again.' }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: 'Could not connect to the assistant. Please try again.' }, { status: 503 });
  }
}
