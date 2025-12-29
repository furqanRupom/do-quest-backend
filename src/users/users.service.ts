import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ChangePasswordDto, UpdateUserDto, UserProfileResponseDto } from './dto';
import { IUser } from '../auth/interfaces/user.interface';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository
    ) { }
    async getUserProfile(userId: string):Promise<IUser | null> {
        const user = this.usersRepository.getUserWithoutPassword(userId)
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        }
        return user;

    }
    async updateUserProfile(userId: string, userProfileDto: UpdateUserDto): Promise<IUser | null> {
        const user = this.usersRepository.updateProfile(userId,userProfileDto)
        return user;
     }
    async changeUserPassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const user = await this.usersRepository.getUserById(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const isCurrentPasswordValid = await user.comparePassword(changePasswordDto.currentPassword);
        if (!isCurrentPasswordValid) {
            throw new HttpException('Current password is incorrect', HttpStatus.BAD_REQUEST);
        }
        await this.usersRepository.updateUserPassword(userId, changePasswordDto.newPassword)
    }

}
