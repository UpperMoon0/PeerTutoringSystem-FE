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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

const TutorVerificationSection: React.FC = () => {
  const [verifications, setVerifications] = useState<TutorVerification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'All'>('All');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleOpenDocument = async (documentId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Unauthorized. Please log in again.');
        } else if (response.status === 403) {
          alert('Forbidden. You do not have permission to view this document.');
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch document.' }));
          alert(`Error fetching document: ${errorData.error || response.statusText}`);
        }
        return;
      }

      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Failed to open document:', err);
      alert('An unexpected error occurred while trying to open the document.');
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
        alert(`Verification ${verificationID} status updated to ${status}`);
        fetchVerifications(); // Refresh the list
      } else {
        alert(result.error || `Failed to update status for ${verificationID}`);
      }
    } catch (err) {
      alert(`An unexpected error occurred while updating status for ${verificationID}`);
      console.error(err);
    }
  };

  const filteredVerifications = verifications.filter(verification => {
    if (filterStatus === 'All') {
      return true;
    }
    return verification.verificationStatus === filterStatus;
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
                    onClick={() => handleUpdateStatus(verification.verificationID, 'Approved')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(verification.verificationID, 'Rejected')}
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
    </div>
  );
};

export default TutorVerificationSection;