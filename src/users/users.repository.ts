import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { Model } from 'mongoose';
import { IUser } from '../auth/interfaces/user.interface';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async getUserById(id: string): Promise<UserDocument | null> {
        return await this.userModel.findById(id).exec();
    }
    async getUserWithoutPassword(id: string): Promise<IUser | null> {
        const user = await this.userModel.findById(id).select("-password").exec()
        if (!user) {
            return null
        }
        return user

    }
    async updateProfile(
        userId: string,
        updateData: Partial<UserDocument>,
    ): Promise<UserDocument | null> {
        const { socialLinks, ...otherFields } = updateData;

        const update: any = { $set: otherFields };

        // Handle socialLinks separately with $addToSet only if provided
        if (Array.isArray(socialLinks)) {
            update.$addToSet = { socialLinks: { $each: socialLinks } };
        }

        return this.userModel
            .findByIdAndUpdate(userId, update, {
                new: true,
                runValidators: true,
            })
            .exec();
    }

    async updateUserPassword(userId: string, newPassword: string): Promise<void> {
        const user = await this.userModel.findById(userId);
        if (!user) return;
        user.password = newPassword;
        await user.save();
    }

}
