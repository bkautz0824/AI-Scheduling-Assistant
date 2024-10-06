// pages/api/chat.js

import nextConnect from 'next-connect';
import apiLimiter from '../../../middleware/rateLimiter';
import dayjs from 'dayjs';
import { NextResponse } from 'next/server';

// Placeholder function to add an event to the calendar
async function addEventToCalendar(eventDetails) {
  // TODO: Implement your logic to add the event to your calendar
  console.log('Adding event to calendar:', eventDetails);
  
  // Simulate successful addition
  return { success: true, event: eventDetails };
}

// Initialize the handler with next-connect
const handler = nextConnect({
  onError(error, req, res) {
    console.error(error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
});

// Apply the rate limiter middleware only to POST requests
handler.use('/api/chat', apiLimiter);

// Define the POST handler
handler.post(async (req, res) => {
  const { message, calendarData, intent } = req.body;

  try {
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
      // Add more functions like delete_event, update_event as needed
    ];

    // Construct the Messages Array
    const systemMessage = {
      role: 'system',
      content:
        'You are a helpful calendar assistant that can read calendar data, answer questions about events, suggest how to plan future events, and make direct changes to the calendar.',
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
      model: 'gpt-4-0613', // Ensure you're using a model that supports function calling
      messages: [systemMessage, calendarContextMessage, userMessage],
      max_tokens: 500, // Adjust based on your needs
      temperature: 0.7, // Adjust for creativity
    };

    // Include functions if the intent is to manage the calendar
    if (intent === 'manage') {
      openAiRequestBody.functions = functions;
      openAiRequestBody.function_call = 'auto'; // Let the model decide whether to call a function
    }

    // Make the request to OpenAI's API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(openAiRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({ error: errorData.error.message || 'Failed to fetch from OpenAI' });
    }

    const data = await response.json();
    const messageContent = data.choices[0].message;

    // Handle Function Calls
    if (messageContent.function_call) {
      const { name, arguments: args } = messageContent.function_call;

      if (name === 'add_event') {
        // Parse the arguments safely
        let eventDetails;
        try {
          eventDetails = JSON.parse(args);
        } catch (parseError) {
          console.error('Error parsing function arguments:', parseError);
          return res.status(400).json({ error: 'Invalid event details provided.' });
        }

        // Add the event to the calendar
        const addEventResponse = await addEventToCalendar(eventDetails);

        if (addEventResponse.success) {
          // Respond with a confirmation message
          const confirmationMessage = `✅ Successfully added the event **${eventDetails.title}** on **${eventDetails.date}** at **${eventDetails.time}**.`;
          return res.status(200).json({ reply: confirmationMessage });
        } else {
          return res.status(500).json({ error: 'Failed to add the event to the calendar.' });
        }
      } else {
        // Handle other function calls if any
        return res.status(400).json({ error: `Function ${name} is not implemented.` });
      }
    } else {
      // If no function call, return the assistant's reply
      const reply = messageContent.content.trim();
      return res.status(200).json({ reply });
    }
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default handler;
