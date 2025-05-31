import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TutorService } from '../services/TutorService'; 
import type { RequestTutorPayload } from '../types/RequestTutorPayload';
import type { DocumentUploadDto } from '@/types/file.types';
import type { PendingTutorVerificationStatus } from '@/types/TutorVerification';

const TutorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [statusLoading, setStatusLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState<PendingTutorVerificationStatus | null>(null);
  const [citizenId, setCitizenId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (currentUser && currentUser.role === 'Student') {
        setStatusLoading(true);
        const result = await TutorService.checkPendingTutorVerification(currentUser.userId);
        if (result.success) {
          setPendingStatus(result.data || null); 
        } else {
          const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to check application status.';
          setError(errorMessage);
        }
        setStatusLoading(false);
      }
    };
    if (!authLoading) {
      checkStatus();
    }
  }, [currentUser, authLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (authLoading || statusLoading) {
      setError('Authentication state is loading. Please wait.');
      setIsLoading(false);
      return;
    }

    if (!currentUser || currentUser.role !== 'Student') {
      setError('You must be logged in as a student to register as a tutor.');
      setIsLoading(false);
      return;
    }

    if (pendingStatus?.hasVerificationRequest) {
      setError('Your application is already being reviewed or you have an existing verification request.');
      setIsLoading(false);
      return;
    }

    if (files.length === 0) {
      setError('At least one document is required.');
      setIsLoading(false);
      return;
    }

    const uploadedDocuments: DocumentUploadDto[] = [];
    try {
      for (const file of files) {
        const uploadResult = await TutorService.uploadDocument(file, currentUser.userId);
        if (uploadResult.success && uploadResult.data) {
          uploadedDocuments.push(uploadResult.data);
        } else {
          const errorMsg = typeof uploadResult.error === 'string' ? uploadResult.error : `Failed to upload ${file.name}`;
          throw new Error(errorMsg);
        }
      }

      if (uploadedDocuments.length !== files.length) {
        setError('One or more documents failed to upload. Please try again.');
        setIsLoading(false);
        return;
      }

      const payload: RequestTutorPayload = {
        citizenId,
        studentId,
        university,
        major,
        documents: uploadedDocuments,
      };

      const result = await TutorService.requestTutor(currentUser.userId, payload);

      if (result.success && result.data) {
        console.log('Tutor registration request successful:', result.data);
        alert(result.data.message || 'Tutor registration request submitted successfully! Admin will review your application.');
        navigate('/'); 
      } else {
        const errorMsg = typeof result.error === 'string' ? result.error : 'Failed to submit tutor registration request.';
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error("Error during tutor registration submission:", err);
      setError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'Student') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-300">
        <Card className="w-full max-w-lg bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">Become a Tutor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-400">You must be logged in as a student to access this page.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (pendingStatus?.hasVerificationRequest) {
    let statusMessage = 'Your application is currently being reviewed.';
    if (pendingStatus.latestStatus === 'Approved') {
      statusMessage = 'Congratulations! Your application to become a tutor has been approved. You can now update your tutor profile.';
      // TODO: Navigate to profile page or show a link to it.
    } else if (pendingStatus.latestStatus === 'Rejected') {
      statusMessage = 'We regret to inform you that your application to become a tutor has been rejected. Please check your email for more details or contact support.';
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-300">
        <Card className="w-full max-w-lg bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-300">{statusMessage}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If no pending request, show the form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-300">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Become a Tutor</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Fill in the details below to apply as a tutor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="citizenId" className="text-gray-300">Citizen ID</Label>
              <Input
                id="citizenId"
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="studentId" className="text-gray-300">Student ID</Label>
              <Input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="university" className="text-gray-300">University</Label>
              <Input
                id="university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="major" className="text-gray-300">Major</Label>
              <Input
                id="major"
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="documents" className="text-gray-300">Supporting Documents (e.g., Student ID Card, Transcripts)</Label>
              <Input
                id="documents"
                type="file"
                multiple
                onChange={handleFileChange}
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              <p className="text-sm text-gray-500 mt-1">Upload at least one document.</p>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-400">
          Your application will be reviewed by an administrator.
        </CardFooter>
      </Card>
    </div>
  );
};

export default TutorRegisterPage;
