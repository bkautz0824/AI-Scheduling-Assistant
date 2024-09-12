// components/CalendarDisplay.js

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarDisplay() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch('/api/calendar-events');
      const data = await res.json();
      console.log(data)
      const formattedEvents = data.map(event => ({
        title: event.summary,
        start: event.start.dateTime || event.start.date,  // Handles all-day events
        end: event.end.dateTime || event.end.date,
      }));
      setEvents(formattedEvents);
    }

    fetchEvents();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '5% auto' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
    </div>
  );
}
