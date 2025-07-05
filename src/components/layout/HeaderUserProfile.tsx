import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { generateGradient, getInitials } from '@/lib/utils';

const HeaderUserProfile: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <Link to={`/profile/${currentUser.userId}`} className="flex items-center space-x-2 cursor-pointer">
      <Avatar>
        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName} />
        <AvatarFallback
          className={`bg-gradient-to-br ${generateGradient(currentUser.fullName)} text-primary-foreground font-bold`}
        >
          {getInitials(currentUser.fullName)}
        </AvatarFallback>
      </Avatar>
      <span className="text-foreground hover:text-muted-foreground transition-colors">{currentUser.fullName}</span>
    </Link>
  );
};

export default HeaderUserProfile;
