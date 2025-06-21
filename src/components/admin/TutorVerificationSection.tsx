import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { TutorVerification } from '@/types/TutorVerification';
import { TutorService } from '@/services/TutorService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

type AlertInfo = {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
} | null;

const TutorVerificationSection: React.FC = () => {
  const [verifications, setVerifications] = useState<TutorVerification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'All'>('All');
  const [alertInfo, setAlertInfo] = useState<AlertInfo>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    verificationId: string;
    status: 'Approved' | 'Rejected';
    tutorName: string;
  }>({
    open: false,
    verificationId: '',
    status: 'Approved',
    tutorName: ''
  });

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleOpenDocument = async (documentId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAlertInfo({
        type: 'error',
        title: 'Authentication Error',
        message: 'Authentication token not found. Please log in again.'
      });
      return;
    }

    try {
      const fullUrl = `${API_BASE_URL}/Documents/${documentId}`;
      console.log('TutorVerificationSection: Calling document API URL:', fullUrl);
      console.log('TutorVerificationSection: API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log('TutorVerificationSection: Document API call failed with status:', response.status);
        if (response.status === 401) {
          setAlertInfo({
            type: 'error',
            title: 'Unauthorized',
            message: 'Please log in again.'
          });
        } else if (response.status === 403) {
          setAlertInfo({
            type: 'error',
            title: 'Forbidden',
            message: 'You do not have permission to view this document.'
          });
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch document.' }));
          console.log('TutorVerificationSection: Error response data:', errorData);
          setAlertInfo({
            type: 'error',
            title: 'Document Error',
            message: `Error fetching document: ${errorData.error || response.statusText}`
          });
        }
        return;
      }

      console.log('TutorVerificationSection: Document API call successful');
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Failed to open document:', err);
      setAlertInfo({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An unexpected error occurred while trying to open the document.'
      });
    }
  };

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const result = await TutorService.getTutorVerifications();
      if (result.success && result.data) {
        setVerifications(result.data);
        setError(null);
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to fetch tutor verifications.';
        setError(errorMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (verificationID: string, status: 'Approved' | 'Rejected') => {
    try {
      const result = await TutorService.updateTutorVerificationStatus(verificationID, status);
      if (result.success) {
        setAlertInfo({
          type: 'success',
          title: 'Status Updated',
          message: `Verification ${verificationID} status updated to ${status}`
        });
        fetchVerifications(); // Refresh the list
      } else {
        setAlertInfo({
          type: 'error',
          title: 'Update Failed',
          message: typeof result.error === 'string' ? result.error : result.error?.message || `Failed to update status for ${verificationID}`
        });
      }
    } catch (err) {
      setAlertInfo({
        type: 'error',
        title: 'Unexpected Error',
        message: `An unexpected error occurred while updating status for ${verificationID}`
      });
      console.error(err);
    }
  };

  const handleStatusClick = (verificationID: string, status: 'Approved' | 'Rejected', tutorName: string) => {
    setConfirmDialog({
      open: true,
      verificationId: verificationID,
      status,
      tutorName
    });
  };

  const handleConfirmStatusUpdate = () => {
    handleUpdateStatus(confirmDialog.verificationId, confirmDialog.status);
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const filteredVerifications = verifications
    .filter(verification => {
      if (filterStatus === 'All') {
        return true;
      }
      return verification.verificationStatus === filterStatus;
    })
    .sort((a, b) => {
      // Sort by status: Pending first, then Approved, then Rejected
      const statusOrder = { 'Pending': 0, 'Approved': 1, 'Rejected': 2 };
      const aOrder = statusOrder[a.verificationStatus as keyof typeof statusOrder] ?? 3;
      const bOrder = statusOrder[b.verificationStatus as keyof typeof statusOrder] ?? 3;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // If same status, sort by verification ID (or any other field you prefer)
      return a.verificationID.localeCompare(b.verificationID);
    });

  if (loading) {
    return <p className="text-muted-foreground">Loading tutor verifications...</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return (
    <div className="bg-gray-950 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tutor Verification Requests</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="status-filter" className="text-gray-400">Filter by status:</Label>
          <Select
            value={filterStatus}
            onValueChange={(value: string) => setFilterStatus(value as VerificationStatus | 'All')}
          >
            <SelectTrigger id="status-filter" className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredVerifications.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No tutor verification requests match the current filter.</p>
      ) : (
        <div className="space-y-6">
          {filteredVerifications.map((verification) => (
            <div key={verification.verificationID} className="p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-white mb-2">{verification.fullName || verification.userID} ({verification.studentID})</h3>
              <p className="text-gray-400"><strong>University:</strong> {verification.university}</p>
              <p className="text-gray-400"><strong>Major:</strong> {verification.major}</p>
              <p className="text-gray-400"><strong>Citizen ID:</strong> {verification.citizenID}</p>
              <p className="mb-3 text-white"><strong>Status:</strong> <span className={`font-semibold ${
                verification.verificationStatus === 'Pending' ? 'text-yellow-400' :
                verification.verificationStatus === 'Approved' ? 'text-green-400' : 'text-red-400'
              }`}>{verification.verificationStatus}</span></p>
              <div className="mb-3">
                <strong className="text-white">Documents:</strong>
                {verification.documents && verification.documents.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {verification.documents.map(doc => (
                      <li key={doc.documentID} className="text-gray-400">
                        <button
                          onClick={() => handleOpenDocument(doc.documentID)}
                          className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                        >
                          {doc.documentType}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No documents submitted.</p>
                )}
              </div>
              {verification.verificationStatus === 'Pending' && (
                <div className="mt-4 flex space-x-3">
                  <Button
                    onClick={() => handleStatusClick(verification.verificationID, 'Approved', verification.fullName || verification.userID)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusClick(verification.verificationID, 'Rejected', verification.fullName || verification.userID)}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alert Dialog for Status Confirmation */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {confirmDialog.status === 'Approved' ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Approve Verification
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  Reject Verification
                </span>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to {confirmDialog.status.toLowerCase()} the verification for{' '}
              <strong>{confirmDialog.tutorName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusUpdate}
              className={
                confirmDialog.status === 'Approved'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {confirmDialog.status === 'Approved' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert for notifications */}
      {alertInfo && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <Alert
            variant={alertInfo.type === 'error' ? 'destructive' : 'default'}
            className={`
              ${alertInfo.type === 'success' ? 'bg-green-900 border-green-600 text-green-100' : ''}
              ${alertInfo.type === 'error' ? 'bg-red-900 border-red-600 text-red-100' : ''}
              ${alertInfo.type === 'warning' ? 'bg-yellow-900 border-yellow-600 text-yellow-100' : ''}
            `}
          >
            {alertInfo.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {alertInfo.type === 'error' && <XCircle className="h-4 w-4" />}
            {alertInfo.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>{alertInfo.title}</AlertTitle>
            <AlertDescription>{alertInfo.message}</AlertDescription>
          </Alert>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 text-current hover:bg-black/20"
            onClick={() => setAlertInfo(null)}
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
};

export default TutorVerificationSection;