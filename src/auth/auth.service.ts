import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';
import { CreateUserDto } from './dto';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
    constructor(private readonly authRepository: AuthRepository) {}
    async registerUser(userData: CreateUserDto): Promise<Partial<User>> {
        return await this.authRepository.createUser(userData);
    }
}
