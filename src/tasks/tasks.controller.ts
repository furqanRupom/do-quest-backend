import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards,Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateNewTaskDto, CreateNewTaskResponseDto, DeleteTaskDto, GetAllTaskDto, SingleTaskDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Roles } from '../common/decorators';
import { UserRole } from '../auth/enums/role.enum';
import { sendResponse} from 'src/common/utils';
import { ApiBearerAuth, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Roles(UserRole.User)
    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: CreateNewTaskResponseDto })
    async createNewTask(@Body() createTaskDto: CreateNewTaskDto, @Req() req: AuthRequest): Promise<CreateNewTaskResponseDto> {
        const result = await this.tasksService.createNewTask(createTaskDto, req.user.sub)
        return sendResponse({
            success: true,
            message: "New Task Created successfully",
            data: result
        })
    }


    @Roles(UserRole.User)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: String })
    @ApiOkResponse({ type: DeleteTaskDto })
    async deleteTask(@Param() deleteTaskDto: { id: string }, @Req() req: AuthRequest): Promise<DeleteTaskDto> {
        await this.tasksService.deleteTask(deleteTaskDto.id, req.user.sub);
        return sendResponse({
            success: true,
            message: "Task deleted successfully",
            data: null
        })
    }

    @Roles(UserRole.User)
    @Get('')
    @ApiBearerAuth()
    @ApiOkResponse({ type: GetAllTaskDto})
    async getAllTasks(@Req() req: AuthRequest, @Query() query: BaseQueryDto):Promise<GetAllTaskDto<CreateNewTaskDto>> {
        const result = await this.tasksService.getAllTasks(req.user.sub,query);
        return sendResponse({
            success: true,
            message: "Tasks fetched successfully",
            meta:result.meta,
            data: result.data
        })
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: CreateNewTaskResponseDto })
    async getSingleTask(@Param('id') taskId: string):Promise<SingleTaskDto>{
        const result = await this.tasksService.getTaskById(taskId);
        return sendResponse({
            success: true,
            message: "Task fetched successfully",
            data: result
        })
    }

}