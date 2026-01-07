import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../users/schemas/users.schema";
import { IUser } from "./interfaces/user.interface";

@Injectable()
export class AuthRepository {
    constructor(@InjectModel(User.name) private userModel:Model<UserDocument>) {}
    async createUser(createUserDto: CreateUserDto): Promise<IUser> {
        const user = (await this.userModel.create(createUserDto)).toObject();
        const { password, ...result } = user;
        return result;
    }
    async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserDocument | null> {
       return await this.userModel.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        }).exec();
    }
    async findById(id: string): Promise<UserDocument | null> {
        return await this.userModel.findById(id).exec();
    }
}