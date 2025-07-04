import type { ApiResult } from '@/types/api.types';
import { AuthService } from './AuthService';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';
import type { ChatMessage, Conversation, SendMessagePayload } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const chatHubUrl = `${API_BASE_URL.replace('/api', '')}/chatHub`;

let connection: HubConnection | null = null;

export const ChatService = {
  initializeConnection: (): HubConnection => {
    if (!connection) {
      connection = new HubConnectionBuilder()
        .withUrl(chatHubUrl, {
          accessTokenFactory: () => localStorage.getItem('accessToken') || ''
        })
        .withAutomaticReconnect()
        .build();
    }
    return connection;
  },

  startConnection: async (): Promise<ApiResult<void>> => {
    if (!connection) {
      return { success: false, error: "SignalR connection not initialized." };
    }
    if (connection.state === HubConnectionState.Disconnected) {
      try {
        await connection.start();
        console.log('SignalR Connected!');
        return { success: true, data: undefined };
      } catch (e) {
        console.error('SignalR Connection Error: ', e);
        return { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    }
    return { success: true, data: undefined };
  },

  stopConnection: async (): Promise<ApiResult<void>> => {
    if (connection && connection.state === HubConnectionState.Connected) {
      try {
        await connection.stop();
        console.log('SignalR Disconnected.');
        connection = null;
        return { success: true, data: undefined };
      } catch (e) {
        console.error('SignalR Disconnection Error: ', e);
        return { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    }
    return { success: true, data: undefined };
  },

  onReceiveMessage: (callback: (message: ChatMessage) => void) => {
    if (connection) {
      connection.on('ReceiveMessage', callback);
    }
  },

  sendMessage: async (message: SendMessagePayload): Promise<ApiResult<ChatMessage>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Chat/send`, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to send message: ${response.statusText}`);
      }
      const createdMessage: ChatMessage = await response.json();
      return { success: true, data: createdMessage };
    } catch (error) {
      console.error('Error sending message via API:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to send message." };
    }
  },

  getConnectionState: (): HubConnectionState | null => {
    return connection ? connection.state : null;
  },

  getConversations: async (userId: string): Promise<ApiResult<Conversation[]>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Chat/conversations/${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch conversations: ${response.statusText}`);
      }
      const conversations: Conversation[] = await response.json();
      return { success: true, data: conversations };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch conversations." };
    }
  },

  findOrCreateConversation: async (participantId: string): Promise<ApiResult<Conversation>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Chat/find-or-create`, {
        method: 'POST',
        body: JSON.stringify({ participantId }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to find or create conversation: ${response.statusText}`);
      }
      const conversation: Conversation = await response.json();
      return { success: true, data: conversation };
    } catch (error) {
      console.error('Error finding or creating conversation:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to find or create conversation." };
    }
  }
};
