export interface TutorVerification {
  verificationId: string;
  userId: string;
  fullName: string;
  citizenId: string;
  studentId: string;
  university: string;
  major: string;
  verificationStatus: 'Pending' | 'Approved' | 'Rejected';
  verificationDate?: string;
  adminNotes?: string;
  documents: Array<{ documentId: string; documentType: string; documentPath: string }>;
}
