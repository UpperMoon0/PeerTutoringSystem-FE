export interface ChatMessage {
    id: string;
    message: string;
    senderId: string;
    receiverId: string;
    timestamp: string;
  }
  
  export interface Conversation {
    id: number;
    participant: {
      id: string;
      fullName: string;
    };
    lastMessage: ChatMessage | null;
  }
  
  export interface SendMessagePayload {
    senderId: string;
    receiverId: string;
    message: string;
  }
