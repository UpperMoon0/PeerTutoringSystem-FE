import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { TutorVerification } from '@/types/TutorVerification';

const TutorVerificationPage: React.FC = () => {
  const [verifications, setVerifications] = useState<TutorVerification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        setLoading(true);
        const mockData: TutorVerification[] = [
          {
            verificationId: '1',
            userId: 'user1',
            fullName: 'John Doe',
            citizenId: '123456789',
            studentId: 'S123',
            university: 'Example University',
            major: 'Computer Science',
            verificationStatus: 'Pending',
            documents: [{ documentId: 'doc1', documentType: 'ID Card', documentPath: '/path/to/id.pdf' }],
          },
          {
            verificationId: '2',
            userId: 'user2',
            fullName: 'Jane Smith',
            citizenId: '987654321',
            studentId: 'S456',
            university: 'Another University',
            major: 'Software Engineering',
            verificationStatus: 'Pending',
            documents: [{ documentId: 'doc2', documentType: 'Transcript', documentPath: '/path/to/transcript.pdf' }],
          },
        ];
        setVerifications(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tutor verifications.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifications();
  }, []);

  const handleUpdateStatus = async (verificationId: string, status: 'Approved' | 'Rejected') => {
    try {
      setVerifications((prevVerifications) =>
        prevVerifications.map((v) =>
          v.verificationId === verificationId ? { ...v, verificationStatus: status } : v
        )
      );
      alert(`Verification ${verificationId} status updated to ${status}`);
    } catch (err) {
      alert(`Failed to update status for ${verificationId}`);
      console.error(err);
    }
  };

  if (loading) {
    return <p>Loading tutor verifications...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tutor Verification Requests</h2>
      {verifications.length === 0 ? (
        <p>No pending tutor verification requests.</p>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div key={verification.verificationId} className="p-4 border rounded-md shadow-sm">
              <h3 className="text-lg font-medium">{verification.fullName} ({verification.studentId})</h3>
              <p><strong>University:</strong> {verification.university}</p>
              <p><strong>Major:</strong> {verification.major}</p>
              <p><strong>Citizen ID:</strong> {verification.citizenId}</p>
              <p><strong>Status:</strong> <span className={`font-semibold ${
                verification.verificationStatus === 'Pending' ? 'text-yellow-500' :
                verification.verificationStatus === 'Approved' ? 'text-green-500' : 'text-red-500'
              }`}>{verification.verificationStatus}</span></p>
              <div>
                <strong>Documents:</strong>
                <ul>
                  {verification.documents.map(doc => (
                    <li key={doc.documentId}>
                      <a href={doc.documentPath} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {doc.documentType}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              {verification.verificationStatus === 'Pending' && (
                <div className="mt-2 space-x-2">
                  <Button onClick={() => handleUpdateStatus(verification.verificationId, 'Approved')} variant="default">
                    Approve
                  </Button>
                  <Button onClick={() => handleUpdateStatus(verification.verificationId, 'Rejected')} variant="destructive">
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
