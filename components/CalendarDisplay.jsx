"use client";

import { useEffect, useState } from 'react';
import { Calendar, Badge, Button, Select, Space, Spin, Alert } from 'antd';
import dayjs from 'dayjs';

export default function CalendarDisplay({ calendarData, currentDate, onPanelChange }) {

  // Helper function to get events for a specific date
  const getListData = (value) => {
    const dateString = dayjs(value).format('YYYY-MM-DD');
    return calendarData
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
      onChange(newValue);
    };

    const onYearChange = (newYear) => {
      const newValue = current.clone().year(newYear);
      onChange(newValue);
    };

    const goToPreviousMonth = () => {
      const newValue = current.clone().subtract(1, 'month');
      onChange(newValue);
    };

    const goToNextMonth = () => {
      const newValue = current.clone().add(1, 'month');
      onChange(newValue);
    };

    return (
      <div style={{ padding: 8 }}>
        <Space>
          <Button onClick={goToPreviousMonth}>&lt;</Button>
          <Select
            value={month}
            onChange={onMonthChange}
            popupMatchSelectWidth={false}
          >
            {monthOptions}
          </Select>
          <Select
            value={year}
            onChange={onYearChange}
            popupMatchSelectWidth={false}
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
      <Calendar 
        cellRender={dateFullCellRender} 
        onPanelChange={onPanelChange} 
        headerRender={headerRender} 
      />
    </div>
  );
}
