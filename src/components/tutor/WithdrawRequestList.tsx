import { useState } from 'react';
import type { WithdrawRequest } from '@/types/withdraw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getWithdrawStatusBadgeVariant, getWithdrawStatusString } from '@/lib/utils';

interface WithdrawRequestListProps {
  requests: WithdrawRequest[];
  onViewDetails: (request: WithdrawRequest) => void;
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} VND`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const WithdrawRequestList = ({ requests, onViewDetails }: WithdrawRequestListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredRequests =
    requests.filter((request) => {
      if (statusFilter === 'All') {
        return true;
      }
      return getWithdrawStatusString(request.status) === statusFilter;
    }) || [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Withdraw Requests</CardTitle>
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 p-2"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDate(request.requestDate)}</TableCell>
                  <TableCell>{formatCurrency(request.amount)}</TableCell>
                  <TableCell>{request.bankName}</TableCell>
                  <TableCell>{request.accountNumber}</TableCell>
                  <TableCell>
                    <Badge variant={getWithdrawStatusBadgeVariant(request.status)}>
                      {getWithdrawStatusString(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(request)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No withdraw requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WithdrawRequestList;