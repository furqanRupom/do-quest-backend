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
    const result = await this.walletModel.findOne({ user: userId })
    return result?.toObject()
  }
  // TODO: return Type
  async updateWallet(userId: string, walletData: any) {
    return await this.walletModel.findOneAndUpdate({ user: userId }, walletData)
  }
  async createWallet(userId:mongoose.Types.ObjectId){
    return await this.walletModel.create({user:userId})
  }
}
