export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

export interface UserInfo {
    id: string;
    fullName: string;
    avatarUrl: string | null;
}

export interface Conversation {
  id: string;
  participant: UserInfo;
  lastMessage: ChatMessage | null;
}

export type SendMessagePayload = Omit<ChatMessage, 'id' | 'timestamp'>;