// friend-request.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class FriendRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.sentFriendRequests)
    sender: User;

    @ManyToOne(() => User, (user) => user.receivedFriendRequests)
    receiver: User;

    @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
    status: 'pending' | 'accepted' | 'rejected';

    @CreateDateColumn()
    createdAt: Date;
}