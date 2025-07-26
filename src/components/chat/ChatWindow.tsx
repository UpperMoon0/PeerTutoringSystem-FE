import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatService } from '@/services/ChatService';
import type { Conversation, ChatMessage, SendMessagePayload } from '@/types/chat';
import { HubConnectionState } from '@microsoft/signalr';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface ChatWindowProps {
  conversation: Conversation | null;
  onNewMessage: (message: ChatMessage) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onNewMessage }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [connectionState, setConnectionState] = useState<HubConnectionState | null>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      const fetchMessages = async () => {
        const result = await ChatService.getMessages(conversation.id.toString());
        if (result.success && result.data) {
          setMessages(result.data);
        } else {
          console.error("Failed to fetch messages:", result.error);
        }
      };
      fetchMessages();
    }
  }, [conversation]);

  useEffect(() => {
    const connection = ChatService.initializeConnection();
    setConnectionState(connection.state);

    const handleReceiveMessage = (message: ChatMessage) => {
      if (
        conversation &&
        ((message.senderId === currentUser?.userId && message.receiverId === conversation.participant.id) ||
          (message.senderId === conversation.participant.id && message.receiverId === currentUser?.userId))
      ) {
        setMessages((prevMessages) => {
          if (prevMessages.some((m) => m.id === message.id)) {
            return prevMessages; // Message already exists, do not add duplicate
          }
          const newMessages = [...prevMessages, message];
          onNewMessage(message);
          return newMessages;
        });
      }
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
  }, [conversation, currentUser]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const receiverId = conversation?.participant.id;
    if (messageInput.trim() && currentUser?.userId && receiverId) {
      const optimisticMessage: ChatMessage = {
        id: Date.now().toString(), // Temporary ID
        senderId: currentUser.userId,
        receiverId: receiverId,
        message: messageInput,
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      setMessageInput('');

      const payload: SendMessagePayload = {
        senderId: optimisticMessage.senderId,
        receiverId: optimisticMessage.receiverId,
        message: optimisticMessage.message,
      };

      const result = await ChatService.sendMessage(payload);

      if (result.success && result.data) {
        const receivedMessage = result.data as ChatMessage;
        // Replace optimistic message with the real one from the server
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === optimisticMessage.id ? receivedMessage : msg
          )
        );
        onNewMessage(receivedMessage);
      } else {
        console.error('Error sending message:', result.error);
        // Revert optimistic update
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== optimisticMessage.id)
        );
      }
    }
  };

  return (
    <Card className="bg-card border-border shadow-xl flex flex-col h-[calc(100vh-8rem)]">
      {conversation ? (
        <>
          <CardHeader className="p-6 border-b border-border">
            <CardTitle className="text-2xl text-foreground">
              Chat with {conversation.participant?.fullName || '...'}
            </CardTitle>
          </CardHeader>
      <CardContent ref={chatContentRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => {
          if (!msg) return null;
          return (
            <div
              key={index}
              className={`flex ${msg.senderId === currentUser?.userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`${
                  msg.senderId === currentUser?.userId
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary text-primary-foreground'
                } p-3 rounded-lg max-w-xs shadow-md`}
              >
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{msg.message}</ReactMarkdown>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString()} - {msg.senderId === currentUser?.userId ? 'You' : 'Other User'}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
      <div className="p-6 border-t border-border flex items-center space-x-3">
        <Input
          placeholder="Type your message..."
          className="flex-1 bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && messageInput.trim()) {
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
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Select a conversation to start chatting</p>
        </div>
      )}
    </Card>
  );
};

export default ChatWindow;