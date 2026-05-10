import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TransactionCategory, TransactionStatus, TransactionType } from '../enums/wallet.enum';

export type WalletTransactionDocument = WalletTransaction & Document;


@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  task?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Submission' })
  submission?: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(TransactionType), required: true })
  type: TransactionType;

  @Prop({ type: Number, required: true })
  amount: number; // in cents

  @Prop({
    type: String,
    enum: Object.values(TransactionCategory),
    required: true,
  })
  category: TransactionCategory;

  @Prop({ type: String })
  stripeTransferId?: string;

  @Prop({ type: String })
  stripePayoutId?: string;

  @Prop({
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.pending,
  })
  status: TransactionStatus;

  @Prop({ type: String })
  description?: string;

}

export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);
