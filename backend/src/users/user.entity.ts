import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { FriendRequest } from '../friend-request/friend-request.entity';
import { Chat } from '../chat/chat.entity';
import { Message } from 'src/message/message.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;  

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'varchar', nullable: true })
    verificationToken: string | null;

    @Column({ type: 'varchar', nullable: true })
    resetToken: string | null;

    @Column({
        type: 'timestamp', 
        nullable: true
    })
    verificationTokenExpiresAt: Date | null;

    @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender)
    sentFriendRequests: FriendRequest[];

    @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
    receivedFriendRequests: FriendRequest[];

    @ManyToMany(() => User, (user) => user.friends)
    @JoinTable()
    friends: User[];

    @OneToMany(() => Message, (message) => message.sender)
    messages: Message[];

    @ManyToMany(() => Chat, (chat) => chat.participants)
    chats: Chat[];


    @Column({ default: false })
    isOnline: boolean;

    @Column({ nullable: true })
    lastSeen: Date;
}