import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, walletSchema } from './schemas/wallet.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:Wallet.name,schema:walletSchema}])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [MongooseModule.forFeature([{ name: Wallet.name, schema: walletSchema }])],
})
export class WalletModule {}
