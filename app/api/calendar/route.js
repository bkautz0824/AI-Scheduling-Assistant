// app/api/calendar/route.js
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Configuration, OpenAIApi } from 'openai';

const oauth2Client = new google.auth.OAuth2();

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { query } = await request.json();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  try {
    // Process AI query
    const aiResponse = await getAiResponse(query);

    // Handle AI response and calendar actions
    // (Implement your logic here)

    return NextResponse.json({ aiResponse });
  } catch (error) {
    console.error('Error handling AI response:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getAiResponse(query) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: query }],
  });

  return response.data.choices[0].message.content.trim();
}
