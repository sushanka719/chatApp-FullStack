import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';

interface MessageDto {
    id: string;
    content: string;
    timestamp: string;
    sender: { id: number; username: string; isOnline: boolean };
}

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
    },
  })

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly chatService: ChatService,
    ) { }
    
    async handleConnection(client: Socket) {
        try {
            console.log('handle connection fired');
            const cookie = client.handshake.headers.cookie;
            console.log('Received cookie:', cookie);
            const tokenMatch = cookie?.match(/token=([^;]+)/);
            let authToken = tokenMatch ? tokenMatch[1].trim() : null;
            console.log('Extracted token:', authToken);
            if (authToken?.startsWith('Bearer')) {
                authToken = authToken.replace('Bearer', '').trim();
            }
            if (!authToken) {
                console.log('No token found, disconnecting client:', client.id);
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(authToken);
            console.log('Token payload:', payload);
            const userId = (payload as any).userId || (payload as any).sub;
            console.log('User ID:', userId);
            const user = await this.usersService.findOne(parseInt(userId, 10));
            console.log('Found user:', user);
            if (!user) {
                console.log('User not found, disconnecting client:', client.id);
                client.disconnect();
                return;
            }
            client.data.user = user;
            console.log('Client connected:', client.id, 'User:', user.id);
            await this.usersService.updateUserStatus(user.id, true);
            this.server.emit('userOnline', { userId: user.id });
        } catch (e) {
            console.error('Connection error:', e.message, 'Client ID:', client.id);
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        if (client.data.user) {
            const userId = client.data.user.id;
            await this.usersService.updateUserStatus(userId, false);
            this.server.emit('userOffline', { userId });
            console.log('Client disconnected:', client.id, 'User:', userId);
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { chatId: string; content: string },
        @ConnectedSocket() client: Socket,
    ) {
        const senderId = client.data.user.id;
        try {
            const message = await this.chatService.createMessage(senderId, data.chatId, data.content);
            this.server.to(data.chatId).emit('newMessage', message);
            console.log(`Emitted newMessage to chat ${data.chatId}:`, message);
        } catch (e) {
            console.error(`Error sending message to chat ${data.chatId}:`, e);
            client.emit('error', { message: e.message || 'Failed to send message' });
        }
    }

    @SubscribeMessage('joinChat')
    handleJoinChat(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
        client.join(chatId);
        console.log('Client', client.id, 'joined chat:', chatId);
    }

    @SubscribeMessage('leaveChat')
    handleLeaveChat(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
        client.leave(chatId);
        console.log('Client', client.id, 'left chat:', chatId);
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() data: { chatId: string; isTyping: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        const senderId = client.data.user.id;
        this.server.to(data.chatId).emit('userTyping', {
            userId: senderId,
            isTyping: data.isTyping,
            chatId: data.chatId,
        });
    }
  }