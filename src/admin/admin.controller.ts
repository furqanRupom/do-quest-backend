import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { sendResponse } from '../common/utils';
import { BaseQueryDto } from '../common/dto';
import { UserRole } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { ApiCookieAuth, ApiOkResponse } from '@nestjs/swagger';
import { CountTotalsResponseDto } from './dto';
import { TaskStatus } from '../tasks/enums/tasks.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.Admin)
@ApiCookieAuth('accessToken')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @HttpCode(HttpStatus.OK)
  @Get('count/totals')
  @ApiOkResponse({ type: CountTotalsResponseDto })
  async countTotals(): Promise<CountTotalsResponseDto> {
    const result = await this.adminService.countTotals();
    return sendResponse({
      success: true,
      message: 'Totals counted successfully',
      data: result,
    });
  }
  @HttpCode(HttpStatus.OK)
  @Get('users')
  async getAllUsers(@Query() query: BaseQueryDto) {
    const result = await this.adminService.getAllUsers(query);
    return sendResponse({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('submissions')
  async getAllSubmissions(@Query() query: BaseQueryDto) {
    const result = await this.adminService.getAllSubmissions(query);
    return sendResponse({
      success: true,
      message: 'Submissions retrieved successfully',
      data: result,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('tasks')
  async getAllTasks(@Query() query: BaseQueryDto) {
    const result = await this.adminService.getAllTasks(query);
    return sendResponse({
      success: true,
      message: 'Tasks retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('tasks/bar-chart')
  async getTasksBountiesBarData() {
    const result = await this.adminService.getTasksBountiesBarData();
    return sendResponse({
      success: true,
      message: 'Tasks and bounties bar chart data retrieved successfully',
      data: result,
    });
  }
  @HttpCode(HttpStatus.OK)
  @Put('tasks/:id')
  async updateTaskStatus(
    @Param('id') taskId: string,
    @Body() updateTaskDto: { taskStatus: TaskStatus },
  ) {
    const result = await this.adminService.updateTasksStatus(
      taskId,
      updateTaskDto,
    );
    return sendResponse({
      success: true,
      message: 'Tasks status updated successfully',
      data: result,
    });
  }

  // TODO : we have to add DTO later
  @HttpCode(HttpStatus.OK)
  @Put('users/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: any,
  ) {
    const result = await this.adminService.updateUser(
      userId,
      updateUserDto);
    return sendResponse({
      success: true,
      message: 'User updated successfully',
      data: result,
    });
  }
}
