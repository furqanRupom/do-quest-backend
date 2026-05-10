import {  forwardRef, Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { WalletRepository } from './wallet.repository';
import { WalletTransaction, WalletTransactionSchema } from './schemas/wallet-transaction.schema';
import { UsersModule } from '../users/users.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
    UsersModule,
    forwardRef(()=> StripeModule)
      
  ],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [WalletService, WalletRepository],
})
export class WalletModule { }
