import type { WithdrawRequest } from '@/types/withdraw';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WithdrawRequestDetailsProps {
  request: WithdrawRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const WithdrawRequestDetails = ({ request, onApprove, onReject }: WithdrawRequestDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Request Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p>
            <strong>Date:</strong> {new Date(request.requestDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Amount:</strong> {request.amount.toLocaleString()} VND
          </p>
          <p>
            <strong>Bank:</strong> {request.bankName}
          </p>
          <p>
            <strong>Account Number:</strong> {request.accountNumber}
          </p>
          <p>
            <strong>Status:</strong> {request.status}
          </p>
        </div>
        <div className="mt-4 flex space-x-2">
          <Button onClick={() => onApprove(request.id)}>Approve</Button>
          <Button variant="destructive" onClick={() => onReject(request.id)}>
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawRequestDetails;