import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatService } from '@/services/ChatService';
import type { ChatMessage } from '@/types/chat.types';
import { HubConnectionState } from '@microsoft/signalr';
import { useAuth } from '@/contexts/AuthContext'; 

const ChatPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [connectionState, setConnectionState] = useState<HubConnectionState | null>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const connection = ChatService.initializeConnection();
    setConnectionState(connection.state);

    const handleReceiveMessage = (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ChatService.onReceiveMessage(handleReceiveMessage);

    ChatService.startConnection().then(result => {
      if (result.success) {
        setConnectionState(ChatService.getConnectionState());
      } else {
        console.error("Failed to start SignalR connection:", result.error);
      }
    });

    return () => {
      ChatService.stopConnection().then(result => {
        if (result.success) {
          setConnectionState(ChatService.getConnectionState());
        } else {
          console.error("Failed to stop SignalR connection:", result.error);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (messageInput.trim() && currentUser?.userId) {
      const newMessage: ChatMessage = {
        senderId: currentUser.userId,
        receiverId: 'some-other-user-id',
        content: messageInput,
        timestamp: new Date().toISOString(),
      };
      const result = await ChatService.sendMessage(newMessage);
      if (result.success) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessageInput('');
      } else {
        console.error('Error sending message:', result.error);
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
              className={`flex ${msg.senderId === currentUser?.userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`${
                  msg.senderId === currentUser?.userId ? 'bg-accent' : 'bg-primary'
                } text-primary-foreground p-3 rounded-lg max-w-xs shadow-md`}
              >
                <p>{msg.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString()} - {msg.senderId === currentUser?.userId ? 'You' : 'Other User'}
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
            disabled={connectionState !== HubConnectionState.Connected}
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;