import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const chatContentRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const chatHubUrl = `${API_BASE_URL.replace('/api', '')}/chatHub`;

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(chatHubUrl)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [chatHubUrl]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('SignalR Connected!');
          connection.on('ReceiveMessage', (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
          });
        })
        .catch((e) => console.log('SignalR Connection Error: ', e));

      return () => {
        if (connection.state === HubConnectionState.Connected) {
          connection.stop();
          console.log('SignalR Disconnected.');
        }
      };
    }
  }, [connection]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (connection && connection.state === HubConnectionState.Connected && messageInput.trim()) {
      const newMessage: Message = {
        sender: 'You', // This should be dynamically set based on the logged-in user
        content: messageInput,
        timestamp: new Date().toISOString(),
      };
      try {
        // Send message via HTTP POST to the backend API
        await fetch(`${API_BASE_URL}/Chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${yourAuthToken}`
          },
          body: JSON.stringify(newMessage),
        });
        setMessageInput('');
      } catch (e) {
        console.error('Error sending message:', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      <Card className="bg-card border-border shadow-xl flex flex-col h-[calc(100vh-8rem)]">
        <CardHeader className="p-6 border-b border-border">
          <CardTitle className="text-2xl text-foreground">Chat</CardTitle>
        </CardHeader>
        <CardContent ref={chatContentRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`${
                  msg.sender === 'You' ? 'bg-accent' : 'bg-primary'
                } text-primary-foreground p-3 rounded-lg max-w-xs shadow-md`}
              >
                <p>{msg.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString()} - {msg.sender}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
        <div className="p-6 border-t border-border flex items-center space-x-3">
          <Input
            placeholder="Type your message..."
            className="flex-1 bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <Button
            className="bg-gradient-to-r from-primary to-ring hover:from-primary hover:to-ring text-primary-foreground font-semibold py-3 text-base"
            onClick={sendMessage}
            disabled={!connection || connection.state !== HubConnectionState.Connected}
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;