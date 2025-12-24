import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import bcrypt from "node_modules/bcryptjs";
import config from "src/config/config";


export type UserDocument = HydratedDocument<User>;
enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}
@Schema({timestamps: true})
export class User {
    @Prop({required: true})
    name: string;
    
    @Prop({unique: true})
    username:string;

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({enum: UserRole,default: UserRole.USER})
    role: UserRole;

    @Prop()
    localtion:string;

    @Prop()
    company:string

    @Prop()
    socialLinks:string[];
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next:(err?: Error) => void) {
  try {
      if (!this.isModified('password')) return next();
      this.password = await bcrypt.hash(this.password, 10);
      next();
  } catch (error) {
    next(error);
  }
});

