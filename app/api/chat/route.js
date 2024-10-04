import { NextResponse } from 'next/server';

export async function POST(request) {
  const { message } = await request.json();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // or 'gpt-4' if you have access
        messages: [
          {
            role: 'system',
            content: 'You are a helpful calendar assistant meant to sort through the calendar, answer any questions about events, suggest how to plan future events, and make direct changes to the calendar.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(errorData.error.message || 'Failed to fetch from OpenAI');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
