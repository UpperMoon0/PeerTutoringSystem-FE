import type { WithdrawRequest } from '@/types/withdraw';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import WithdrawRequestDetails from '@/components/admin/WithdrawRequestDetails';

interface WithdrawRequestDetailsModalProps {
  request: WithdrawRequest;
  children: React.ReactNode;
}

const WithdrawRequestDetailsModal = ({
  request,
  children,
}: WithdrawRequestDetailsModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Request Details</DialogTitle>
        </DialogHeader>
        <WithdrawRequestDetails
          request={request}
          onApprove={() => {}}
          onReject={() => {}}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawRequestDetailsModal;