import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { STRIPE_CLIENT_TOKEN } from '@golevelup/nestjs-stripe';

describe('StripeService', () => {
  let service: StripeService;
  let stripe: any;

  const mockStripe = {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      capture: jest.fn(),
      cancel: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: STRIPE_CLIENT_TOKEN,
          useValue: mockStripe,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    stripe = module.get(STRIPE_CLIENT_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent', async () => {
      const dto = {
        amount: 1000,
        currency: 'usd',
        metadata: { taskId: '123' },
      };

      const mockResponse = { id: 'pi_123' } as Stripe.PaymentIntent;
      stripe.paymentIntents.create.mockResolvedValue(mockResponse);

      const result = await service.createPaymentIntent(dto);

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        metadata: { taskId: '123' },
        capture_method: 'manual',
        automatic_payment_methods: {
          enabled: true,
        },
      });
      expect(result).toBe(mockResponse);
    });

    it('should default currency to usd', async () => {
      const dto = { amount: 500 };

      stripe.paymentIntents.create.mockResolvedValue({ id: 'pi_456' });

      await service.createPaymentIntent(dto as any);

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500,
          currency: 'usd',
        }),
      );
    });
  });

  describe('retrievePaymentIntent', () => {
    it('should retrieve payment intent', async () => {
      const mockResponse = { id: 'pi_123' };
      stripe.paymentIntents.retrieve.mockResolvedValue(mockResponse);

      const result = await service.retrievePaymentIntent('pi_123');

      expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123');
      expect(result).toBe(mockResponse);
    });
  });

  describe('capturePaymentIntent', () => {
    it('should capture payment intent', async () => {
      const mockResponse = { id: 'pi_123', status: 'succeeded' };
      stripe.paymentIntents.capture.mockResolvedValue(mockResponse);

      const result = await service.capturePaymentIntent('pi_123');

      expect(stripe.paymentIntents.capture).toHaveBeenCalledWith('pi_123');
      expect(result).toBe(mockResponse);
    });
  });

  describe('cancelPaymentIntent', () => {
    it('should cancel payment intent', async () => {
      const mockResponse = { id: 'pi_123', status: 'canceled' };
      stripe.paymentIntents.cancel.mockResolvedValue(mockResponse);

      const result = await service.cancelPaymentIntent('pi_123');

      expect(stripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_123');
      expect(result).toBe(mockResponse);
    });
  });
});
