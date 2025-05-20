export interface TutorVerification {
  verificationID: string; 
  userID: string;
  fullName?: string; 
  citizenID: string;
  studentID: string;
  university: string;
  major: string;
  verificationStatus: 'Pending' | 'Approved' | 'Rejected';
  verificationDate?: string;
  adminNotes?: string;
  documents: Array<{ documentID: string; documentType: string; documentPath: string }>; 
}

export interface PendingTutorVerificationStatus {
  hasVerificationRequest: boolean;
  latestStatus: 'Pending' | 'Approved' | 'Rejected' | null;
}
