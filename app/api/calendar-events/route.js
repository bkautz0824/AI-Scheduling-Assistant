// app/api/calendar-events/route.js
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
    if (session.error === 'RefreshAccessTokenError') {
    // Redirect the user to the login page
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

    oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });

  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // Expected format: 'YYYY-MM'

    const events = await getCalendarEvents(oauth2Client, monthParam);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getCalendarEvents(auth, monthParam) {
  const calendar = google.calendar({ version: 'v3', auth });
  let timeMin, timeMax;

  if (monthParam) {
    // Parse the provided month
    const [year, month] = monthParam.split('-');
    const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const firstDayOfNextMonth = new Date(Date.UTC(year, month, 1));

    timeMin = firstDayOfMonth.toISOString();
    timeMax = firstDayOfNextMonth.toISOString();
  } else {
    // Default to current date onward
    timeMin = new Date().toISOString();
    timeMax = null; // No upper limit
  }

  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return events.data.items;
}
