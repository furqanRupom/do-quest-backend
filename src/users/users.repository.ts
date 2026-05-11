import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { Model } from 'mongoose';
import { IUser } from '../auth/interfaces/user.interface';
import { UserRole } from '../auth/enums/role.enum';
import { QueryBuilder } from '../common/db/query-builder';
import { CreateUserDto } from '../auth/dto';
import { UsersBaseQueryDto } from './dto';
import { UsersFilterableFields } from './constant/users.constant';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }

  async getUserById(id: string): Promise<UserDocument | null> {
    return await this.userModel.findById(id).exec();
  }
  async getUserWithoutPassword(id: string): Promise<IUser | null> {
    return await this.userModel.findById(id).select("-password").exec()
  }
  async createUser(createUserDto: CreateUserDto) {
    const {password,...result} = (await this.userModel.create(createUserDto)).toJSON()
    return result

  }
  async updateProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {


    const { socialLinks, ...otherFields } = updateData;

    const updatePayload: Record<string, any> = { ...otherFields };

    if (Array.isArray(socialLinks) && socialLinks.length > 0) {
      updatePayload.socialLinks = socialLinks;
    }

    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updatePayload },
        { new: true, runValidators: true },
      )
      .exec();
  }




  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) return;
    user.password = newPassword;
    await user.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async createAdmin(username: string, name: string, email: string, password: string) {

    return this.userModel.create({
      email,
      username,
      name,
      password,
      role: UserRole.Admin,
    });
  }
  async deleteAccount(userId: string): Promise<null> {
    await this.userModel.findByIdAndUpdate(userId, { isDeleted: true }, { new: true })
    return null
  }
  async findUserAndUpdate(userId: string, updateData: any) {
    return await this.userModel.findByIdAndUpdate(userId, updateData)
  }
  async countTotalUsers(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async getAllUsers(query: UsersBaseQueryDto) {
    const users = new QueryBuilder(this.userModel, query)
      .search(['name', 'email'])
      .filter(UsersFilterableFields)
      .sort()
      .paginate()
      .fields();
    const data = await users.modelQuery;
    const meta = await users.countTotal();
    return { data, meta };
  }

  async updateUser(userId: string, userUpdateDto: any) {
    const user = await this.userModel.findById(userId)

    if (!user) {
      throw new NotFoundException("User not found")
    }
    return await this.userModel.findByIdAndUpdate(userId, userUpdateDto, { new: true })
  }


  async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    }).exec();
  }
  async findById(id: string): Promise<UserDocument | null> {
    return await this.userModel.findById(id).exec();
  }
  async findByStripeId(userStripeId: string) {
    const result = await this.userModel.findOne({ userStripeId: userStripeId })
    return result?.toObject()
  }
}
