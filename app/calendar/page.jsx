"use client";

import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Tooltip, Spin, Alert, Switch } from 'antd';
import {
  HomeOutlined,
  MessageOutlined,
  PlusOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import CalendarDisplay from '@/components/CalendarDisplay';
import YearlyView from '@/components/YearlyView'; // Import the YearlyView component
import ChatDrawer from '@/components/ChatDrawer';
import EventManagerDrawer from '@/components/EventManagerDrawer';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;

export default function CalendarPage() {
  const [collapsed, setCollapsed] = useState(true); // Sidebar collapsed state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Chat Drawer stat
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false); // Event Manager Drawer state


  // State for Calendar Data
  const [calendarData, setCalendarData] = useState([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle for year view
  const [yearView, setYearView] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null); // Track selected month for month view

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleDrawer = (open) => {
    setIsDrawerOpen(open);
  };

  const toggleEventDrawer = (open) => {
    setIsEventDrawerOpen(open);
  };

  const handleMonthClick = (month, year) => {
    setCurrentDate(dayjs(`${year}-${month}-01`));
    setYearView(false); // Switch to month view
  };

  // Function to fetch calendar events
  const fetchEventsForDate = async (date) => {
    setLoading(true); // Start loading
    setError(null);
    try {
      const formattedMonth = date.format('YYYY-MM');
      const res = await fetch(`/api/calendar-events?month=${formattedMonth}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch calendar events');
      }
      const data = await res.json();

      // Handle unauthorized access
      if (data.message === 'Unauthorized' || data.message === 'Invalid Credentials') {
        window.location.href = window.location.origin;
        return;
      }

      // Format the events for frontend display
      const formattedEventsForDisplay = data.map((event) => ({
        id: event.id,
        title: event.title, // Updated to event.title
        start: new Date(event.start), // event.start is already a string
        end: new Date(event.end), // event.end is already a string
        location: event.location,
        description: event.description,
        isAllDay: event.isAllDay, // Directly use event.isAllDay
      }));

      setCalendarData(formattedEventsForDisplay);
    } catch (error) {
      if (error.message === 'Unauthorized' || error.message === 'Invalid Credentials') {
        window.location.href = window.location.origin;
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchEventsForDate(currentDate);
  }, [currentDate]);

  const handlePanelChange = (value, mode) => {
    setCurrentDate(dayjs(value));
  };

  // Function to format calendar data for OpenAI
  const formatCalendarData = (events) => {
    if (!events || events.length === 0) return 'No events found.';
    return events.map(event => {
      const start = dayjs(event.start).format('YYYY-MM-DD HH:mm');
      const end = dayjs(event.end).format('YYYY-MM-DD HH:mm');
      return `- ${event.title} from ${start} to ${end} at ${event.location}`;
    }).join('\n');
  };

  const formattedCalendarData = formatCalendarData(calendarData);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={200}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Menu Items */}
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            {collapsed ? (
              <Tooltip title="Home" placement="right">
                <Link href="/">
                  <span />
                </Link>
              </Tooltip>
            ) : (
              <Link href="/">
                <span>Home</span>
              </Link>
            )}
          </Menu.Item>
          <Menu.Item key="2" icon={<MessageOutlined />} onClick={() => toggleDrawer(true)}>
            {collapsed ? (
              <Tooltip title="Open Chat" placement="right">
                <span />
              </Tooltip>
            ) : (
              <span>Open Chat</span>
            )}
          </Menu.Item>
          <Menu.Item key="3" icon={<PlusOutlined />} onClick={() => toggleEventDrawer(true)}>
            {collapsed ? (
              <Tooltip title="Add Event" placement="right">
                <span />
              </Tooltip>
            ) : (
              <span>Add Event</span>
            )}
          </Menu.Item>
        </Menu>

        {/* Toggle Button */}
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <Button type="primary" onClick={toggleCollapsed} style={{ marginTop: '10px' }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
      </Sider>

      {/* Main Content Area */}
      <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', textAlign: 'center' }}>
            <Switch
              checkedChildren="Year View"
              unCheckedChildren="Month View"
              checked={yearView}
              onChange={() => setYearView(!yearView)}
              style={{ marginBottom: '16px' }}
            />

            {loading && (
              <div style={{ marginBottom: '16px' }}>
                <Spin tip="Loading events..." />
              </div>
            )}
            {error && (
              <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
            )}

            {/* Conditionally render the CalendarDisplay or YearlyView based on the toggle */}
            {yearView ? (
               <YearlyView data={calendarData} onMonthClick={handleMonthClick} />
            ) : (
              <CalendarDisplay 
                calendarData={calendarData}
                currentDate={currentDate}
                onPanelChange={handlePanelChange}
              />
            )}
          </div>
        </Content>
      </Layout>

      {/* Chat Drawer */}
      <ChatDrawer 
        isOpen={isDrawerOpen} 
        toggleDrawer={toggleDrawer} 
        calendarData={formattedCalendarData} 
        fetchEventsForDate={fetchEventsForDate}
        currentDate={currentDate}// Pass formatted string
      />

      <EventManagerDrawer
        isOpen={isEventDrawerOpen}
        toggleDrawer={toggleEventDrawer}
        fetchEventsForDate={fetchEventsForDate}
        currentDate={currentDate}
      />
    </Layout>
  );
}
