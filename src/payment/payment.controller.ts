import { Body, Controller, Post, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Roles } from '../common/decorators';
import { UserRole } from '../auth/enums/role.enum';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateNewTaskDto, CreateNewTaskResponseDto } from '../tasks/dto';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { sendResponse } from '../common/utils';

@Controller('payment')
export class PaymentController {
constructor(private readonly paymentService:PaymentService){}  
    @Roles(UserRole.User)
    @Post("tasks")
    @ApiOkResponse({ type: CreateNewTaskResponseDto })
    async createNewTask(@Body() createTaskDto: CreateNewTaskDto, @Req() req: AuthRequest): Promise<CreateNewTaskResponseDto> {
        const result = await this.paymentService.createTaskWithPayment(createTaskDto, req.user.sub)
        return sendResponse({
            success: true,
            message: "New Task Created successfully",
            data: result
        })
    }
}
