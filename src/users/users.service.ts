import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ChangePasswordDto, UpdateUserDto } from './dto';
import { IUser } from '../auth/interfaces/user.interface';
import { BaseQueryDto } from '../common/dto';
import { CreateUserDto } from '../auth/dto';
import { UserDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository
  ) { }

  async createUser(createUserDto: CreateUserDto) {
    return this.usersRepository.createUser(createUserDto)
  }
  async getUserProfile(userId: string): Promise<IUser> {
    const user = await this.usersRepository.getUserWithoutPassword(userId)
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    return user;
  }
  async updateUserProfile(userId: string, userProfileDto: UpdateUserDto): Promise<IUser | null> {
    const user = await this.usersRepository.updateProfile(userId, userProfileDto)
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

  async deleteMyAccount(userId: string): Promise<null> {
    return await this.usersRepository.deleteAccount(userId);
  }

  async countAllUsers() {
    return await this.usersRepository.countTotalUsers()
  }
  async getAllUsers(query: BaseQueryDto) {
    return await this.usersRepository.getAllUsers(query)
  }

  async updateUser(userId: string, updateUserDto: any) {
    return await this.usersRepository.updateUser(userId, updateUserDto)
  }


  async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserDocument | null> {
    return await this.usersRepository.findByUsernameOrEmail(usernameOrEmail)
  }
  async findById(id: string): Promise<UserDocument | null> {
    return await this.usersRepository.findById(id)
  }

  async findUserAndUpdate(userId:any,updateData:any){
    return await this.usersRepository.findUserAndUpdate(userId,updateData)
  }
  async findByStripeId(userStripeId:string) {
    return await this.usersRepository.findByStripeId(userStripeId)
  }
}
