import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateaway';
import { Chat } from './chat.entity';
import { Message } from '../message/message.entity';
import { UsersModule } from '../users/users.module';
import { User } from 'src/users/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule, 
        TypeOrmModule.forFeature([Chat, Message, User]),
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
                signOptions: { expiresIn: '9h' }, // Match AuthModule
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [ChatService, ChatGateway],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule { }