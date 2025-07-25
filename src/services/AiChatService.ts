import type { ApiResult } from '@/types/api.types';
import { AuthService } from './AuthService';
import type { ChatMessage } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AiChatService = {
  sendMessage: async (message: string): Promise<ApiResult<ChatMessage>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/AiChat`, {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to send message: ${response.statusText}`);
      }
      const createdMessage: ChatMessage = await response.json();
      return { success: true, data: createdMessage };
    } catch (error) {
      console.error('Error sending message to AI:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to send message to AI." };
    }
  },
};