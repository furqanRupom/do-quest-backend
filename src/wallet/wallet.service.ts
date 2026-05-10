import { Injectable } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { ReleaseEsrowToWorkerDto } from './dto';

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
  async getTransactions(userId:string,page:number,limit:number){
    return await this.walletRepository.getTransactions(userId,page,limit)
  }
  async holdEscrow(userId:string,taskId:string,amount:number) {
    return await this.walletRepository.holdEscrow(userId,taskId,amount)
  }
  async releaseEscrowToWorker(dto:ReleaseEsrowToWorkerDto) {
    return await this.walletRepository.releaseEscrowToWorker(dto)
  }
  async refundCreator(userId:string,taskId:string,amount:number){
    return await this.walletRepository.refundCreator(userId,taskId,amount)
  }
  async debitForWithdrawal(userId:string,amount:number){
    return await this.walletRepository.debitForWithdrawal(userId,amount)
  }
  async completeWithdrawal(userId:string,amount:number,stripePayoutId:string) {
    return await this.walletRepository.completeWithdrawal(userId,amount,stripePayoutId)
  }
  async revertWithdrawal(userId:string,amount:number,stripePayout:string) {
    return await this.walletRepository.revertWithdrawal(userId,amount,stripePayout)
  }
}
