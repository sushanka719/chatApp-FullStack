import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    async sendVerificationEmail(email: string, token: string) {
        const verifyLink = `http://localhost:5000/auth/verify?token=${token}`;
        await this.transporter.sendMail({
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Click to verify: <a href="${verifyLink}">${verifyLink}</a></p>`,
        });
    }

    async sendResetPasswordEmail(email: string, token: string) {
        const verifyLink = `http://localhost:5000/auth/verify?token=${token}`;
        await this.transporter.sendMail({
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Click to verify: <a href="${verifyLink}">${verifyLink}</a></p>`,
        }); 
    }
}
