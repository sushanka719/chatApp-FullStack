import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequest } from './friend-request.entity';
import { User } from '../users/user.entity';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, User]), ChatModule], 
  providers: [FriendRequestService],
  controllers: [FriendRequestController],
})
export class FriendRequestModule { }
