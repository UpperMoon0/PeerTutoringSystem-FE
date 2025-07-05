import React from 'react';
import type { User } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';

interface UserInfoModalProps {
  user: User | null;
  onClose: () => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ user, onClose }) => {
  if (!user) {
    return null;
  }

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">User Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><strong className="font-semibold">ID:</strong> {user.userID}</p>
            <p><strong className="font-semibold">Role:</strong> {user.role}</p>
            <p><strong className="font-semibold">Status:</strong> {user.status}</p>
            <p><strong className="font-semibold">Gender:</strong> {user.gender}</p>
            <p><strong className="font-semibold">Date of Birth:</strong> {new Date(user.dateOfBirth).toLocaleDateString()}</p>
            <p><strong className="font-semibold">Phone:</strong> {user.phoneNumber}</p>
            <p><strong className="font-semibold">Hometown:</strong> {user.hometown}</p>
            <p><strong className="font-semibold">School:</strong> {user.school || 'N/A'}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserInfoModal;