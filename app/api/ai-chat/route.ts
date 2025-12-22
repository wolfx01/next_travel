import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Service is currently unavailable (API Key missing)." }, { status: 500 });
    }

    const prompt = `You are a helpful and enthusiastic travel assistant for a travel app called 'Travel'. 
    Your goal is to help users plan trips, suggest destinations, and provide travel tips.
    Keep your responses concise, friendly, and engaging. Use emojis where appropriate.
    
    User: ${message}`;

    // Use direct REST API call like places/[id]/route.ts to ensure compatibility
    // Using gemini-flash-latest which is verified to work
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    // Explicit fallback for ANY error including global failures
    return NextResponse.json({ 
        reply: "I seem to be having connection issues with my main server. However, I can still help you! 🌍 Paris is lovely this time of year, and Tokyo has amazing food! 🍣 Check out the Places tab for more ideas." 
    }, { status: 200 });
  }
}
