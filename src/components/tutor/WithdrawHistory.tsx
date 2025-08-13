import type { WithdrawRequest } from '@/types/withdraw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface WithdrawHistoryProps {
  requests: WithdrawRequest[];
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

const getStatusBadgeVariant = (status: WithdrawRequest['status']) => {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'Approved':
      return 'default';
    case 'Rejected':
      return 'destructive';
    case 'Canceled':
      return 'outline';
    default:
      return 'secondary';
  }
};

const WithdrawHistory = ({ requests }: WithdrawHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw History</CardTitle>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDate(request.requestDate)}</TableCell>
                  <TableCell>{formatCurrency(request.amount)}</TableCell>
                  <TableCell>{request.bankName}</TableCell>
                  <TableCell>{request.accountNumber}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
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

export default WithdrawHistory;