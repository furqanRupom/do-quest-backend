import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types,Document } from "mongoose";

export type WalletDocument = Wallet & Document
@Schema({ timestamps: true })
export class Wallet {
    @Prop({ type: Types.ObjectId, ref: 'User', required:true ,unique:true })
    user: Types.ObjectId;

    @Prop({ default: 0 })
    availableBalance: number;

    @Prop({ default: 0 })
    pendingBalance: number;

    @Prop({ default: 0 })
    totalEarnings: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
