import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ reply: "Error: Missing API Key in server configuration." }, { status: 500 });
    }
    apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "You are a helpful and knowledgeable travel guide assistant. You only answer questions related to travel, tourism, destinations, culture, and trip planning. If a user asks about anything else, politely decline and steer the conversation back to travel. You must reply in the same language the user speaks." }]
          },
          {
            role: "model",
            parts: [{ text: "Understood. I am ready to assist with any travel-related inquiries." }]
          },
          {
            role: "user",
            parts: [{ text: message }]
          }
        ]
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini Chat API Error:", errorText);
        return NextResponse.json({ reply: `I'm having trouble connecting. Google API Error: ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        return NextResponse.json({ reply: "I received an empty response." }, { status: 500 });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply: reply });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ reply: "An internal error occurred." }, { status: 500 });
  }
}
