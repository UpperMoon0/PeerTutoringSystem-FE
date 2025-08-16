import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WithdrawService } from '@/services/WithdrawService';
import WithdrawRequestList from '@/components/tutor/WithdrawRequestList';
import WithdrawRequestDetails from '@/components/admin/WithdrawRequestDetails';
import type { WithdrawRequest } from '@/types/withdraw';

const ManageWithdrawRequests = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['withdraw-requests'],
    queryFn: () => WithdrawService.getWithdrawRequests(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => WithdrawService.approveWithdrawRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdraw-requests'] });
      setSelectedRequest(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => WithdrawService.rejectWithdrawRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdraw-requests'] });
      setSelectedRequest(null);
    },
  });

  const handleViewDetails = (request: WithdrawRequest) => {
    setSelectedRequest(request);
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {selectedRequest ? (
        <WithdrawRequestDetails
          request={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
          onBack={() => setSelectedRequest(null)}
        />
      ) : (
        <WithdrawRequestList requests={requests?.data || []} onViewDetails={handleViewDetails} />
      )}
    </div>
  );
};

export default ManageWithdrawRequests;