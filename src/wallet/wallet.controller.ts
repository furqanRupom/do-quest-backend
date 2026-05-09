import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { UserRole } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { sendResponse } from '../common/utils';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.User)
  async getWallet(@Req() req: AuthRequest) {
    const result = await this.walletService.getUserWallet(req.user.sub)
    return sendResponse({
      success: true,
      message: "Fetched user wallet successfully",
      data: result
    })
  }
}
