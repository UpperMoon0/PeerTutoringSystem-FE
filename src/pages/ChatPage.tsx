import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import type { Conversation } from '@/types/chat';
import { ChatService } from '@/services/ChatService';
import { useAuth } from '@/contexts/AuthContext';

const ChatPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && currentUser) {
      const findAndSelectConversation = async () => {
        const result = await ChatService.findOrCreateConversation(userId);
        if (result.success && result.data) {
          setSelectedConversation(result.data);
        } else {
          console.error("Failed to find or create conversation:", result.error);
        }
      };
      findAndSelectConversation();
    }
  }, [searchParams, currentUser]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        <div className="md:col-span-1">
          <ConversationList
            onSelectConversation={setSelectedConversation}
            selectedConversation={selectedConversation}
          />
        </div>
        <div className="md:col-span-2">
          <ChatWindow conversation={selectedConversation} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;