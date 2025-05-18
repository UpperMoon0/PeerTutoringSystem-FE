export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string | Error; 
  isNotFoundError?: boolean; 
}
