import type { DocumentUploadDto } from './file.types';

export interface RequestTutorPayload {
  citizenId: string;
  studentId: string;
  university: string;
  major: string;
  documents: DocumentUploadDto[];
}
