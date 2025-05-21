// chat.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { Message } from '../message/message.entity';
import { User } from '../users/user.entity';
import { Equal, Repository } from 'typeorm';
import { MessageDto } from 'src/message/message.dto';
import { validate as isUUID } from 'uuid';


@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createPrivateChat(user1Id: number, user2Id: number): Promise<Chat> {

        console.log(user1Id, user2Id, "private chat firsting1")
        const areFriends = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.friends', 'friend', 'friend.id = :user2Id', { user2Id })
            .where('user.id = :user1Id', { user1Id })
            .getExists();                   

        if (!areFriends) {
            throw new Error('Users are not friends');
      }

        const existingChat = await this.chatRepository
            .createQueryBuilder('chat')
            .innerJoin('chat.participants', 'user1', 'user1.id = :user1Id', { user1Id })
            .innerJoin('chat.participants', 'user2', 'user2.id = :user2Id', { user2Id })
            .where('chat.isGroup = false')
            .getOne();

        if (existingChat) return existingChat;

        const user1 = await this.userRepository.findOneBy({ id: user1Id });
        const user2 = await this.userRepository.findOneBy({ id: user2Id });

        if (!user1 || !user2) {
            throw new Error('One or both users not found');
        }

        const chat = this.chatRepository.create({
            isGroup: false,
            participants: [user1, user2],
        });

        return this.chatRepository.save(chat);
    }

    // New method to find an existing private chat
    async findPrivateChat(user1Id: number, user2Id: number): Promise<Chat | null> {
        return this.chatRepository
            .createQueryBuilder('chat')
            .innerJoin('chat.participants', 'user1', 'user1.id = :user1Id', { user1Id })
            .innerJoin('chat.participants', 'user2', 'user2.id = :user2Id', { user2Id })
            .where('chat.isGroup = false')
            .select(['chat.id'])
            .getOne();
    }

    async createGroupChat(name: string, creatorId: number, userIds: number[]): Promise<Chat> {
        const creator = await this.userRepository.findOneBy({ id: creatorId });
        const otherUsers = await this.userRepository.findByIds(userIds);

        if (!creator) {
            throw new Error('Creator not found');
        }
        const participants = [creator, ...otherUsers].filter(Boolean) as User[];

        const chat = this.chatRepository.create({
            name,
            isGroup: true,
            participants,
        });

        return this.chatRepository.save(chat);
    }
      
  async createMessage(senderId: number, chatId: string, content: string): Promise<MessageDto> {
    if (!isUUID(chatId)) {
      throw new BadRequestException('Invalid chat ID: must be a valid UUID');
    }
    if (!content.trim()) {
      throw new BadRequestException('Content cannot be empty');
    }

    // Validate chat
    const chat = await this.chatRepository.findOne({ where: { id: Equal(chatId) } });
    if (!chat) {
      console.error(`Chat ${chatId} not found`);
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    // Validate sender
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    if (!sender) {
      console.error(`Sender ${senderId} not found`);
      throw new NotFoundException(`Sender with ID ${senderId} not found`);
    }

    const message = this.messageRepository.create({
      chat: { id: chatId }, // Use validated chat ID
      content: content.trim(),
      timestamp: new Date(),
      sender: { id: senderId }, // Use validated sender ID
    });

    console.log('Creating message:', {
      id: message.id, // Should be undefined
      content: message.content,
      timestamp: message.timestamp,
      senderId: message.sender.id,
      chatId: message.chat.id,
    });

    try {
      const savedMessage = await this.messageRepository.save(message);
      console.log(`Message saved: ${savedMessage.id} for chat ${chatId}`);
      message.id = savedMessage.id; // Update ID after save
    } catch (error) {
      console.error(`Failed to save message for chat ${chatId}:`, error);
      throw new BadRequestException(`Failed to save message: ${error.message}`);
    }

    // Fetch saved message with relations
    const fetchedMessage = await this.messageRepository
      .createQueryBuilder('message')
      .select([
        'message.id',
        'message.content',
        'message.timestamp',
        'chat.id',
        'sender.id',
        'sender.username',
        'sender.isOnline',
      ])
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.chat', 'chat')
      .where('message.id = :id', { id: message.id })
      .getOne();

    if (!fetchedMessage) {
      console.error(`Message ${message.id} not found after save for chat ${chatId}`);
      throw new BadRequestException('Failed to retrieve saved message');
    }

    const messageDto: MessageDto = {
      id: fetchedMessage.id,
      content: fetchedMessage.content,
      timestamp: fetchedMessage.timestamp.toISOString(),
      sender: {
        id: fetchedMessage.sender.id,
        username: fetchedMessage.sender.username || 'Unknown',
        isOnline: fetchedMessage.sender.isOnline || false,
      },
      chatId: fetchedMessage.chat.id,
    };

    console.log(`Returning MessageDto:`, messageDto);
    return messageDto;
  }


  async getChatMessages(
    chatId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: MessageDto[]; totalMessages: number; limit: number; page: number }> {
    if (!isUUID(chatId)) {
      throw new BadRequestException('Invalid chat ID: must be a valid UUID');
    }
    const chatExists = await this.chatRepository.exists({ where: { id: Equal(chatId) } });
    if (!chatExists) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }
    if (page < 0) throw new BadRequestException('Page must be ≥ 0');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be 1‑100');

    const totalMessages = await this.messageRepository.count({
      where: { chat: { id: Equal(chatId) } },
    });

    if (page === 0) {
      return {
        data: [],
        totalMessages,
        limit,
        page: 0,
      };
    }

    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .select([
        'message.id',
        'message.content',
        'message.timestamp',
        'chat.id',
        'sender.id',
        'sender.username',
        'sender.isOnline',
      ])
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.chat', 'chat')
      .where('chat.id = :chatId', { chatId })
      .orderBy('message.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const data: MessageDto[] = messages.map((m) => ({
      id: m.id,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
      sender: {
        id: m.sender.id,
        username: m.sender.username || 'Unknown',
        isOnline: m.sender.isOnline || false,
      },
      chatId: m.chat.id,
    }));

    console.log(`Fetched ${data.length} messages for chat ${chatId}:`, data);
    return {
      data,
      totalMessages,
      limit,
      page,
    };
  }
  

    async getUserChats(userId: number): Promise<Chat[]> {
        return this.chatRepository
            .createQueryBuilder('chat')
            .innerJoin('chat.participants', 'user', 'user.id = :userId', { userId })
            .leftJoinAndSelect('chat.participants', 'participants')
            .leftJoinAndSelect('chat.messages', 'messages')
            .leftJoinAndSelect('messages.sender', 'sender')
            .orderBy('messages.timestamp', 'DESC')
            .getMany();
    }
}