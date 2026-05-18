import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { WalletService } from '../wallet/wallet.service';
import { PaymentFlowStatus, TaskStatus } from '../tasks/enums/tasks.enum';

@Injectable()
export class StripeService {

  private readonly stripe: Stripe
  private readonly logger = new Logger(StripeService.name)
  
  // Separate secrets
  private readonly connectWebhookSecret: string;
  private readonly platformWebhookSecret: string;

  constructor(

    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,

    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService
  ) {

    this.stripe = new Stripe(configService.getOrThrow<string>('stripe.secretKey'), {
      apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
    });

    // Initialize both secrets
    this.connectWebhookSecret = this.configService.getOrThrow<string>('stripe.webhookSecret');
    this.platformWebhookSecret = this.configService.getOrThrow<string>('stripe.platformWebhookSecret');
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

      await this.usersService.findUserAndUpdate(userId, {
        userStripeId: accountId,
      });
    }


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

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
  async capturePaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.capture(paymentIntentId);
  }
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  // ──────────────────────────────────────────────────────
  // CONNECT WEBHOOK (account.updated, payouts, etc.)
  // ──────────────────────────────────────────────────────
  async handleConnectWebhook(body: Buffer, sig: string) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(body, sig, this.connectWebhookSecret);
    } catch (err) {
      throw new HttpException(
        `Connect Webhook verification failed: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Connect webhook received: ${event.type}`);

    try {
      switch (event.type) {
        // ── Payout Events (connected accounts) ──────────────
        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object as Stripe.Payout, event.account);
          break;

        case 'payout.failed':
          await this.handlePayoutFailed(event.data.object as Stripe.Payout, event.account);
          break;

        // ── Connected Account Events ─────────────────────────
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;

        case 'account.application.deauthorized':
          await this.handleAccountDeauthorized(event.data.object as Stripe.Application, event.account);
          break;

        default:
          this.logger.verbose(`Unhandled connect webhook event type: ${event.type}`);
      }
    } catch (err) {
      this.logger.error(`Error handling connect webhook ${event.type}: ${err.message}`, err.stack);
    }
    return { received: true };
  }


  // ──────────────────────────────────────────────────────
  // PLATFORM WEBHOOK (payment_intents, charges, transfers)
  // ──────────────────────────────────────────────────────
  async handlePlatformWebhook(body: Buffer, sig: string) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(body, sig, this.platformWebhookSecret);
    } catch (err) {
      throw new HttpException(
        `Platform Webhook verification failed: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Platform webhook received: ${event.type}`);

    try {
      switch (event.type) {
        // ── Payment Intent Events ────────────────────────────
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.amount_capturable_updated':
          await this.handlePaymentIntentAuthorized(event.data.object as Stripe.PaymentIntent);
          break;

        // ── Transfer Events ──────────────────────────────────
        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;

        // ── Charge Events ────────────────────────────────────
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case 'charge.dispute.created':
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        case 'charge.dispute.closed':
          await this.handleDisputeClosed(event.data.object as Stripe.Dispute);
          break;

        default:
          this.logger.verbose(`Unhandled platform webhook event type: ${event.type}`);
      }
    } catch (err) {
      this.logger.error(`Error handling platform webhook ${event.type}: ${err.message}`, err.stack);
    }
    return { received: true };
  }


  async createPaymentIntent(payload: CreatePaymentDto): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return this.stripe.paymentIntents.create({
      amount: payload.amount * 100,
      currency: payload.currency || 'usd',
      metadata: payload.metadata,
      capture_method: 'manual',
      automatic_payment_methods: {
        enabled: true,
      },
      transfer_group:payload?.metadata?.taskId
    });
  }
  async createTransfer(dto: {
    amount: number,
    destination: string,
    metadata: Record<string, string>,
    sourceTransactionId?:string
  }) {
    const { amount, destination, metadata, sourceTransactionId } = dto
    return await this.stripe.transfers.create({
      amount: amount,
      currency: 'usd',
      destination: destination,
      metadata: metadata || {},
      transfer_group:metadata?.taskId,
      source_transaction:sourceTransactionId
    })
  }

  private async handleAccountUpdated(stripeAccount: Stripe.Account) {

    const user = await this.usersService.findByStripeId(stripeAccount.id)
    if (!user) {

      this.logger.warn(`No user found for Stripe account ${stripeAccount.id}`);
      return
    }


    await this.usersService.findUserAndUpdate(user._id, {
      payoutsEnabled: stripeAccount.charges_enabled && stripeAccount.payouts_enabled,
      userStripeId: stripeAccount.id,
    });
    this.logger.log(
      `Account ${stripeAccount.id} updated. Payouts enabled: ${stripeAccount.payouts_enabled}`,
    );
  }


  /**
   * payment_intent.amount_capturable_updated
   * For manual-capture: funds are authorized but NOT yet captured.
   * This is the right event to mark the task as "active" and ready for submissions.
   */


  private async handlePaymentIntentAuthorized(intent: Stripe.PaymentIntent) {
    const taskId = intent.metadata?.taskId;
    const userId = intent.metadata?.userId;
    if (!taskId || !userId) return;

    await this.tasksService.updateTask(taskId, {
      paymentFlowStatus: PaymentFlowStatus.authorized,
      status: TaskStatus.active,
    });

    // Hold escrow in wallet (reflects authorized funds)
    await this.walletService.holdEscrow(userId, taskId, intent.amount);

    this.logger.log(`Task ${taskId} activated. Escrow held: $${intent.amount / 100}`);
  }



  /**
   * payment_intent.succeeded
   * For immediate-capture intents (not manual). Also fires after manual capture.
   */
  private async handlePaymentIntentSucceeded(intent: Stripe.PaymentIntent) {
    const taskId = intent.metadata?.taskId;
    if (!taskId) return;

    const task = await this.tasksService.findTaskByPaymentIntentId(intent.id);
    if (!task) {
      this.logger.warn(`No task found for paymentIntentId: ${intent.id}`);
      return;
    }

    // If task was manual capture, this fires after capture (submission approval)
    // If task was immediate capture, activate it here
    if (task.paymentFlowStatus !== PaymentFlowStatus.paid) {
      await this.tasksService.updateTask(task._id.toString(), {
        paymentFlowStatus: PaymentFlowStatus.paid,
        status: TaskStatus.active,
      });
    }

    this.logger.log(`PaymentIntent ${intent.id} succeeded for task ${taskId}`);
  }

  /**
   * payment_intent.payment_failed
   * Payment authorization failed — task should remain pending or be cancelled
   */
  private async handlePaymentIntentFailed(intent: Stripe.PaymentIntent) {
    const taskId = intent.metadata?.taskId;
    if (!taskId) return;

    await this.tasksService.updateTask(taskId, {
      paymentFlowStatus: PaymentFlowStatus.failed,
      status: TaskStatus.pending, // keep pending so creator can retry
    });

    const failureReason = intent.last_payment_error?.message ?? 'Unknown reason';
    this.logger.warn(`Payment failed for task ${taskId}: ${failureReason}`);
  }


  /**
   * payment_intent.canceled
   * Payment intent cancelled — task cancelled, refund wallet escrow
   */
  private async handlePaymentIntentCanceled(intent: Stripe.PaymentIntent) {
    const taskId = intent.metadata?.taskId;
    const userId = intent.metadata?.userId;
    if (!taskId || !userId) return;

    await this.tasksService.updateTask(taskId, {
      paymentFlowStatus: PaymentFlowStatus.cancelled,
      status: TaskStatus.cancelled,
    });

    // Refund escrow balance on creator's wallet
    await this.walletService.refundCreator(userId, taskId, intent.amount);

    this.logger.log(`Task ${taskId} cancelled. Refund processed for user ${userId}`);
  }


  /**
   * transfer.created
   * Stripe transfer to worker's connected account was created
   */
  private async handleTransferCreated(transfer: Stripe.Transfer) {
    const { taskId, submissionId, workerId } = transfer.metadata ?? {};
    this.logger.log(
      `Transfer ${transfer.id} created: $${transfer.amount / 100} to ${transfer.destination} for task ${taskId}`,
    );
    // Wallet already updated in SubmissionsService.approveSubmission()
    // This is for audit/logging purposes
  }

  /**
   * transfer.failed
   * Transfer to worker failed — revert wallet changes
   */
  private async handleTransferFailed(transfer: Stripe.Transfer) {
    const { taskId, workerId } = transfer.metadata ?? {};
    this.logger.error(
      `Transfer ${transfer.id} FAILED for task ${taskId}, worker ${workerId}`,
    );
    // TODO: Notify admin + worker, potentially revert submission approval
    // This is an edge case — implement dispute/resolution flow
  }


  /**
     * payout.paid
     * Connected account received payout to their bank account
     */
  private async handlePayoutPaid(payout: Stripe.Payout, connectedAccountId?: string) {
    if (!connectedAccountId) return;

    const user = await this.usersService.findByStripeId(connectedAccountId);
    if (!user) {
      this.logger.warn(`No user for connected account ${connectedAccountId}`);
      return;
    }

    await this.walletService.completeWithdrawal(
      user._id.toString(),
      payout.amount,
      payout.id,
    );

    this.logger.log(
      `Payout ${payout.id} completed: $${payout.amount / 100} for user ${user._id}`,
    );
  }

  /**
   * payout.failed
   * Payout to connected account's bank failed — revert pending balance
   */
  private async handlePayoutFailed(payout: Stripe.Payout, connectedAccountId?: string) {
    if (!connectedAccountId) return;

    const user = await this.usersService.findByStripeId(connectedAccountId);
    if (!user) return;

    await this.walletService.revertWithdrawal(
      user._id.toString(),
      payout.amount,
      payout.id,
    );

    this.logger.error(
      `Payout ${payout.id} FAILED for user ${user._id}. Funds returned to available balance.`,
    );
  }


  /**
   * account.application.deauthorized
   * Worker disconnected their Stripe account
   */
  private async handleAccountDeauthorized(
    _application: Stripe.Application,
    connectedAccountId?: string,
  ) {
    if (!connectedAccountId) return;

    const user = await this.usersService.findByStripeId(connectedAccountId);
    if (!user) return;

    await this.usersService.findUserAndUpdate(user._id, {
      payoutsEnabled: false,
      userStripeId: null,
    });

    this.logger.warn(
      `Stripe account deauthorized for user ${user._id}`,
    );
  }

  /**
     * charge.refunded
     * A charge was refunded (e.g., after dispute or manual refund)
     */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) return;

    const task = await this.tasksService.findTaskByPaymentIntentId(paymentIntentId);
    if (!task) return;

    await this.tasksService.updateTask(task._id.toString(), {
      paymentFlowStatus: PaymentFlowStatus.refunded,
    });

    this.logger.log(`Charge refunded for task ${task._id}`);
  }

  /**
   * charge.dispute.created
   * A payment was disputed by the cardholder
   */
  private async handleDisputeCreated(dispute: Stripe.Dispute) {
    const paymentIntentId = dispute.payment_intent as string;
    if (!paymentIntentId) return;

    const task = await this.tasksService.findTaskByPaymentIntentId(paymentIntentId);
    if (!task) return;

    await this.tasksService.updateTask(task._id.toString(), {
      status: TaskStatus.disputed,
    });

    this.logger.warn(
      `Dispute created for task ${task._id}. Amount: $${dispute.amount / 100}`,
    );
    // TODO: notify admin
  }

  /**
     * charge.dispute.closed
     * Dispute was resolved by Stripe
     */
  private async handleDisputeClosed(dispute: Stripe.Dispute) {
    const paymentIntentId = dispute.payment_intent as string;
    if (!paymentIntentId) return;

    const task = await this.tasksService.findTaskByPaymentIntentId(paymentIntentId);
    if (!task) return;

    // If won, reactivate. If lost, mark cancelled.
    const newStatus =
      dispute.status === 'won' ? TaskStatus.active : TaskStatus.cancelled;

    await this.tasksService.updateTask(task._id.toString(), {
      status: newStatus,
    });

    this.logger.log(
      `Dispute ${dispute.id} closed with status: ${dispute.status}. Task ${task._id} → ${newStatus}`,
    );
  }
}
