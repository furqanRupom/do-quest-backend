import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole } from "../../auth/enums/role.enum";


export type UserDocument = HydratedDocument<User, UserMethods>;

@Schema({ timestamps: true })
export class User {

  @Prop({ required: true })
  name: string = '';

  @Prop({ required: true, unique: true })
  username: string = '';

  @Prop({ required: true, unique: true })
  email: string = '';

  @Prop({ unique: true })
  userStripeId: string = ''

  @Prop({unique:true})
  walletId:string = ''

  @Prop({default: false })
  payoutsEnabled: boolean = false

  @Prop({ required: true })
  password: string = '';

  @Prop({ type: String, enum: UserRole, default: UserRole.User })
  role: UserRole = UserRole.User;

  @Prop()
  location: string = '';

  @Prop()
  company: string = '';

  @Prop()
  socialLinks: string[] = [];

  @Prop({ default: false })
  needPasswordChange: boolean = false

  @Prop({ default: false })
  isDeleted: boolean = false


}
export const UserSchema = SchemaFactory.createForClass(User);

export interface UserMethods {
  comparePassword(password: string): Promise<boolean>;
}

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
}
