import type { ServiceResult } from '@/types/api.types';
import { AuthService } from './AuthService';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

interface ChatMessage {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export const ChatService = {
  sendMessage: async (message: ChatMessage): Promise<ServiceResult<void>> => {
    const url = `${BASE_API_URL}/chat/send`;
    try {
      const response = await AuthService.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      });

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
        let finalErrorMessage: string;
        if (typeof errorBody === 'object' && errorBody !== null) {
          if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
            finalErrorMessage = (errorBody as any).message;
          } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
            finalErrorMessage = (errorBody as any).error;
          } else {
            finalErrorMessage = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
          }
        } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
          finalErrorMessage = errorBody;
        } else {
          finalErrorMessage = `Request failed with status ${response.status}`;
        }
        return { success: false, error: new Error(finalErrorMessage) };
      }
      return { success: true, data: undefined };
    } catch (networkOrOtherError) {
      console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError))
      };
    }
  },
};

export type { ChatMessage };