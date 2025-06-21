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
    } catch (err: unknown) {
      console.error("Error during tutor registration submission:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during submission.');
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

  // Handle different application statuses
  if (pendingStatus?.hasVerificationRequest && pendingStatus.latestStatus === 'Approved') {
    // If approved, redirect to home or profile page (this page shouldn't be accessible)
    navigate('/');
    return null;
  }

  // Determine the state for rendering
  const isRejectedApplication = pendingStatus?.hasVerificationRequest && pendingStatus.latestStatus === 'Rejected';
  const isPendingApplication = pendingStatus?.hasVerificationRequest && pendingStatus.latestStatus === 'Pending';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      {/* Rejection Notification Banner */}
      {isRejectedApplication && (
        <div className="bg-red-900/20 border-b border-red-800">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-300">Previous Application Not Approved</h3>
                <p className="text-red-200 text-sm">
                  Your previous tutor application was not approved. Please review the feedback sent to your email and submit a new application addressing the mentioned concerns.
                </p>
              </div>
              <div className="text-red-300 text-sm">
                You can reapply below
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Tutoring Community
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Share your knowledge, help fellow students succeed, and earn while making a difference in their academic journey.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-white mb-2">Share Knowledge</h3>
              <p className="text-gray-300">Help students master subjects you excel in</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn Income</h3>
              <p className="text-gray-300">Set your rates and earn while teaching</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Flexible Schedule</h3>
              <p className="text-gray-300">Teach when it works for your schedule</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Information */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Requirements to Become a Tutor</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Valid Student Status</h3>
                  <p className="text-gray-400">Must be currently enrolled in an accredited university or college with good academic standing.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Subject Expertise</h3>
                  <p className="text-gray-400">Demonstrate strong knowledge in your chosen subject areas with relevant coursework or experience.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
                  <p className="text-gray-400">Provide valid student ID, transcripts, and any relevant certifications or achievements.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-gray-800/50 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Application Process</h3>
              <div className="space-y-3 text-gray-400">
                <p>• Submit your application with required documents</p>
                <p>• Our team reviews your qualifications (2-5 business days)</p>
                <p>• Once approved, complete your tutor profile</p>
                <p>• Start accepting tutoring sessions!</p>
              </div>
            </div>
          </div>

          {/* Right Side - Application Form OR Status Message */}
          <div>
            {isPendingApplication ? (
              /* Status Message Section for Pending Applications */
              <Card className="bg-gray-900 border-gray-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center text-white">Application Status</CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    Your tutor application is being reviewed
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {/* Status Icon */}
                  <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">Application Under Review</h3>
                  <p className="text-gray-300 mb-8">
                    Your tutor application is currently being reviewed by our team. We typically complete reviews within 2-5 business days.
                  </p>

                  {/* Progress Steps */}
                  <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Documents Received</h4>
                        <p className="text-gray-400 text-sm">Your submitted documents are in our system</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Under Review</h4>
                        <p className="text-gray-400 text-sm">Our team is evaluating your qualifications</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-300">Decision Notification</h4>
                        <p className="text-gray-400 text-sm">You'll receive an email with our decision</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-blue-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-sm font-medium">
                        Keep an eye on your email for updates on your application status
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => navigate('/')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Back to Home
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              /* Application Form for New or Rejected Applications */
              <Card className="bg-gray-900 border-gray-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center text-white">Tutor Application</CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    Complete the form below to start your application
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
                      placeholder="Enter your citizen ID number"
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
                      placeholder="Enter your university student ID"
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
                      placeholder="e.g., University of Science and Technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="major" className="text-gray-300">Major/Field of Study</Label>
                    <Input
                      id="major"
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      required
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Computer Science, Mathematics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="documents" className="text-gray-300">Supporting Documents</Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      required
                      className="mt-1 bg-gray-800 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white file:text-center file:flex file:items-center file:justify-center hover:file:bg-blue-700"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload: Student ID, Transcripts, Certificates (PDF, JPG, PNG, DOC)
                    </p>
                    
                    {/* File Upload Feedback */}
                    {files.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm font-medium text-green-400 mb-2">
                          ✓ {files.length} file{files.length > 1 ? 's' : ''} selected:
                        </p>
                        <ul className="space-y-1">
                          {files.map((file, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-center">
                              <span className="mr-2">📄</span>
                              <span className="truncate">{file.name}</span>
                              <span className="ml-auto text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting Application...' : 'Submit Application'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-center text-sm text-gray-400">
                <div className="w-full">
                  <p className="mb-2">🔒 Your information is secure and will only be used for verification purposes.</p>
                  <p>Questions? Contact our support team for assistance.</p>
                </div>
              </CardFooter>
            </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorRegisterPage;
