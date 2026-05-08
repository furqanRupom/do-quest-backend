import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { Model } from 'mongoose';
import { IUser } from '../auth/interfaces/user.interface';
import { UserRole } from '../auth/enums/role.enum';

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
  async findUserAndUpdate(userId:string,updateData:any){
    return await this.userModel.findByIdAndUpdate(userId,updateData)
  }
}
