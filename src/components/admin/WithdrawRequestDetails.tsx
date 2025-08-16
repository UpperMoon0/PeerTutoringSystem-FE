import type { WithdrawRequest } from '@/types/withdraw';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getWithdrawStatusBadgeVariant, getWithdrawStatusString } from '@/lib/utils';

interface WithdrawRequestDetailsProps {
  request: WithdrawRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onBack?: () => void;
  role?: 'admin' | 'tutor';
}

const WithdrawRequestDetails = ({
  request,
  onApprove,
  onReject,
  onCancel,
  onBack,
  role = 'admin',
}: WithdrawRequestDetailsProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Withdraw Request Details</CardTitle>
        {onBack && (
          <Button
            onClick={onBack}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Back to List
          </Button>
        )}
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
          <p className="flex items-center">
            <strong className="mr-2">Status:</strong>
            <Badge variant={getWithdrawStatusBadgeVariant(request.status)}>
              {getWithdrawStatusString(request.status)}
            </Badge>
          </p>
        </div>
        {role === 'admin' && getWithdrawStatusString(request.status) === 'Pending' && onApprove && onReject && (
          <div className="mt-4 flex space-x-2">
            <Button
              onClick={() => onApprove(request.id)}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(request.id)}
              className="text-white"
            >
              Reject
            </Button>
          </div>
        )}
        {role === 'tutor' && getWithdrawStatusString(request.status) === 'Pending' && onCancel && (
          <div className="mt-4 flex space-x-2">
            <Button
              variant="destructive"
              onClick={() => onCancel(request.id)}
              className="text-white"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawRequestDetails;