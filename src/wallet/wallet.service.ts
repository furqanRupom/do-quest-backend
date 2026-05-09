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
}
