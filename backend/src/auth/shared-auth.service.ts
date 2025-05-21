
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/users/user.entity'; 

@Injectable()
export class SharedAuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) { }

    async validateToken(token: string): Promise<User> {
        const jwtSecret = this.configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new InternalServerErrorException('JWT secret not configured');
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const userId = (decoded.userId || decoded.sub);
        if (!userId) {
            throw new UnauthorizedException('Token payload missing user ID');
        }

        const user = await this.usersService.findOne(parseInt(userId));
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}
