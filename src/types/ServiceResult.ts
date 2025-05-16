export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string | Error; 
  isNotFoundError?: boolean; 
}
