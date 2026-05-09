import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>
  ) { }

  // TODO: return Type
  async getWallet(userId: string) {
    const result = await this.walletModel.findOne({ user: new mongoose.Types.ObjectId(userId) })
    return result?.toObject()
  }
  // TODO: return Type
  //

  async updateWallet(userId: string, walletData: any) {
    return await this.walletModel.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      walletData,
      { new: true }
    );
  }


  async createWallet(userId: string) {
    return (await this.walletModel.create({
      user: new mongoose.Types.ObjectId(userId),
    })).toObject();
  }

  async removeAll(){
    return await this.walletModel.deleteMany()
  }
}
