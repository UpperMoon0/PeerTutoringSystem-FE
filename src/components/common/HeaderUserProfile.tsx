import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const HeaderUserProfile: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <Link to={`/profile/${currentUser.userId}`} className="flex items-center space-x-2 cursor-pointer">
      <Avatar>
        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName} />
        <AvatarFallback>{currentUser.fullName.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="text-white hover:text-gray-200 transition-colors">{currentUser.fullName}</span>
    </Link>
  );
};

export default HeaderUserProfile;
