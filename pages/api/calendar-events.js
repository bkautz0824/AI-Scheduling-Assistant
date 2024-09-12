// pages/api/calendar-events.js

import { google } from 'googleapis';
import { getSession } from 'next-auth/react';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function getCalendarEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),  // Fetch events starting today
    singleEvents: true,
    orderBy: 'startTime',
  });
  return events.data.items;
}

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const authToken = session.accessToken;
  oauth2Client.setCredentials({ access_token: authToken });

  try {
    const events = await getCalendarEvents(oauth2Client);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
