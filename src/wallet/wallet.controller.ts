import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { UserRole } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators';
import type { AuthRequest } from 'src/auth/types/auth-request.type';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService){}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.User)
  async getWallet( @Req() req : AuthRequest ){}
}
