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
       return await this.userModel.findById(id).select("-password").exec()
    }
    async updateProfile(
        userId: string,
        updateData: Partial<User>,
    ): Promise<UserDocument | null> {
        const { socialLinks, ...otherFields } = updateData;

        if (Array.isArray(socialLinks) && socialLinks.length > 0) {
            return this.userModel
                .findByIdAndUpdate(
                    userId,
                    [
                        {
                            $set: {
                                ...otherFields,
                                socialLinks: {
                                    $concatArrays: [
                                        {
                                            $filter: {
                                                input: { $ifNull: ['$socialLinks', []] },
                                                as: 'link',
                                                cond: {
                                                    $not: {
                                                        $in: [
                                                            { $arrayElemAt: [{ $split: ['$$link', '/'] }, 0] },
                                                            {
                                                                $map: {
                                                                    input: socialLinks,
                                                                    as: 'newLink',
                                                                    in: { $arrayElemAt: [{ $split: ['$$newLink', '/'] }, 0] }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        socialLinks
                                    ]
                                }
                            }
                        }
                    ],
                    {
                        new: true,
                        runValidators: true,
                        updatePipeline:true
                    }
                )
                .exec();
        }

        return this.userModel
            .findByIdAndUpdate(
                userId,
                { $set: otherFields },
                {
                    new: true,
                    runValidators: true,
                }
            )
            .exec();
    }

    async updateUserPassword(userId: string, newPassword: string): Promise<void> {
        const user = await this.userModel.findById(userId);
        if (!user) return;
        user.password = newPassword;
        await user.save();
    }

}
