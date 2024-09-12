// pages/api/calendar.js

import { google } from 'googleapis';
import { getSession } from 'next-auth/react';
import { Configuration, OpenAIApi } from 'openai';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Google Calendar API Integration
async function getCalendarEvents(auth, dateRange) {
  const calendar = google.calendar({ version: 'v3', auth });
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: dateRange.start, // Start of range
    timeMax: dateRange.end,   // End of range
    singleEvents: true,
    orderBy: 'startTime',
  });
  return events.data.items;
}

// OpenAI Integration
async function getAiResponse(query) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: 'gpt-4',
    prompt: query,
    max_tokens: 100,
  });
  return response.data.choices[0].text.trim();
}

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { query } = req.body;  // User query from chatbot
  const authToken = session.accessToken;  // Google OAuth token from session
  
  oauth2Client.setCredentials({ access_token: authToken });

  try {
    // Process AI query to determine calendar action
    const aiResponse = await getAiResponse(query);

    // Example: Parse AI response for action, here it can read or write to the calendar
    const events = await getCalendarEvents(oauth2Client, { start: new Date().toISOString(), end: new Date().toISOString() });
    res.status(200).json({ aiResponse, events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
