import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(user: Partial<User>): Promise<User> {
        const newUser = this.usersRepository.create(user);
        return this.usersRepository.save(newUser);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: number): Promise<User> {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }

    async findByVerificationToken(verificationToken: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ verificationToken });
    }

    async findByResetToken(resetToken: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ resetToken });
    }

    async update(id: number, updateData: Partial<User>): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateData);
        return this.usersRepository.save(user);
    }

    async save(user: User): Promise<User> {
        return this.usersRepository.save(user);
    }

    async delete(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }

    async searchUsers(query: string, currentUserId: string): Promise<User[]> {
        return this.usersRepository
            .createQueryBuilder('user')
            .where('user.id != :currentUserId', { currentUserId })
            .andWhere(
                '(LOWER(user.username) LIKE LOWER(:query) OR LOWER(user.email) LIKE LOWER(:query))',
                { query: `%${query}%` },
            )
            .select(['user.id', 'user.username', 'user.email']) // Only return safe fields
            .getMany();
    }

    async updateUserStatus(userId: number, isOnline: boolean): Promise<User> {
        const user = await this.findOne(userId);
        user.isOnline = isOnline;  
        return this.usersRepository.save(user);
    }
    
}