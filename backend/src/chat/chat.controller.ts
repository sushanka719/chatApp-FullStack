import { Controller, Get, Post, Body, Param, Req, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Request } from 'express';
import { MessageDto } from 'src/message/message.dto';

@Controller('chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get()
    async getUserChats(@Req() req: Request) {
        const user = req.user as any;
        return this.chatService.getUserChats(user.id);
    }

    @Post('private')
    async createPrivateChat(
        @Req() req: Request,
        @Body('userId', ParseIntPipe) otherUserId: number,
    ) {
        const user = req.user as any;
        return this.chatService.createPrivateChat(user.id, otherUserId);
    }

    // @Post('group')
    // async createGroupChat(
    //     @Req() req: Request,
    //     @Body('name') name: string,
    //     @Body('userIds') userIds: number[],
    // ) {
    //     const user = req.user as any;
    //     return this.chatService.createGroupChat(name, user.id, userIds);
    // }

    @Get(':chatId/messages')
    async getChatMessages(
        @Param('chatId') chatId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ): Promise<{ data: MessageDto[]; totalMessages: number; limit: number; page: number }> {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || pageNum < 0) {
            throw new BadRequestException('Invalid page number: must be a non-negative integer');
        }
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new BadRequestException('Invalid limit: must be between 1 and 100');
        }

        return this.chatService.getChatMessages(chatId, pageNum, limitNum);
    }
    
 
    @Post(':chatId/messages')
    // working
    async sendMessage(
        @Req() req: Request,
        @Param('chatId') chatId: string,
        @Body('content') content: string,
    ) {
        const user = req.user as any;
        console.log(user, "chatmess", content)
        return this.chatService.createMessage(user.id, chatId, content);
    }
}
