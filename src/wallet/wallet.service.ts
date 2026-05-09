import { Injectable } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import mongoose from 'mongoose';

@Injectable()
export class WalletService {
  constructor (
    private readonly walletRepository: WalletRepository
  ) {}

  async getUserWallet(userId:string) {
    return await this.walletRepository.getWallet(userId)
  }

  async createWallet(userId:mongoose.Types.ObjectId ){
    return await this.walletRepository.createWallet(userId)
  }
}
