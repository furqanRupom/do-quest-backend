import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateNewTaskDto, CreateNewTaskResponseDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Roles } from '../common/decorators';
import { UserRole } from '../auth/enums/role.enum';
import { sendResponse } from 'src/common/utils';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/types/auth-request.type';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Roles(UserRole.User)
    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({type:CreateNewTaskResponseDto})
    async createNewTask(@Body() createTaskDto: CreateNewTaskDto, @Req() req:AuthRequest): Promise<CreateNewTaskResponseDto> {
        const result = await this.tasksService.createNewTask(createTaskDto,req.user.sub)
        return sendResponse({
            success: true,
            message: "New Task Created successfully",
            data: result
        })
    }
}
