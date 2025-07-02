import type { ServiceResult } from '@/types/api.types';
import { apiClient } from './AuthService';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const chatHubUrl = `${API_BASE_URL.replace('/api', '')}/chatHub`;

interface ChatMessage {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

let connection: HubConnection | null = null;

export const ChatService = {
  initializeConnection: (): HubConnection => {
    if (!connection) {
      connection = new HubConnectionBuilder()
        .withUrl(chatHubUrl)
        .withAutomaticReconnect()
        .build();
    }
    return connection;
  },

  startConnection: async (): Promise<ServiceResult<void>> => {
    if (!connection) {
      return { success: false, error: new Error("SignalR connection not initialized.") };
    }
    if (connection.state === HubConnectionState.Disconnected) {
      try {
        await connection.start();
        console.log('SignalR Connected!');
        return { success: true, data: undefined };
      } catch (e) {
        console.error('SignalR Connection Error: ', e);
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
      }
    }
    return { success: true, data: undefined }; // Already connected or connecting
  },

  stopConnection: async (): Promise<ServiceResult<void>> => {
    if (connection && connection.state === HubConnectionState.Connected) {
      try {
        await connection.stop();
        console.log('SignalR Disconnected.');
        connection = null; // Clear connection after stopping
        return { success: true, data: undefined };
      } catch (e) {
        console.error('SignalR Disconnection Error: ', e);
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
      }
    }
    return { success: true, data: undefined }; // Already disconnected or not initialized
  },

  onReceiveMessage: (callback: (message: ChatMessage) => void) => {
    if (connection) {
      connection.on('ReceiveMessage', callback);
    }
  },

  sendMessage: async (message: ChatMessage): Promise<ServiceResult<void>> => {
    try {
      // Use apiClient.post for consistency with other services
      await apiClient.post('/Chat/send', message);
      return { success: true, data: undefined };
    } catch (error) {
      console.error('Error sending message via API:', error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  },

  getConnectionState: (): HubConnectionState | null => {
    return connection ? connection.state : null;
  }
};

export type { ChatMessage };