import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { User } from 'src/users/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('test')
    test() {
        return 'Test endpoint works!';
    }

    @Post('signup')
    async signup(@Body() body: AuthDto) {
        return this.authService.signup(body.email, body.password, body.username);
    }

    @Post('login')
    async login(@Body() body: AuthDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.authService.login(body.email, body.password);
        res.cookie('token', data.access_token, {
            httpOnly: true,
        });
        return { message: 'Logged in' };
    }

    @Get('verify')
    async verify(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Get('check')
    async checkAuth(@Req() req: Request, @Res() res: Response) {
        try {
            const userId = (req.user as User).id;
            console.log(userId);
            const user = await this.authService.checkAuth(userId);
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(error.status ?? 500).json({
                success: false,
                message: error.message ?? 'Server error',
            });
        }
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        try {
            res.clearCookie('token', {
                httpOnly: true,
            });
            const result = await this.authService.logout();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(error.status ?? 500).json({
                success: false,
                message: error.message ?? 'Server error',
            });
        }
    }
}