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
    const yearParam = searchParams.get('year'); // Expected format: 'YYYY'

    if (!yearParam) {
      return NextResponse.json({ message: 'Year parameter is required' }, { status: 400 });
    }

    const formattedEvents = await getYearlyEventTitles(oauth2Client, yearParam);
    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getYearlyEventTitles(auth, yearParam) {
  const calendar = google.calendar({ version: 'v3', auth });
  const timeMin = new Date(Date.UTC(yearParam, 0, 1)).toISOString(); // January 1st
  const timeMax = new Date(Date.UTC(yearParam, 11, 31, 23, 59, 59)).toISOString(); // December 31st

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(id,summary,start)', // Fetch only summary (title) and start time
  });

  const events = response.data.items || [];
  
  // Organize events by month
  const eventsByMonth = events.reduce((acc, event) => {
    const eventMonth = new Date(event.start.dateTime || event.start.date).getMonth();
    const monthName = new Date(0, eventMonth).toLocaleString('default', { month: 'long' });
    
    if (!acc[monthName]) acc[monthName] = [];
    acc[monthName].push({ title: event.summary });
    
    return acc;
  }, {});

  return eventsByMonth;
}
