import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import apiLimiter from '../../../middleware/rateLimiter';
import { getToken } from 'next-auth/jwt';
import { google } from 'googleapis';

// Helper function to convert time to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h) {
    console.error("Invalid time provided");
    return "00:00"; // Default fallback
  }

  const [time, modifier] = time12h.split(' ');
  if (!time || !modifier) {
    console.error("Improperly formatted time string:", time12h);
    return "00:00"; // Default fallback
  }

  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;

  return `${hours}:${minutes}`;
}


// Function to add an event to the calendar
async function addEventToCalendar(eventDetails, accessToken) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const timeZone = eventDetails.timeZone || 'America/New_York';

    const event = {
      summary: eventDetails.title,
      location: eventDetails.location,
      description: eventDetails.description,
      start: {
        dateTime: `${eventDetails.date}T${eventDetails.startTime}:00`,
        timeZone: timeZone,
      },
      end: {
        dateTime: eventDetails.endDate
          ? `${eventDetails.endDate}T${eventDetails.endTime}:00`
          : `${eventDetails.date}T${eventDetails.endTime}:00`,
        timeZone: timeZone,
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return { success: true, event: response.data };
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    return { success: false, error };
  }
}

// Export the POST handler
export async function POST(request) {
  // Get user's token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.error === 'RefreshAccessTokenError') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = token.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: 'No access token available. Please authenticate.' }, { status: 401 });
  }

  // Apply rate limiting
  const rateLimitResponse = await apiLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { eventDetails } = await request.json();
    const addEventResponse = await addEventToCalendar(eventDetails, accessToken);

    if (addEventResponse.success) {
      const confirmationMessage = `✅ Successfully added the event **${eventDetails.title}** on **${eventDetails.date}** at **${eventDetails.time}**.`;
      return NextResponse.json({ reply: confirmationMessage }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to add the event to the calendar.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
