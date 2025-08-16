import React, { useCallback, useState } from 'react';
import { BookingService } from '@/services/BookingService';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { BookingList } from '@/components/booking/BookingList';

type BookingStatus = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';
type SortOrder = 'asc' | 'desc';

const ManageBookingsSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [key, setKey] = useState(0); // Used to force re-fetch in BookingList

  const fetchAdminBookings = useCallback(
    (status: BookingStatus, page: number, pageSize: number, sortOrder: SortOrder) => {
      const statusFilter = status === 'All' ? undefined : status;
      return BookingService.getAllBookingsForAdmin(page, pageSize, statusFilter, undefined, undefined, undefined, sortOrder);
    },
    []
  );

  const handleBookingUpdate = () => {
    setKey(prevKey => prevKey + 1);
  };

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="p-6 text-center">
        <Alert className="bg-card border-border">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-foreground">Access Denied</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Only administrators can manage system bookings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <BookingList
      key={key}
      fetchBookings={fetchAdminBookings}
      userRole="admin"
      title="All System Bookings"
      subtitle="Monitor and oversee all tutoring session bookings across the platform."
      onBookingUpdate={handleBookingUpdate}
    />
  );
};

export default ManageBookingsSection;