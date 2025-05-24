import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookingService } from '@/services/BookingService';
import type { Booking } from '@/types/booking.types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const TutorBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; 

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser || currentUser.role !== 'Tutor') {
        setError('You are not authorized to view this page.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await BookingService.getTutorBookings(currentPage, pageSize);
        setBookings(response.data);
        // Assuming the API returns pagination info in headers or a specific structure
        // For now, let's simulate or assume a way to get total pages
        // If the API returns totalItems, calculate totalPages: Math.ceil(response.totalItems / pageSize)
        // If the API returns totalPages directly: setTotalPages(response.totalPages)
        // For this example, if less than pageSize items are returned, it's the last page.
        if (response.data.length < pageSize) {
          setTotalPages(currentPage);
        } else {
          // This is a placeholder; ideally, the API provides total pages or total items
          // For now, if we get a full page, assume there might be a next one.
          setTotalPages(currentPage + 1);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch bookings.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading bookings...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (bookings.length === 0) {
    return <div className="container mx-auto p-4">You have no bookings.</div>;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Confirmed':
        return 'default';
      case 'Cancelled':
        return 'destructive';
      case 'Completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.studentName || 'N/A'}</TableCell>
                  <TableCell>{booking.topic}</TableCell>
                  <TableCell>{new Date(booking.startTime).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="link">
                      <Link to={`/tutor/bookings/${booking.id}`}>View Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorBookingsPage;
