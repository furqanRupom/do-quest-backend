import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { WalletTransaction } from './schemas/wallet-transaction.schema';
import { TransactionCategory, TransactionStatus, TransactionType } from './enums/wallet.enum';
import { QueryBuilder } from 'src/common/db/query-builder';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(WalletTransaction.name) private walletTransactinModel: Model<WalletTransaction>
  ) { }

  async getWallet(userId: string) {
    const result = await this.walletModel.findOne({ user: new mongoose.Types.ObjectId(userId) })
    return result?.toObject()
  }

  async updateWallet(userId: string, walletData: any) {
    return await this.walletModel.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      walletData,
      { new: true }
    );
  }

  async createWallet(userId: string) {
    return (await this.walletModel.create({
      user: new mongoose.Types.ObjectId(userId),
    })).toObject();
  }

  async removeAll() {
    return await this.walletModel.deleteMany()
  }

  async getOrCreateWallet(userId: string): Promise<WalletDocument> {
    const existingWallet = await this.walletModel.findOne({
      user: new Types.ObjectId(userId)
    })
    if (existingWallet) return existingWallet as unknown as WalletDocument
    return await this.walletModel.create({ user: new Types.ObjectId(userId) }) as unknown as WalletDocument
  }

  async getTransactions(
    userId: string,
    query: Record<string, unknown>
  ) {
    const queryBuilder = new QueryBuilder(this.walletTransactinModel, query)
      .search(['description'])
      .filter(['status', 'type', 'category'], { user: new Types.ObjectId(userId) })
      .sort()
      .paginate()
      .populate([
        { path: 'task', select: 'title budget' },
        { path: 'submission', select: 'message status' }
      ]);
    const data = await queryBuilder.modelQuery
    const meta = await queryBuilder.countTotal()
    return { data, meta }
  }

  // ─── Mutations ───────────────────────────────────────────────

  /**
   * Creator funds escrow when task payment is confirmed
   */
  async holdEscrow(
    userId: string,
    taskId: string,
    amount: number,
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    
    //  FIX: Do NOT add to pendingBalance. The funds are held by Stripe, not in the internal wallet.
    // wallet.pendingBalance += amount; 
    
    await wallet.save();

    await this.walletTransactinModel.create({
      user: new Types.ObjectId(userId),
      task: new Types.ObjectId(taskId),
      type: TransactionType.debit,
      amount,
      category: TransactionCategory.escrow_hold,
      status: TransactionStatus.completed,
      description: `Escrow funded for task`,
    });

    return wallet;
  }

  /**
   * Release escrow from creator → credit worker's available balance
   */
  async releaseEscrowToWorker(params: {
    creatorId: string;
    workerId: string;
    taskId: string;
    submissionId: string;
    amount: number;
    stripeTransferId: string;
  }) {
    const { creatorId, workerId, taskId, submissionId, amount, stripeTransferId } = params;

    //  FIX: Do NOT deduct from creatorWallet.pendingBalance because we never added it.
    const creatorWallet = await this.getOrCreateWallet(creatorId);
    await creatorWallet.save();

    await this.walletTransactinModel.create({
      user: new Types.ObjectId(creatorId),
      task: new Types.ObjectId(taskId),
      submission: new Types.ObjectId(submissionId),
      type: TransactionType.debit,
      amount,
      category: TransactionCategory.escrow_release,
      stripeTransferId,
      status: TransactionStatus.completed,
      description: `Escrow released to worker`,
    });

    // Credit worker's available balance (Worker earned money on the platform)
    const workerWallet = await this.getOrCreateWallet(workerId);
    workerWallet.availableBalance += amount;
    workerWallet.totalEarnings += amount;
    await workerWallet.save();

    await this.walletTransactinModel.create({
      user: new Types.ObjectId(workerId),
      task: new Types.ObjectId(taskId),
      submission: new Types.ObjectId(submissionId),
      type: TransactionType.credit,
      amount,
      category: TransactionCategory.earning,
      stripeTransferId,
      status: TransactionStatus.completed,
      description: `Bounty earned from approved submission`,
    });
  }

  /**
   * Refund creator when task is cancelled
   */
  async refundCreator(
    userId: string,
    taskId: string,
    amount: number,
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    
    //  FIX: Do NOT modify pendingBalance. The refund happens directly on their Stripe card.
    // wallet.pendingBalance = Math.max(0, wallet.pendingBalance - amount);
    await wallet.save();

    await this.walletTransactinModel.create({
      user: new Types.ObjectId(userId),
      task: new Types.ObjectId(taskId),
      type: TransactionType.credit,
      amount,
      category: TransactionCategory.refund,
      status: TransactionStatus.completed,
      description: `Refund for cancelled task`,
    });

    return wallet;
  }

  /**
   * Worker initiates payout to their Stripe connected account
   */
  async debitForWithdrawal(
    userId: string,
    amount: number,
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.availableBalance < amount) {
      throw new HttpException(
        'Insufficient available balance',
        HttpStatus.BAD_REQUEST,
      );
    }
    wallet.availableBalance -= amount;
    wallet.pendingBalance += amount; // hold while payout processes
    await wallet.save();

    const tx = await this.walletTransactinModel.create({
      user: new Types.ObjectId(userId),
      type: TransactionType.debit,
      amount,
      category: TransactionCategory.withdrawal,
      status: TransactionStatus.pending,
      description: `Withdrawal initiated`,
    });

    return { wallet, transactionId: tx._id.toString() };
  }

  /**
   * Mark withdrawal transaction completed (called from webhook)
   */
  async completeWithdrawal(
    userId: string,
    amount: number,
    stripePayoutId: string,
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - amount);
    await wallet.save();

    await this.walletTransactinModel.findOneAndUpdate(
      {
        user: new Types.ObjectId(userId),
        category: TransactionCategory.withdrawal,
        status: TransactionStatus.pending,
        amount,
      },
      { status: TransactionStatus.completed, stripePayoutId },
    );
  }

  /**
   * Revert pending withdrawal on failure (payout.failed webhook)
   */
  async revertWithdrawal(
    userId: string,
    amount: number,
    stripePayoutId: string,
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - amount);
    wallet.availableBalance += amount; // return funds
    await wallet.save();

    await this.walletTransactinModel.findOneAndUpdate(
      {
        user: new Types.ObjectId(userId),
        category: TransactionCategory.withdrawal,
        status: TransactionStatus.pending,
        amount,
      },
      { status: TransactionStatus.failed, stripePayoutId },
    );
  }
}
