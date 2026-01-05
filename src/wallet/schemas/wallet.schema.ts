import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Wallet {
    @Prop({ required: true, unique: true, index: true })
    userId: string

    @Prop({ default: 0 })
    availableBalance: number

    @Prop({ default: 0 })
    pendingBalance: number

    @Prop({ default: 0 })
    totalEarnings: number
}
export const walletSchema = SchemaFactory.createForClass(Wallet)