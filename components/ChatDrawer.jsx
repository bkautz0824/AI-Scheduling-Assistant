"use client";

import { Drawer, List, Input, Button, Alert } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;

export default function ChatDrawer({ isOpen, toggleDrawer }) {
  const [messages, setMessages] = useState([
    { sender: 'ChatGPT', text: 'Hello! How can I assist you today?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(null);

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
    setMessages([...messages, newMessage]);
    setUserInput('');

    try {
      const response = await fetch('/api/chat', { // Ensure this API route is implemented
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from ChatGPT.');
      }

      const data = await response.json();
      const botMessage = { sender: 'ChatGPT', text: data.reply };
      setMessages([...messages, newMessage, botMessage]);
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the response.');
    }
  };

  return (
    <Drawer
      title="Chat with ChatGPT"
      placement="right"
      onClose={() => toggleDrawer(false)}
      open={isOpen}
      width={350}
    >
      <List
        dataSource={messages}
        renderItem={(msg) => (
          <List.Item>
            <strong>{msg.sender}:</strong> {msg.text}
          </List.Item>
        )}
        style={{ height: '60vh', overflowY: 'auto', marginBottom: '16px' }}
      />
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '10px' }} />}
      <TextArea
        rows={4}
        placeholder="Make a change to your calendar..."
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
      >
        Send
      </Button>
    </Drawer>
  );
}
