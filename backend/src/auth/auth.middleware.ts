import { Injectable, NestMiddleware } from '@nestjs/common';
import { SharedAuthService } from 'src/auth/shared-auth.service'; // adjust path
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly sharedAuthService: SharedAuthService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        console.log('Auth middleware triggered');

        const tokenRaw = req.cookies?.token;

        if (!tokenRaw) {
            console.error('No token found in cookies');
            return res.status(401).json({ message: 'Unauthorized - no token provided' });
        }

        const token = tokenRaw.replace('Bearer ', '').trim();

        try {
            const user = await this.sharedAuthService.validateToken(token);
            req.user = user;
            next();
        } catch (err) {
            console.error('Auth middleware error:', err.message);
            return res.status(401).json({ message: 'Unauthorized - ' + err.message });
        }
    }
}
