import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from './friend-request.entity';
import { User } from '../users/user.entity';
import { Chat } from 'src/chat/chat.entity';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class FriendRequestService {
    constructor(
        @InjectRepository(FriendRequest)
        private friendRequestRepository: Repository<FriendRequest>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private chatService: ChatService,
    ) { }

    async sendFriendRequest(senderId: number, receiverId: number): Promise<FriendRequest> {
        if (senderId === receiverId) {
            throw new Error('Cannot send friend request to yourself');
        }

        const [sender, receiver] = await Promise.all([
            this.userRepository.findOneBy({ id: senderId }),
            this.userRepository.findOneBy({ id: receiverId }),
        ]);

        if (!sender || !receiver) {
            throw new NotFoundException('User not found');
        }

        const existingRequest = await this.friendRequestRepository.findOne({
            where: [
                { sender: { id: senderId }, receiver: { id: receiverId } },
                { sender: { id: receiverId }, receiver: { id: senderId } },
            ],
            relations: ['sender', 'receiver'],
        });

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                throw new Error('Friend request already pending');
            }
            if (existingRequest.status === 'accepted') {
                throw new Error('You are already friends');
            }
        }

        const friendRequest = this.friendRequestRepository.create({
            sender,
            receiver,
            status: 'pending',
        });

        return this.friendRequestRepository.save(friendRequest);
    }
    async respondToFriendRequest(
        requestId: string,
        receiverId: number,
        status: 'accepted' | 'rejected',
    ): Promise<FriendRequest> {
        const friendRequest = await this.friendRequestRepository.findOne({
            where: {
                id: requestId,
                receiver: { id: receiverId },
            },
            relations: ['sender', 'receiver'],
        });

        if (!friendRequest) {
            throw new NotFoundException('Friend request not found');
        }

        if (friendRequest.status !== 'pending') {
            throw new Error('Friend request already processed');
        }

        friendRequest.status = status;
        const updatedRequest = await this.friendRequestRepository.save(friendRequest);

        if (status === 'accepted') {
            // Add each other as friends
            await this.userRepository
                .createQueryBuilder()
                .relation(User, 'friends')
                .of(friendRequest.sender)
                .add(friendRequest.receiver);

            await this.userRepository
                .createQueryBuilder()
                .relation(User, 'friends')
                .of(friendRequest.receiver)
                .add(friendRequest.sender);

            // Create a private chat between them
            await this.chatService.createPrivateChat(friendRequest.sender.id, friendRequest.receiver.id);
        }

        return updatedRequest;
    }
    

    async getUserFriendRequests(userId: number): Promise<FriendRequest[]> {
        return this.friendRequestRepository
            .createQueryBuilder('friendRequest')
            .leftJoinAndSelect('friendRequest.sender', 'sender')
            .where('friendRequest.receiverId = :userId', { userId })
            .andWhere('friendRequest.status = :status', { status: 'pending' })
            .select([
                'friendRequest.id',
                'friendRequest.status',
                'friendRequest.createdAt',
                'sender.username',
                'sender.id' 
            ])
            .orderBy('friendRequest.createdAt', 'DESC')
            .getMany();
    }
    

    async getFriends(userId: number): Promise<{ id: number; email: string; username: string; isVerified: boolean; isOnline: boolean; lastSeen: Date; chatId: string | null }[]> {
        const userWithFriends = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.friends', 'friend')
            .where('user.id = :userId', { userId })
            .select([
                'user.id',
                'friend.id',
                'friend.email',
                'friend.username',
                'friend.isVerified',
                'friend.isOnline',
                'friend.lastSeen',
            ])
            .getOne();

        const friends = userWithFriends?.friends || [];

        // Map friends to include chatId
        const friendsWithChat = await Promise.all(
            friends.map(async (friend) => {
                // Find the private chat between userId and friend.id
                const chat = await this.chatService.findPrivateChat(userId, friend.id);
                return {
                    id: friend.id,
                    email: friend.email,
                    username: friend.username,
                    isVerified: friend.isVerified,
                    isOnline: friend.isOnline,
                    lastSeen: friend.lastSeen,
                    chatId: chat?.id || null,
                };
            })
        );

        // console.log(friendsWithChat);
        return friendsWithChat;
    }

    async cancelFriendRequest(requestId: string, senderId: number): Promise<void> {
        const request = await this.friendRequestRepository.findOne({
            where: {
                id: requestId, // string UUID
                sender: { id: senderId },
                status: 'pending',
            },
        });

        if (!request) {
            throw new NotFoundException('Friend request not found or already processed');
        }

        await this.friendRequestRepository.remove(request);
    }
}
