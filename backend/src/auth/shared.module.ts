import { Module } from '@nestjs/common';
import { SharedAuthService } from './shared-auth.service';
import { UsersModule } from '../users/users.module'; // ✅ import this

@Module({
    imports: [UsersModule], // ✅ include UsersModule here
    providers: [SharedAuthService],
    exports: [SharedAuthService],
})
export class SharedModule { }
