import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }
    //hello

    async signup(email: string, password: string, username: string) {
        const existing = await this.usersService.findByEmail(email);
        if (existing) throw new BadRequestException('Email already registered');

        const hashed = await bcrypt.hash(password, 10);
        const token = Math.random().toString(36).substring(2);
        const user = await this.usersService.create({
            email,
            password: hashed,
            verificationToken: token,
            username
        });

        await this.mailService.sendVerificationEmail(email, token);
        return { message: 'Signup successful. Verify your email.', success: true };
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        if (!user.isVerified) {
            throw new UnauthorizedException('Email not verified');
        }
        const payload = { sub: user.id };
        const token = this.jwtService.sign(payload);
        return { access_token: token };
    }

    async verifyEmail(token: string) {
        const user = await this.usersService.findByVerificationToken(token);
        if (!user) throw new BadRequestException('Invalid verification token');

        user.isVerified = true;
        user.verificationToken = null;
        await this.usersService.save(user);

        return { message: 'Email verified successfully' };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new NotFoundException('User not found');

        const token = Math.random().toString(36).substring(2);
        user.resetToken = token;
        await this.usersService.save(user);

        await this.mailService.sendResetPasswordEmail(email, token);
        return { message: 'Reset email sent' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.usersService.findByResetToken(token);
        if (!user) throw new BadRequestException('Invalid reset token');

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        await this.usersService.save(user);

        return { message: 'Password reset successful' };
    }

    // async checkAuth (token)

    async checkAuth(userId: number) {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Return only safe user fields
        const { id, email, username, isVerified } = user;
        return {
            id,
            email,
            username,
            isVerified,
        };
    }

    async logout() {
        return { message: 'Logged out successfully' };
    }
  }