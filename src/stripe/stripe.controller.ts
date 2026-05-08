import { Controller, Post,  Req, UseGuards } from '@nestjs/common';
import { UserRole } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { Roles } from '../common/decorators';
import { StripeService } from './stripe.service';
import { sendResponse } from 'src/common/utils';
import type {Request} from "express"
import type { RawBodyRequest } from '@nestjs/common';

@Controller('stripe')
export class StripeController {

  constructor(
    private readonly stripeService: StripeService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.User)
  @Post("onboarding")
  async getOnBoardingLink(@Req() req: AuthRequest) {
    const result = await this.stripeService.createOnBoardingLink(req.user.sub, req.user.userStripeId)
    return sendResponse({
      success: true,
      message: "Stripe onboarding link created successfully",
      data: result
    })
  }
  @Post("webhook")
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const sig = req.headers['stripe-signature'] as string
    return await this.stripeService.stripeWebhook(req.body, sig)
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.User)
  @Post("login-link")
  async getLoginLink(@Req() req: AuthRequest) {
    const accountId = req.user.userStripeId;

    const result = await this.stripeService.createLoginLink(accountId as string);

    return sendResponse({
      success: true,
      message: "Stripe dashboard link created",
      data: result
    });
  }
}
