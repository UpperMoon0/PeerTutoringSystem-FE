import type { DocumentUploadDto } from './DocumentUploadDto';

export interface RequestTutorPayload {
  citizenId: string;
  studentId: string;
  university: string;
  major: string;
  documents: DocumentUploadDto[];
}
