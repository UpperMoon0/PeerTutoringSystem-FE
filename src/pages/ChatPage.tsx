import React from 'react';
import { useLocation } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const location = useLocation();
  const { receiverId } = location.state || {};

  return (
    <div>
      <h1>Chat Page with User ID: {receiverId}</h1>
    </div>
  );
};

export default ChatPage;