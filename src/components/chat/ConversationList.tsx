import React from 'react';
import type { Conversation } from '@/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  selectedConversation,
}) => {
  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
  };

  return (
    <div className="border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <div className="overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-4 text-gray-500">No conversations yet.</p>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="flex items-center">
                <img
                  src={conversation.participant.avatarUrl || `https://i.pravatar.cc/150?u=${conversation.participant.id}`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">
                      {conversation.participant.fullName}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage?.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;