
// message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Chat } from '../chat/chat.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @ManyToOne(() => User, (user) => user.messages)
    sender: User;

    @ManyToOne(() => Chat, (chat) => chat.messages)
    chat: Chat;
}