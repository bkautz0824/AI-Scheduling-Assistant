"use client";

import { useEffect, useState } from 'react';
import { Calendar, Badge } from 'antd';
import dayjs from 'dayjs';

export default function CalendarDisplay() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/calendar-events');
        const data = await res.json();
        if (data.message === 'Unauthorized') {
          window.location.href = window.location.origin;
        } else {
          console.log(data)
          const formattedEvents = data.map((event) => ({
            title: event.summary,
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        // Optionally, set an error state here to display an error message
      }
    }

    fetchEvents();
  }, []);

  // Helper function to get events for a specific date
  const getListData = (value) => {
    const dateString = dayjs(value).format('YYYY-MM-DD');
    return events
      .filter((event) => {
        const eventDate = dayjs(event.start).format('YYYY-MM-DD');
        return eventDate === dateString;
      })
      .map((event) => ({
        type: 'success', // Customize based on event properties
        content: event.title,
      }));
  };

  const dateFullCellRender = (value) => {
    const listData = getListData(value);
    return (
      <div className="events">
        {listData.map((item, index) => (
          <Badge key={index} status={item.type} text={item.content} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '16px', background: '#fff' }}>
      <Calendar cellRender={dateFullCellRender} />
    </div>
  );
}
