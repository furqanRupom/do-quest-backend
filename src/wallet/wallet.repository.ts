import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet> 
  ){}


  async getWallet(userId:string) {
    const result =  await this.walletModel.findOne({user:userId})
    return result?.toObject()
  }

  async updateWallet(userId:string,walletData:any) {
    return await this.walletModel.findOneAndUpdate({user:userId},walletData)
  }

}
