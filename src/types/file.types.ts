export interface DocumentUploadDto {
  documentType: string;
  documentPath: string;
  fileSize: number;
}

export interface FileUploadResponse {
  documentPath: string;
  documentType: string; 
  fileSize: number;    
  userID: string;    
}
