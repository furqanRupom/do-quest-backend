import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/users/schemas/users.schema";

@Injectable()
export class AuthRepository {
    constructor(@InjectModel(User.name)private userModel:Model<User>) {}
    async createUser(createUserDto: CreateUserDto): Promise<Partial<CreateUserDto>> {
        const user = (await this.userModel.create(createUserDto)).toObject();
        const { password, ...result } = user;
        return result;
    }
}