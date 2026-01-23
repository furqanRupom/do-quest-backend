import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';

@Injectable()
export class StripeService {
    constructor(
        @InjectStripeClient() private readonly stripe: Stripe
    ) {}

    async createPaymentIntent(payload:CreatePaymentDto):Promise<Stripe.Response<Stripe.PaymentIntent>> {
        return this.stripe.paymentIntents.create({
            amount: payload.amount,
            currency: payload.currency || 'usd',
            metadata: payload.metadata,
            capture_method:'manual',
            automatic_payment_methods: {
                enabled: true,
            },
        });
    }

    async retrievePaymentIntent(paymentIntentId:string):Promise<Stripe.Response<Stripe.PaymentIntent>> {
        return this.stripe.paymentIntents.retrieve(paymentIntentId);
    }
    async capturePaymentIntent(paymentIntentId:string):Promise<Stripe.Response<Stripe.PaymentIntent>> {
        return this.stripe.paymentIntents.capture(paymentIntentId);
    }
    async cancelPaymentIntent(paymentIntentId:string):Promise<Stripe.Response<Stripe.PaymentIntent>> {
        return this.stripe.paymentIntents.cancel(paymentIntentId);
    }
}
