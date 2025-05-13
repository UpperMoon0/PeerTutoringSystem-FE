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

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

const TutorVerificationPage: React.FC = () => {
  const [verifications, setVerifications] = useState<TutorVerification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'All'>('All');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const result = await TutorService.getTutorVerifications();
      if (result.success && result.data) {
        setVerifications(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch tutor verifications.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
    } catch (err: any) {
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
    return <p>Loading tutor verifications...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tutor Verification Requests</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="status-filter">Filter by status:</Label>
          <Select 
            value={filterStatus} 
            onValueChange={(value: string) => setFilterStatus(value as VerificationStatus | 'All')}
          >
            <SelectTrigger id="status-filter" className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredVerifications.length === 0 ? (
        <p>No tutor verification requests match the current filter.</p>
      ) : (
        <div className="space-y-4">
          {filteredVerifications.map((verification) => (
            <div key={verification.verificationID} className="p-4 border rounded-md shadow-sm">
              <h3 className="text-lg font-medium">{verification.fullName || verification.userID} ({verification.studentID})</h3>
              <p><strong>University:</strong> {verification.university}</p>
              <p><strong>Major:</strong> {verification.major}</p>
              <p><strong>Citizen ID:</strong> {verification.citizenID}</p>
              <p><strong>Status:</strong> <span className={`font-semibold ${
                verification.verificationStatus === 'Pending' ? 'text-yellow-500' :
                verification.verificationStatus === 'Approved' ? 'text-green-500' : 'text-red-500'
              }`}>{verification.verificationStatus}</span></p>
              <div>
                <strong>Documents:</strong>
                {verification.documents && verification.documents.length > 0 ? (
                  <ul>
                    {verification.documents.map(doc => (
                      <li key={doc.documentID}>
                        <a href={doc.documentPath} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {doc.documentType}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No documents submitted.</p>
                )}
              </div>
              {verification.verificationStatus === 'Pending' && (
                <div className="mt-2 space-x-2">
                  <Button 
                    onClick={() => handleUpdateStatus(verification.verificationID, 'Approved')} 
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus(verification.verificationID, 'Rejected')} 
                    variant="destructive" 
                    className="text-white" 
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

export default TutorVerificationPage;
