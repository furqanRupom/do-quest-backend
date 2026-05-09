import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StripeService {

  private readonly stripe: Stripe
  constructor(

    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {

    this.stripe = new Stripe(configService.getOrThrow<string>('stripe.secretKey'), {
      apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion, // Cast to avoid TS errors if it's a preview version
    });
  }



  async createOnBoardingLink(
    userId: string,
    currentStripeAccount: string | null,
  ) {
    const frontendUrl = this.configService.get<string>('frontendUrl');

    if (!frontendUrl) {
      throw new HttpException(
        'Frontend URL is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let accountId = currentStripeAccount;

    if (!accountId) {
      const account = await this.stripe.accounts.create({
        type: 'express',
        metadata: { userId },
      });

      accountId = account.id;
    }

    await this.usersService.findUserAndUpdate(userId, {
      userStripeId: accountId,
    });

    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${frontendUrl}/settings/payouts?refresh=true`,
      return_url: `${frontendUrl}/settings/payouts?success=true`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }


  async createLoginLink(accountId: string) {
    const loginLink = await this.stripe.accounts.createLoginLink(accountId);
    return { url: loginLink.url };
  }


  async stripeWebhook(body: Buffer, sig: string) {
    const webhookSecretKey = this.configService.getOrThrow<string>('stripe.webhookSecret');
    console.log("WEBHOOOOOOOOOOOOKSSSSSS ------------------------------------------------------ TRIGGGGERED")
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(body, sig, webhookSecretKey);
    } catch (err) {
      // ✅ This gives you the exact reason Stripe rejects (sig mismatch, etc.)
      throw new HttpException(
        `Webhook signature verification failed: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (event.type === 'account.updated') {

    console.log("WEBHOOOOOOOOOOOOKSSSSSS ------------------INSIDE ACCOUNT UPDATE----------------------------------- TRIGGGGERED")
      const stripeAccount = event.data.object;
      const userId = stripeAccount?.metadata?.userId as string;
      if (stripeAccount.details_submitted && stripeAccount.payouts_enabled) {
        await this.usersService.findUserAndUpdate(userId, {
          payoutsEnabled: true,
          userStripeId: stripeAccount.id,
        });
      }
    }

    return { received: true };
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
