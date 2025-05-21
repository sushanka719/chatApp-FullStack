export class MessageDto {
    id: string;
    content: string;
    timestamp: string;
    sender: {
        id: number;
        username: string;
        isOnline: boolean;
    };
    chatId: string;
  }