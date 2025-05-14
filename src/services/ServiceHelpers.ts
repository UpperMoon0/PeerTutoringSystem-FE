import type { ServiceResult } from '../types/ServiceResult';
import type { ApiResult } from '../types/ApiResult';

/**
 * Processes a fetch Response promise to a ServiceResult.
 * Handles JSON parsing, error formatting, and network issues.
 * @param responsePromise The promise of a Response object from a fetch call.
 * @param url The URL that was fetched, for logging purposes.
 * @returns A Promise resolving to a ServiceResult<T>.
 */
export async function processServiceResponse<T>(
  responsePromise: Promise<Response>,
  url: string 
): Promise<ServiceResult<T>> {
  try {
    const response = await responsePromise;

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json(); // Attempt to parse error as JSON
      } catch (e) {
        // Fallback to text if JSON parsing fails or if the response wasn't JSON
        try {
          errorBody = await response.text();
        } catch (textError) {
          // If reading text also fails, use a generic status-based message
          errorBody = `Request failed with status ${response.status} and error body could not be read.`;
        }
      }
      
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);

      // Construct error message: use 'message' field from JSON error, or the text body, or a generic message
      const errorMessage = 
        (typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody && typeof (errorBody as any).message === 'string') 
          ? (errorBody as any).message 
          : (typeof errorBody === 'string' && errorBody.trim() !== '' 
              ? errorBody 
              : `Request failed with status ${response.status}`);
      return { success: false, error: new Error(errorMessage) };
    }

    // Handle successful responses (e.g., 200, 201, 204)
    if (response.status === 204) { // No Content
      // For 204, data is typically undefined. Cast to T.
      // Ensure T can accommodate undefined, or this might need adjustment based on specific use cases.
      return { success: true, data: undefined as T }; 
    }

    // For other success statuses (e.g., 200, 201), expect a JSON body if content is present
    const responseText = await response.text();
    
    if (!responseText && response.status !== 204) { // Check if body is empty for non-204 success
        return { success: true, data: undefined as T };
    }
    
    if (!responseText && response.status === 204) { 
        return { success: true, data: undefined as T };
    }

    try {
        const data = JSON.parse(responseText) as T;
        return { success: true, data };
    } catch (parseError) {
        console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
        return { success: false, error: new Error("Failed to parse server response.") };
    }

  } catch (networkOrOtherError) { // Catch errors from await responsePromise (e.g., network issues)
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    return { 
      success: false, 
      error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError)) 
    };
  }
}

/**
 * Processes a fetch Response promise to an ApiResult.
 * Handles JSON parsing, error formatting (string error), and network issues.
 * @param responsePromise The promise of a Response object from a fetch call.
 * @param url The URL that was fetched, for logging purposes.
 * @returns A Promise resolving to an ApiResult<T>.
 */
export async function processApiResponse<T>(
  responsePromise: Promise<Response>,
  url: string
): Promise<ApiResult<T>> {
  try {
    const response = await responsePromise;

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch (e) {
        try {
          errorBody = await response.text();
        } catch (textError) {
          errorBody = `Request failed with status ${response.status} and error body could not be read.`;
        }
      }
      
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);

      const errorMessage = 
        (typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody && typeof (errorBody as any).message === 'string') 
          ? (errorBody as any).message 
          : (typeof errorBody === 'string' && errorBody.trim() !== '' 
              ? errorBody 
              : `Request failed with status ${response.status}`);
      return { success: false, error: errorMessage };
    }

    if (response.status === 204) { 
      return { success: true, data: undefined as T }; 
    }

    const responseText = await response.text();
    if (!responseText && response.status !== 204) {
        return { success: true, data: undefined as T };
    }
    if (!responseText && response.status === 204) { 
        return { success: true, data: undefined as T };
    }

    try {
        const data = JSON.parse(responseText) as T;
        return { success: true, data };
    } catch (parseError) {
        console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
        return { success: false, error: "Failed to parse server response." };
    }

  } catch (networkOrOtherError) {
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    const errorString = networkOrOtherError instanceof Error ? networkOrOtherError.message : String(networkOrOtherError);
    return { 
      success: false, 
      error: errorString 
    };
  }
}
