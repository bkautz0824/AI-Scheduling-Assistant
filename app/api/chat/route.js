import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(request) {
  const { message } = await request.json();

  try {
    const response = await fetch('https://api.openai.com/v1/assistants/asst_3X3nR0EPb6n07ChK8Jl58sYv/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: message, // Adjust based on Assistants API requirements
        // Include any additional parameters as needed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'Failed to fetch from OpenAI');
    }

    const data = await response.json();
    const reply = data.choices[0].text.trim(); // Adjust based on Assistants API response structure

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
