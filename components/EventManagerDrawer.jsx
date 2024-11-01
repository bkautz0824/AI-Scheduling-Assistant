"use client";
import { Drawer, Input, Button, Alert, Spin, DatePicker, TimePicker, Checkbox, Select } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';

const { TextArea } = Input;

const timeZones = [
    { label: 'Eastern Time (EST)', value: 'America/New_York' },
    { label: 'Central Time (CST)', value: 'America/Chicago' },
    { label: 'Mountain Time (MST)', value: 'America/Denver' },
    { label: 'Pacific Time (PST)', value: 'America/Los_Angeles' },
    { label: 'UTC', value: 'UTC' },
    // Add other time zones as needed
];

export default function EventManagerDrawer({
    isOpen,
    toggleDrawer,
    fetchEventsForDate,
    currentDate,
}) {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [endDate, setEndDate] = useState(null);
    const [timeZone, setTimeZone] = useState('America/New_York'); // Default to EST
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAddEvent = async () => {
        if (!eventTitle || !eventDate || !startTime || !endTime) {
            setError('Please fill in the required fields: Title, Date, Start Time, and End Time.');
            return;
        }

        const eventDetails = {
            title: eventTitle,
            date: eventDate,
            startTime: startTime.format("HH:mm"),
            endTime: endTime.format("HH:mm"),
            location: eventLocation,
            description: eventDescription,
            endDate: isMultiDay ? endDate : null,
            timeZone: timeZone, // Pass the selected time zone
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
                    intent: 'manage',
                    eventDetails: eventDetails,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                await fetchEventsForDate(currentDate);
                setEventTitle('');
                setEventDate('');
                setStartTime('');
                setEndTime('');
                setEventLocation('');
                setEventDescription('');
                setIsMultiDay(false);
                setEndDate(null);
                setTimeZone('America/New_York'); // Reset to EST
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
                <DatePicker
                    placeholder="Start Date *"
                    value={eventDate ? dayjs(eventDate) : null}
                    onChange={(date) => setEventDate(date ? date.format('YYYY-MM-DD') : '')}
                    style={{ marginBottom: '8px', width: '100%' }}
                />
                <TimePicker
                    placeholder="Start Time *"
                    value={startTime ? dayjs(startTime, "HH:mm") : null}
                    onChange={(time) => setStartTime(time)}
                    style={{ marginBottom: '8px', width: '100%' }}
                    format="HH:mm"
                />
                <TimePicker
                    placeholder="End Time *"
                    value={endTime ? dayjs(endTime, "HH:mm") : null}
                    onChange={(time) => setEndTime(time)}
                    style={{ marginBottom: '8px', width: '100%' }}
                    format="HH:mm"
                />

                <Checkbox
                    checked={isMultiDay}
                    onChange={(e) => setIsMultiDay(e.target.checked)}
                    style={{ marginBottom: '8px' }}
                >
                    Multi-day Event
                </Checkbox>

                {isMultiDay && (
                    <DatePicker
                        placeholder="End Date"
                        value={endDate ? dayjs(endDate) : null}
                        onChange={(date) => setEndDate(date ? date.format('YYYY-MM-DD') : null)}
                        style={{ marginBottom: '8px', width: '100%' }}
                    />
                )}

                <Select
                    placeholder="Select Time Zone"
                    value={timeZone}
                    onChange={(value) => setTimeZone(value)}
                    options={timeZones}
                    style={{ marginBottom: '8px', width: '100%' }}
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
