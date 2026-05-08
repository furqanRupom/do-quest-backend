import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { UsersRepository } from '../users/users.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  constructor(
    @InjectStripeClient() private readonly stripe: Stripe,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService
  ) { }


  async createOnBoardingLink(userId: string, currentStripeAccount: string | null) {
    let accountId = currentStripeAccount
    if (!accountId) {
      const account = await this.stripe.accounts.create({
        type: "express",
        metadata: { userId },
      })
      accountId = account.id
    }
    await this.usersRepository.findUserAndUpdate(userId, { userStripeId: accountId})
    const frontendUrl = this.configService.get<string>("frontendUrl")
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${frontendUrl}/settings/payouts?refresh=true`,
      return_url: `${frontendUrl}/settings/payouts?success=true`,
      type: "account_onboarding"
    })
    return { url: accountLink.url }

  }

  async createLoginLink(accountId: string) {
    const loginLink = await this.stripe.accounts.createLoginLink(accountId);
    return { url: loginLink.url };
  }

  async stripeWebhook(body:any,sig:string){
    const webhookSecretKey = this.configService.get<string>("webhookSecret") as string
    const event = this.stripe.webhooks.constructEvent(body,sig,webhookSecretKey)

    if(event.type === 'account.updated') {
      const stripeAccount = event.data.object
      const userId = stripeAccount?.metadata?.userId as string

      if(stripeAccount.details_submitted && stripeAccount.payouts_enabled) {
        await this.usersRepository.findUserAndUpdate(userId,{payoutsEnabled:true,userStripeId:stripeAccount.id})
      }
    }
    return {recived:true}
  }

  async createPaymentIntent(payload: CreatePaymentDto): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.create({
      amount: payload.amount,
      currency: payload.currency || 'usd',
      metadata: payload.metadata,
      capture_method: 'manual',
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
  async capturePaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.capture(paymentIntentId);
  }
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }
}
