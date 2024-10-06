"use client";

import { Drawer, List, Input, Button, Alert, Spin, Tabs } from 'antd';
import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { TabPane } = Tabs;

export default function ChatDrawer({ isOpen, toggleDrawer, calendarData }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'manage'
  const [messages, setMessages] = useState([
    { sender: 'ChatGPT', text: 'Hello! How can I assist you today?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    setError(null);
  };

  const handleSend = async () => {
    if (!userInput.trim()) {
      setError('Please enter a message.');
      return;
    }

    const newMessage = { sender: 'You', text: userInput };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userInput,
          calendarData: calendarData, // pre-formatted string
          intent: activeTab // 'chat' or 'manage'
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (data.reply) {
          const botMessage = { sender: 'ChatGPT', text: data.reply };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }
      } else {
        setError(data.error || 'An error occurred.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Scroll to the bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Drawer
      title="Chat with ChatGPT"
      placement="right"
      onClose={() => toggleDrawer(false)}
      open={isOpen}
      width={350}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Chat" key="chat">
          <div style={{ height: '60vh', overflowY: 'auto', marginBottom: '16px' }}>
            <List
              dataSource={messages}
              renderItem={(msg) => (
                <List.Item>
                  <div style={{ textAlign: msg.sender === 'You' ? 'right' : 'left', width: '100%' }}>
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                </List.Item>
              )}
            />
            <div ref={messagesEndRef} />
          </div>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}
          <TextArea
            rows={4}
            placeholder={activeTab === 'chat' ? "Ask anything about your calendar..." : "Enter calendar modification command..."}
            value={userInput}
            onChange={handleInputChange}
            onPressEnter={(e) => {
              e.preventDefault();
              handleSend();
            }}
          />
          <Button
            type="primary"
            onClick={handleSend}
            style={{ marginTop: '10px', width: '100%' }}
            loading={loading}
          >
            Send
          </Button>
        </TabPane>
        <TabPane tab="Manage Calendar" key="manage">
          <div style={{ height: '60vh', overflowY: 'auto', marginBottom: '16px' }}>
            <List
              dataSource={messages}
              renderItem={(msg) => (
                <List.Item>
                  <div style={{ textAlign: msg.sender === 'You' ? 'right' : 'left', width: '100%' }}>
                    <strong>{msg.sender}:</strong> {msg.text}
                    <div style={{ fontSize: '0.8em', color: '#999' }}>{msg.timestamp}</div>
                  </div>
                </List.Item>
              )}
            />
            <div ref={messagesEndRef} />
          </div>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}
          <TextArea
            rows={4}
            placeholder="Enter calendar modification command (e.g., Add event: Title, Date, Time, etc.)"
            value={userInput}
            onChange={handleInputChange}
            onPressEnter={(e) => {
              e.preventDefault();
              handleSend();
            }}
          />
          <Button
            type="primary"
            onClick={handleSend}
            style={{ marginTop: '10px', width: '100%' }}
            loading={loading}
          >
            Send
          </Button>
        </TabPane>
      </Tabs>
    </Drawer>
  );
}
