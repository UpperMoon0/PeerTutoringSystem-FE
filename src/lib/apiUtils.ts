import type { ServiceResult } from '@/types/api.types';

// Helper function to check for message property
export function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
    );
}

// Helper function to check for error property
export function isErrorWithError(error: unknown): error is { error: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'error' in error &&
        typeof (error as { error: unknown }).error === 'string'
    );
}

export async function getErrorMessageFromResponse(response: Response): Promise<{ finalErrorMessage: string, errorBody: unknown }> {
    let errorBody: unknown;
    try {
        errorBody = await response.json();
    } catch {
        try {
            errorBody = await response.text();
        } catch {
            errorBody = `Request failed with status ${response.status} and error body could not be read.`;
        }
    }

    let finalErrorMessage: string;
    if (isErrorWithMessage(errorBody) && errorBody.message.trim() !== '') {
        finalErrorMessage = errorBody.message;
    } else if (isErrorWithError(errorBody) && errorBody.error.trim() !== '') {
        finalErrorMessage = errorBody.error;
    } else if (typeof errorBody === 'object' && errorBody !== null) {
        finalErrorMessage = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
    } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
        finalErrorMessage = errorBody;
    } else {
        finalErrorMessage = `Request failed with status ${response.status}`;
    }
    return { finalErrorMessage, errorBody };
}

export async function handleApiResponse<T>(response: Response, url: string): Promise<ServiceResult<T>> {
    if (!response.ok) {
        const { finalErrorMessage, errorBody } = await getErrorMessageFromResponse(response);
        console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
        return { success: false, error: new Error(finalErrorMessage) };
    }

    if (response.status === 204) {
        return { success: true, data: undefined as T };
    }

    const responseText = await response.text();
    if (!responseText) {
        return { success: true, data: undefined as T };
    }

    try {
        const data = JSON.parse(responseText) as T;
        return { success: true, data };
    } catch (parseError) {
        console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
        return { success: false, error: new Error("Failed to parse server response.") };
    }
}