import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UserRequest } from 'src/interfaces/user-request/user-request.interface';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.usersService.delete(id);
    }

    @Get('search')
    async searchUsers(
        @Query('q') query: string,
        @Req() req: UserRequest,
    ) {
        console.log(query, req.user.id, "from search")
        if (!query || query.length < 3) {
            return [];
        }
        return this.usersService.searchUsers(query, req.user.id.toString());
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.usersService.findOne(id);
    }
}
