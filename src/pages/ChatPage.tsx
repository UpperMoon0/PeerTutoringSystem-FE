import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import type { Conversation, ChatMessage } from '@/types/chat';
import { ChatService } from '@/services/ChatService';
import { useAuth } from '@/contexts/AuthContext';

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const processConversations = async () => {
      const userIdToFind = searchParams.get('userId');
      
      // If a userId is present in the URL, handle it first.
      if (userIdToFind) {
        // Immediately remove the userId from the URL to prevent this block from running again on re-renders.
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('userId');
        setSearchParams(newSearchParams, { replace: true });

        const result = await ChatService.findOrCreateConversation(userIdToFind);
        if (result.success && result.data) {
          const newOrExistingConv = result.data;
          setSelectedConversation(newOrExistingConv);
          // After creating/finding, fetch the whole list to ensure consistency.
          const convListResult = await ChatService.getConversations(currentUser.userId);
          if (convListResult.success && convListResult.data) {
            setConversations(convListResult.data);
          }
        } else {
          console.error("Failed to find or create conversation:", result.error);
          // Fallback to just fetching the list if creation fails.
          const convListResult = await ChatService.getConversations(currentUser.userId);
          if (convListResult.success && convListResult.data) {
            setConversations(convListResult.data);
          }
        }
      } else {
        // If no userId is in the URL, just fetch the user's conversations.
        const convListResult = await ChatService.getConversations(currentUser.userId);
        if (convListResult.success && convListResult.data) {
          setConversations(convListResult.data);
        }
      }
    };

    processConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, searchParams, setSearchParams]);

  const handleNewMessage = (message: ChatMessage) => {
    setConversations(prev => {
      const conversationToUpdate = prev.find(c => c.id === selectedConversation?.id);
      if (conversationToUpdate) {
        const updatedConv = { ...conversationToUpdate, lastMessage: message };
        return [updatedConv, ...prev.filter(c => c.id !== selectedConversation?.id)];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        <div className="md:col-span-1">
          <ConversationList
            conversations={conversations}
            onSelectConversation={setSelectedConversation}
            selectedConversation={selectedConversation}
          />
        </div>
        <div className="md:col-span-2">
          <ChatWindow conversation={selectedConversation} onNewMessage={handleNewMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;