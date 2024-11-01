// app/api/chat/route.js
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import apiLimiter from '../../../middleware/rateLimiter';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '../auth/[...nextauth]/route';
import { google } from 'googleapis';

// Helper function to convert time to 24-hour format
function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier.toUpperCase() === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
}

// Helper function to calculate end time
function calculateEndTime(date, startTime, duration) {
  const startDateTime = dayjs(`${date} ${startTime}`, 'YYYY-MM-DD hh:mm A');
  const endDateTime = startDateTime.add(duration || 60, 'minute'); // Default to 60 minutes if duration not provided
  return endDateTime.format('YYYY-MM-DDTHH:mm:ss');
}

// Function to add an event to the calendar
async function addEventToCalendar(eventDetails, accessToken) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Prepare event data
    const event = {
      summary: eventDetails.title,
      location: eventDetails.location,
      description: eventDetails.description,
      start: {
        dateTime: `${eventDetails.date}T${convertTo24Hour(eventDetails.time)}:00`,
        timeZone: 'America/Los_Angeles', // Replace with user's time zone if available
      },
      end: {
        dateTime: calculateEndTime(eventDetails.date, eventDetails.time, eventDetails.duration),
        timeZone: 'America/Los_Angeles',
      },
    };

    // Insert event into calendar
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
  // Get the user's token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check for token refresh errors
  if (token.error === 'RefreshAccessTokenError') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get access token from the token object
  const accessToken = token.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'No access token available. Please authenticate.' },
      { status: 401 }
    );
  }

  // Apply rate limiting middleware
  const rateLimitResponse = await apiLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse; // Return the rate limit response if limit exceeded
  }

  try {
    const { message, calendarData, intent, eventDetails } = await request.json();

    // Define Function Specifications
    const functions = [
      {
        name: 'add_event',
        description: 'Add a new event to the user’s calendar.',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the event.',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'The date of the event in YYYY-MM-DD format.',
            },
            time: {
              type: 'string',
              description: 'The time of the event in HH:MM AM/PM format.',
            },
            duration: {
              type: 'integer',
              description: 'The duration of the event in minutes.',
            },
            location: {
              type: 'string',
              description: 'The location of the event.',
            },
            description: {
              type: 'string',
              description: 'A brief description of the event.',
            },
          },
          required: ['title', 'date', 'time'],
        },
      },
      // Add more functions as needed
    ];

    // Construct the Messages Array
    const systemMessage = {
      role: 'system',
      content:
        'You are a helpful calendar assistant that can read calendar data, answer questions about events, suggest how to plan future events, and make direct changes to the calendar by calling functions like add_event when appropriate.',
    };

    const calendarContextMessage = {
      role: 'assistant',
      content: `Here is the user's calendar data:\n${calendarData}`,
    };

    const userMessage = {
      role: 'user',
      content: message,
    };

    // Prepare the request body for OpenAI API
    const openAiRequestBody = {
      model: 'gpt-4-0613',
      messages: [systemMessage, calendarContextMessage, userMessage],
      max_tokens: 500,
      temperature: 0.7,
    };

    if (intent === 'manage') {
      openAiRequestBody.functions = functions;
      openAiRequestBody.function_call = 'auto';
    }

    // Make the request to OpenAI's API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(openAiRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: errorData.error.message || 'Failed to fetch from OpenAI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const messageContent = data.choices[0].message;

    // Handle Function Calls
    if (messageContent.function_call) {
      const { name, arguments: args } = messageContent.function_call;

      if (name === 'add_event') {
        let eventDetails;
        try {
          eventDetails = JSON.parse(args);
        } catch (parseError) {
          console.error('Error parsing function arguments:', parseError);
          return NextResponse.json(
            { error: 'Invalid event details provided.' },
            { status: 400 }
          );
        }

        // Add the event to the calendar
        const addEventResponse = await addEventToCalendar(eventDetails, accessToken);

        if (addEventResponse.success) {
          const confirmationMessage = `✅ Successfully added the event **${eventDetails.title}** on **${eventDetails.date}** at **${eventDetails.time}**.`;
          return NextResponse.json({ reply: confirmationMessage }, { status: 200 });
        } else {
          console.error('Add Event Error:', addEventResponse.error);
          return NextResponse.json(
            { error: 'Failed to add the event to the calendar.' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Function ${name} is not implemented.` },
          { status: 400 }
        );
      }
    } else {
      // If no function call, return the assistant's reply
      const reply = messageContent.content.trim();
      return NextResponse.json({ reply }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
