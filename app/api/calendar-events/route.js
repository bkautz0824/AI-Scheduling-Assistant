// app/api/calendar-events/route.js
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const oauth2Client = new google.auth.OAuth2();

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  oauth2Client.setCredentials({ access_token: session.accessToken });

  try {
    const events = await getCalendarEvents(oauth2Client);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getCalendarEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  return events.data.items;
}
