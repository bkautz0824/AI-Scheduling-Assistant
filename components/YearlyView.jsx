import React, { useState, useEffect } from 'react';
import { DatePicker, Card, Row, Col } from 'antd';
import dayjs from 'dayjs';

const YearlyView = ({ onMonthClick }) => {
    const [year, setYear] = useState(dayjs().year());
    const [eventsByMonth, setEventsByMonth] = useState({});

    const handleYearChange = (date) => {
        setYear(dayjs(date).year());
    };

    useEffect(() => {
        const fetchEventTitles = async () => {
            const res = await fetch(`/api/calendar-year?year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setEventsByMonth(data);
            } else {
                console.error("Failed to fetch yearly calendar data");
            }
        };
        fetchEventTitles();
    }, [year]);

    return (
        <div>
            <h2>{year ? `${year} Yearly View` : "Select Year"}</h2>
            <DatePicker
                picker="year"
                defaultValue={dayjs()}
                onChange={handleYearChange}
                style={{ marginBottom: '20px' }}
            />

            <Row gutter={[16, 16]}>
                {Object.keys(eventsByMonth).map((month, index) => (
                    <Col key={index} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            title={month}
                            bordered={true}
                            style={{
                                height: '300px', // Fixed height for each month box
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                            }}
                            headStyle={{
                                backgroundColor: '#f0f2f5',
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }}
                            bodyStyle={{ padding: '10px' }}
                            onClick={() => onMonthClick(index + 1, year)}
                        >
                            <div style={{ maxHeight: '210px', overflowY: 'auto' }}>
                                {eventsByMonth[month].length > 0 ? (
                                    eventsByMonth[month].map((event, idx) => (
                                        <p key={idx} style={{ margin: '5px 0', fontSize: '0.9em', color: '#595959' }}>
                                            {event.title}
                                        </p>
                                    ))
                                ) : (
                                    <p style={{ color: '#bfbfbf' }}>No events</p>
                                )}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default YearlyView;
