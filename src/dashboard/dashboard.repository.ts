import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Submission, SubmissionDocument } from '../submission/schemas/submission.schema';
import { Task, TaskDocument } from '../tasks/schemas/tasks.schema';
import { WalletTransaction, WalletTransactionDocument } from '../wallet/schemas/wallet-transaction.schema';

import {
  TransactionType,
  TransactionCategory,
  TransactionStatus,
} from '../wallet/enums/wallet.enum';

import { SubmissionStatus } from '../submission/enums/submission.enum';
import { TaskStatus } from '../tasks/enums/tasks.enum';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Submission.name) private submissionModel: Model<SubmissionDocument>,
    @InjectModel(WalletTransaction.name)
    private walletTransactionModel: Model<WalletTransactionDocument>,
  ) {}

  /* =========================================================
   * 1. DASHBOARD META (WORKER + OWNER + WALLET)
   * ========================================================= */

  async getMeta(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const [worker] = await this.submissionModel.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $eq: ['$status', SubmissionStatus.approved] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', SubmissionStatus.rejected] }, 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', SubmissionStatus.pending] }, 1, 0],
            },
          },
        },
      },
    ]);

    const [owner] = await this.taskModel.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          activeTasks: {
            $sum: {
              $cond: [{ $eq: ['$status', TaskStatus.active] }, 1, 0],
            },
          },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ['$status', TaskStatus.completed] }, 1, 0],
            },
          },
          totalBudget: { $sum: '$budget' },
        },
      },
    ]);

    const [wallet] = await this.walletTransactionModel.aggregate([
      {
        $match: {
          user: userObjectId,
          status: TransactionStatus.completed,
        },
      },
      {
        $group: {
          _id: null,

          totalEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', TransactionType.credit] },
                    {
                      $in: [
                        '$category',
                        [
                          TransactionCategory.earning,
                          TransactionCategory.escrow_release,
                        ],
                      ],
                    },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },

          totalSpent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', TransactionType.debit] },
                    { $eq: ['$category', TransactionCategory.escrow_hold] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },

          totalWithdrawn: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', TransactionType.debit] },
                    { $eq: ['$category', TransactionCategory.withdrawal] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    return {
      worker: worker || {},
      owner: owner || {},
      wallet: wallet || {},
    };
  }

  /* =========================================================
   * 2. SUBMISSION GRAPH (WORKER)
   * ========================================================= */

  async getSubmissionGraph(userId: string, days = 30) {
    const userObjectId = new Types.ObjectId(userId);

    return await this.submissionModel.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: new Date(Date.now() - days * 86400000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  /* =========================================================
   * 3. EARNINGS GRAPH (REAL WALLET BASED)
   * ========================================================= */

  async getEarningsGraph(userId: string, days = 30) {
    const userObjectId = new Types.ObjectId(userId);

    return await this.walletTransactionModel.aggregate([
      {
        $match: {
          user: userObjectId,
          type: TransactionType.credit,
          status: TransactionStatus.completed,
          category: {
            $in: [
              TransactionCategory.earning,
              TransactionCategory.escrow_release,
            ],
          },
          createdAt: { $gte: new Date(Date.now() - days * 86400000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          amount: 1,
          _id: 0,
        },
      },
    ]);
  }

  /* =========================================================
   * 4. SPENDING GRAPH (CLIENT SIDE)
   * ========================================================= */

  async getSpendingGraph(userId: string, days = 30) {
    const userObjectId = new Types.ObjectId(userId);

    return await this.walletTransactionModel.aggregate([
      {
        $match: {
          user: userObjectId,
          type: TransactionType.debit,
          status: TransactionStatus.completed,
          category: TransactionCategory.escrow_hold,
          createdAt: { $gte: new Date(Date.now() - days * 86400000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          amount: 1,
          _id: 0,
        },
      },
    ]);
  }

  /* =========================================================
   * 5. TASK GRAPH (OWNER)
   * ========================================================= */

  async getTaskGraph(userId: string, days = 30) {
    const userObjectId = new Types.ObjectId(userId);

    return await this.taskModel.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: new Date(Date.now() - days * 86400000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  /* =========================================================
   * 6. SUBMISSION STATUS DISTRIBUTION
   * ========================================================= */

  async getSubmissionStatus(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    return await this.submissionModel.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  /* =========================================================
   * 7. CATEGORY ANALYTICS (OWNER)
   * ========================================================= */

  async getCategoryStats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    return await this.taskModel.aggregate([
      { $match: { user: userObjectId } },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  /* =========================================================
   * 8. FINANCE OVERVIEW (EARNINGS VS SPENDING)
   * ========================================================= */

  async getFinanceOverview(userId: string, days = 30) {
    const earnings = await this.getEarningsGraph(userId, days);
    const spending = await this.getSpendingGraph(userId, days);

    return { earnings, spending };
  }
}
