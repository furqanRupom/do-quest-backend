import { Injectable } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';

@Injectable()
export class WalletService {
  constructor (
    private readonly walletRepository: WalletRepository
  ) {}

  async getUserWallet(userId:string) {
    return await this.walletRepository.getWallet(userId)
  }

  async createWalletForUser(userId:string ){
    return await this.walletRepository.createWallet(userId)
  }

  // async cleanWallet() {
  //   return await this.walletRepository.removeAll()
  // }
}
