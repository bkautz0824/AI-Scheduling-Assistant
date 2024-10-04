"use client";

import { useEffect, useState } from 'react';
import { Calendar, Badge, Button, Select, Space, Spin, Alert } from 'antd';
import dayjs from 'dayjs';

export default function CalendarDisplay() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEventsForDate(date) {
      setLoading(true); // Start loading
      setError(null); 
      try {
        const formattedMonth = date.format('YYYY-MM');
        const res = await fetch(`/api/calendar-events?month=${formattedMonth}`);
        const data = await res.json();
        console.log(data)
        if (data.message === 'Unauthorized' || data.message === 'Invalid Credentials') {
          window.location.href = window.location.origin;
        } else {
          const formattedEvents = data.map((event) => ({
            title: event.summary,
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        if(error.message === 'Unauthorized' || error.message === 'Invalid Credentials') {
          window.location.href = window.location.origin;
        } 
        // Optionally, set an error state here to display an error message
      }finally {
        setLoading(false); // End loading
      }
    }

    fetchEventsForDate(currentDate);
  }, [currentDate]);

  const handlePanelChange = (value, mode) => {
    setCurrentDate(dayjs(value));
  };

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
  const headerRender = ({ value, onChange }) => {
    const current = value.clone();

    const start = 1900;
    const end = 2100;
    const monthOptions = [];
    const yearOptions = [];

    // Generate month options
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    months.forEach((month, index) => {
      monthOptions.push(
        <Select.Option key={index} value={index}>
          {month}
        </Select.Option>
      );
    });

    // Generate year options
    for (let i = start; i <= end; i++) {
      yearOptions.push(
        <Select.Option key={i} value={i}>
          {i}
        </Select.Option>
      );
    }

    const month = current.month();
    const year = current.year();

    const onMonthChange = (newMonth) => {
      const newValue = current.clone().month(newMonth);
      setCurrentDate(newValue);
      onChange(newValue);
    };

    const onYearChange = (newYear) => {
      const newValue = current.clone().year(newYear);
      setCurrentDate(newValue);
      onChange(newValue);
    };

    const goToPreviousMonth = () => {
      const newValue = current.clone().subtract(1, 'month');
      setCurrentDate(newValue);
      onChange(newValue);
    };

    const goToNextMonth = () => {
      const newValue = current.clone().add(1, 'month');
      setCurrentDate(newValue);
      onChange(newValue);
    };

    return (
      <div style={{ padding: 8 }}>
        <Space>
          <Button onClick={goToPreviousMonth}>&lt;</Button>
          <Select
            value={month}
            onChange={onMonthChange}
            dropdownMatchSelectWidth={false}
          >
            {monthOptions}
          </Select>
          <Select
            value={year}
            onChange={onYearChange}
            dropdownMatchSelectWidth={false}
          >
            {yearOptions}
          </Select>
          <Button onClick={goToNextMonth}>&gt;</Button>
        </Space>
      </div>
    );
  };

  return (
    <div style={{ padding: '16px', background: '#fff' }}>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Spin spinning={loading} tip="Loading...">
        <Calendar cellRender={dateFullCellRender} onPanelChange={handlePanelChange} headerRender={headerRender} />
        </Spin>
    </div>
  );
}
