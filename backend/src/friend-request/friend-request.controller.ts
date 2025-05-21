import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Delete,
    Req,
    Res
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { Request, Response } from 'express';
import { User } from '../users/user.entity';

@Controller('friend-requests')
export class FriendRequestController {
    constructor(private readonly friendRequestService: FriendRequestService) { }

    @Post()
    async sendFriendRequest(
        @Req() req: Request,
        @Res() res: Response,
        @Body('receiverId') receiverId: number,
    ) {
        try {
            const userId = (req.user as User).id;
            console.log(userId)
            console.log(receiverId)
            const result = await this.friendRequestService.sendFriendRequest(
                userId,
                receiverId
            );
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post(':id/respond')
    async respondToFriendRequest(
        @Param('id') requestId: string,
        @Req() req: Request,
        @Res() res: Response,
        @Body('status') status: 'accepted' | 'rejected',
    ) {
        try {
            const userId = (req.user as User).id;
            console.log(userId, status, "from respond")
            const result = await this.friendRequestService.respondToFriendRequest(
                requestId,
                userId,
                status
            );
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Get()
    async getFriendRequests(@Req() req: Request, @Res() res: Response) {
        try {
            const userId = (req.user as User).id;
            const requests = await this.friendRequestService.getUserFriendRequests(
                userId
            );
            return res.status(200).json(requests);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Get('friends')
    async getFriends(@Req() req: Request, @Res() res: Response) {
        try {
            const userId = (req.user as User).id;
            const friends = await this.friendRequestService.getFriends(userId);
            return res.status(200).json(friends);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Delete(':id')
    async cancelFriendRequest(
        @Param('id') requestId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const userId = (req.user as User).id;
            await this.friendRequestService.cancelFriendRequest(
                requestId,
                userId
            );
            return res.status(204).send();
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
