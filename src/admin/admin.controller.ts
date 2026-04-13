import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { sendResponse } from '../common/utils';
import { BaseQueryDto } from '../common/dto';
import { UserRole } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { ApiCookieAuth, ApiOkResponse } from '@nestjs/swagger';
import { CountTotalsResponseDto } from './dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.Admin)
@ApiCookieAuth('accessToken')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @HttpCode(HttpStatus.OK)
    @Get('count/totals')
    @ApiOkResponse({type: CountTotalsResponseDto})
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
    async getAllUsers(@Query() query:BaseQueryDto) {
        const result = await this.adminService.getAllUsers(query);
        return sendResponse({
            success: true,
            message: 'Users retrieved successfully',
            data: result,
        });
    }

    @HttpCode(HttpStatus.OK)
    @Get('submissions')
    async getAllSubmissions(@Query() query:BaseQueryDto) {
        const result = await this.adminService.getAllSubmissions(query);
        return sendResponse({
            success: true,
            message: 'Submissions retrieved successfully',
            data: result,
        });
    }

    @HttpCode(HttpStatus.OK)
    @Get('tasks')
    async getAllTasks(@Query() query:BaseQueryDto) {
        const result = await this.adminService.getAllTasks(query);
        return sendResponse({
            success: true,
            message: 'Tasks retrieved successfully',
            data: result,
        });
    }
}
