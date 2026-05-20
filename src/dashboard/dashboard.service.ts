import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { DashboardQueryDto } from './dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async getMeta(userId: string) {
    return await this.dashboardRepository.getMeta(userId);
  }

  async getSubmissionGraph(userId: string, query: DashboardQueryDto) {
    const range = this.parseRange(query.range);
    return await this.dashboardRepository.getSubmissionGraph(userId, range);
  }

  async getEarningsGraph(userId: string, query: DashboardQueryDto) {
    const range = this.parseRange(query.range);
    return await this.dashboardRepository.getEarningsGraph(userId, range);
  }

  async getSpendingGraph(userId: string, query: DashboardQueryDto) {
    const range = this.parseRange(query.range);
    return await this.dashboardRepository.getSpendingGraph(userId, range);
  }

  async getTaskGraph(userId: string, query: DashboardQueryDto) {
    const range = this.parseRange(query.range);
    return await this.dashboardRepository.getTaskGraph(userId, range);
  }

  async getSubmissionStatus(userId: string) {
    return await this.dashboardRepository.getSubmissionStatus(userId);
  }

  async getCategoryStats(userId: string) {
    return await this.dashboardRepository.getCategoryStats(userId);
  }

  async getFinanceOverview(userId: string, query: DashboardQueryDto) {
    const range = this.parseRange(query.range);
    return await this.dashboardRepository.getFinanceOverview(userId, range);
  }

  private parseRange(range?: string): number {
    if (!range) return 30;

    if (range === '7d') return 7;
    if (range === '30d') return 30;
    if (range === '12m') return 365;

    return 30;
  }
}
