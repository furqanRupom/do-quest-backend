import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { ReleaseEsrowToWorkerDto } from './dto';
import { UsersService } from '../users/users.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class WalletService {
  constructor (
    private readonly walletRepository: WalletRepository,
    private readonly usersService:UsersService,
    private readonly stripeService:StripeService
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

  async withdrawFromWallet(userId:string,dto:{amount:number}) {
    const user = await this.usersService.findById(userId)
    if(!user){
      throw new  NotFoundException("User not found")
    }
    if (!user.userStripeId) {
      throw new HttpException(
        'You must connect a Stripe account before withdrawing. Complete onboarding first.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!user.payoutsEnabled) {
      throw new HttpException(
        'Your Stripe account is not yet verified for payouts.',
        HttpStatus.BAD_REQUEST,
      );
    }
 
    // Debit from wallet (moves to pending)
    const { wallet } = await this.debitForWithdrawal(
      userId,
      dto.amount,
    );
 
    const transfer = await this.stripeService.createTransfer({
      amount: dto.amount,
      destination: user.userStripeId,
      metadata: { userId: userId },
    });
    return {
      transferId:transfer.id,
      wallet
    }
  }
}
