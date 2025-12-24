import { Injectable } from '@nestjs/common';
import { User } from '../users/schemas/users.schema';
import { CreateUserDto } from './dto';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
    constructor(private readonly authRepository: AuthRepository) {}
    async registerUser(userData: CreateUserDto): Promise<Partial<User>> {
        return await this.authRepository.createUser(userData);
    }
}
