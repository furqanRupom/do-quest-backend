import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";


export type UserDocument = HydratedDocument<User, UserMethods>;
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop()
  location: string;

  @Prop()
  company: string

  @Prop()
  socialLinks: string[];
 
 
}
export const UserSchema = SchemaFactory.createForClass(User);

export interface UserMethods {
  comparePassword(password: string): Promise<boolean>;
}

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
}
