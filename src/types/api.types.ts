export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string | { message: string; [key: string]: any }; 
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string | Error; 
  isNotFoundError?: boolean; 
}
