import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card text-foreground border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Session Expired</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Your session has expired. Please log in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90">Login</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionExpiredModal;
