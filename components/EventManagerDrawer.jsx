"use client";

import { Drawer, Input, Button, Alert, Spin } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;

export default function EventManagerDrawer({
    isOpen,
    toggleDrawer,
    fetchEventsForDate,
    currentDate,
}) {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventDuration, setEventDuration] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAddEvent = async () => {
        // Validate required fields
        if (!eventTitle || !eventDate || !eventTime) {
            setError('Please fill in the required fields: Title, Date, and Time.');
            return;
        }

        // Construct eventDetails object
        const eventDetails = {
            title: eventTitle,
            date: eventDate,
            time: eventTime,
            duration: eventDuration ? parseInt(eventDuration, 10) : 60, // default to 60 minutes if not provided
            location: eventLocation,
            description: eventDescription,
        };

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: '', // No user message in this case
                    calendarData: '', // Not needed for direct event addition
                    intent: 'manage',
                    eventDetails: eventDetails, // Send the structured event details
                }),
            });

            const data = await response.json();
            if (response.ok) {
                // Refresh calendar events
                await fetchEventsForDate(currentDate);

                // Clear the form fields
                setEventTitle('');
                setEventDate('');
                setEventTime('');
                setEventDuration('');
                setEventLocation('');
                setEventDescription('');

                // Close the drawer
                toggleDrawer(false);
            } else {
                setError(data.error || 'An error occurred.');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            title="Add New Event"
            placement="right"
            onClose={() => toggleDrawer(false)}
            open={isOpen}
            width={350}
        >
            <div style={{ marginBottom: '16px' }}>
                <Input
                    placeholder="Event Title *"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    style={{ marginBottom: '8px' }}
                />
                <Input
                    placeholder="Date (YYYY-MM-DD) *"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ marginBottom: '8px' }}
                />
                <Input
                    placeholder="Time (HH:MM AM/PM) *"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    style={{ marginBottom: '8px' }}
                />
                <Input
                    placeholder="Duration (minutes)"
                    value={eventDuration}
                    onChange={(e) => setEventDuration(e.target.value)}
                    style={{ marginBottom: '8px' }}
                />
                <Input
                    placeholder="Location"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    style={{ marginBottom: '8px' }}
                />
                <TextArea
                    placeholder="Description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={3}
                    style={{ marginBottom: '8px' }}
                />
            </div>
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}
            <Button
                type="primary"
                onClick={handleAddEvent}
                style={{ width: '100%' }}
                loading={loading}
            >
                Add Event
            </Button>
        </Drawer>
    );
}
