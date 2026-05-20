import {
  Controller,
  UseGuards,
  Get,
  Req,
  Query,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Roles } from 'src/common/decorators';
import { UserRole } from 'src/auth/enums/role.enum';
import type { AuthRequest } from '../auth/types/auth-request.type';

import { sendResponse } from 'src/common/utils';
import {
  DashboardQueryDto,
  DashboardMetaResponseDto,
} from './dto';

import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.User)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('meta')
  @ApiOperation({ summary: 'Get dashboard meta (worker + owner + wallet)' })
  @ApiOkResponse({ type: DashboardMetaResponseDto })
  async getMeta(@Req() req: AuthRequest) {
    const result = await this.dashboardService.getMeta(req.user.sub);

    return sendResponse({
      success: true,
      message: 'Fetched meta data successfully',
      data: result,
    });
  }


  @Get('graph/submissions')
  @ApiOperation({ summary: 'Get submission graph (worker)' })
  async getSubmissionGraph(
    @Req() req: AuthRequest,
    @Query() query: DashboardQueryDto,
  ) {
    const result = await this.dashboardService.getSubmissionGraph(
      req.user.sub,
      query,
    );

    return sendResponse({
      success: true,
      message: 'Fetched submission graph successfully',
      data: result,
    });
  }


  @Get('graph/earnings')
  @ApiOperation({ summary: 'Get earnings graph (wallet)' })
  async getEarningsGraph(
    @Req() req: AuthRequest,
    @Query() query: DashboardQueryDto,
  ) {
    const result = await this.dashboardService.getEarningsGraph(
      req.user.sub,
      query,
    );

    return sendResponse({
      success: true,
      message: 'Fetched earnings graph successfully',
      data: result,
    });
  }


  @Get('graph/spending')
  @ApiOperation({ summary: 'Get spending graph (owner escrow)' })
  async getSpendingGraph(
    @Req() req: AuthRequest,
    @Query() query: DashboardQueryDto,
  ) {
    const result = await this.dashboardService.getSpendingGraph(
      req.user.sub,
      query,
    );

    return sendResponse({
      success: true,
      message: 'Fetched spending graph successfully',
      data: result,
    });
  }


  @Get('graph/tasks')
  @ApiOperation({ summary: 'Get task creation graph (owner)' })
  async getTaskGraph(
    @Req() req: AuthRequest,
    @Query() query: DashboardQueryDto,
  ) {
    const result = await this.dashboardService.getTaskGraph(
      req.user.sub,
      query,
    );

    return sendResponse({
      success: true,
      message: 'Fetched task graph successfully',
      data: result,
    });
  }


  @Get('graph/submission-status')
  @ApiOperation({ summary: 'Get submission status distribution' })
  async getSubmissionStatus(@Req() req: AuthRequest) {
    const result = await this.dashboardService.getSubmissionStatus(
      req.user.sub,
    );

    return sendResponse({
      success: true,
      message: 'Fetched submission status successfully',
      data: result,
    });
  }


  @Get('graph/categories')
  @ApiOperation({ summary: 'Get category analytics (tasks)' })
  async getCategories(@Req() req: AuthRequest) {
    const result = await this.dashboardService.getCategoryStats(
      req.user.sub,
    );

    return sendResponse({
      success: true,
      message: 'Fetched category stats successfully',
      data: result,
    });
  }


  @Get('graph/finance')
  @ApiOperation({ summary: 'Get earnings vs spending overview' })
  async getFinance(@Req() req: AuthRequest, @Query() query: DashboardQueryDto) {
    const result = await this.dashboardService.getFinanceOverview(
      req.user.sub,
      query,
    );

    return sendResponse({
      success: true,
      message: 'Fetched finance overview successfully',
      data: result,
    });
  }
}
