import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TutorService } from '../services/TutorService'; 
import type { RequestTutorPayload } from '../types/RequestTutorPayload';
import type { DocumentUploadDto } from '@/types/file.types';

const TutorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth(); 

  const [citizenId, setCitizenId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (authLoading) {
      setError('Authentication state is loading. Please wait.');
      setIsLoading(false);
      return;
    }

    if (!currentUser || currentUser.role !== 'Student') {
      setError('You must be logged in as a student to register as a tutor.');
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
          throw new Error(uploadResult.error || `Failed to upload ${file.name}`);
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
        setError(result.error || 'Failed to submit tutor registration request.');
      }
    } catch (err: any) {
      console.error("Error during tutor registration submission:", err);
      setError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Become a Tutor</CardTitle>
          <CardDescription className="text-center">
            Fill in the details below to apply as a tutor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="citizenId">Citizen ID</Label>
              <Input
                id="citizenId"
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="documents">Supporting Documents (e.g., Student ID Card, Transcripts)</Label>
              <Input
                id="documents"
                type="file"
                multiple
                onChange={handleFileChange}
                required
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Upload at least one document.</p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Your application will be reviewed by an administrator.
        </CardFooter>
      </Card>
    </div>
  );
};

export default TutorRegisterPage;
