// chat/chat.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    OneToMany,
    JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from '../message/message.entity';

@Entity()
export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string; // For group chats

    @Column({ default: false })
    isGroup: boolean;

    @ManyToMany(() => User, (user) => user.chats)
    @JoinTable() 
    participants: User[];

    @OneToMany(() => Message, (message) => message.chat)
    messages: Message[];
}
  