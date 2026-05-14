import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Roles } from '../common/decorators';
import { UserRole } from '../auth/enums/role.enum';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateNewTaskDto, CreateNewTaskResponseDto } from '../tasks/dto';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { sendResponse } from '../common/utils';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('payment')
export class PaymentController {
constructor(private readonly paymentService:PaymentService){}

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.User)
    @Post("tasks")
    @ApiOkResponse({ type: CreateNewTaskResponseDto })
    async createNewTask(@Body() createTaskDto: CreateNewTaskDto, @Req() req: AuthRequest): Promise<CreateNewTaskResponseDto> {
        console.log(req.user.sub)
        const result = await this.paymentService.createTaskWithPayment(createTaskDto, req.user.sub)
        return sendResponse({
            success: true,
            message: "New Task Created successfully",
            data: result
        })
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.User)
    @Post("tasks/:id/cancel")
    async cancelTask(@Param('id')id:string, @Req() req: AuthRequest) {
        const result = await this.paymentService.cancelTask(id, req.user.sub)
        return sendResponse({
            success: true,
            message: "New Task Created successfully",
            data: result
        })
    }

}
