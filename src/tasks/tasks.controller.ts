import { Body, Controller, Delete, Get, Param,  Req, UseGuards, Query, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateNewTaskDto, CreateNewTaskResponseDto, DeleteTaskDto, GetAllTaskDto, GetTasksQueryDto, SingleTaskDto, UpdateTaskDto, UpdateWholeTaskDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { Roles } from '../common/decorators';
import { UserRole } from '../auth/enums/role.enum';
import { sendResponse } from '../common/utils';
import { ApiBearerAuth, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { TaskStatus } from './enums/tasks.enum';


@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Get()
  async browseTasks(@Query() query: GetTasksQueryDto) {
    const result = await this.tasksService.browseAllTasks(query)
    return sendResponse({
      success: true,
      message: "Fetched  all tasks successfully",
      meta:result.meta,
      data: result.data,
    })
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.User)
  @Get('my')
  @ApiBearerAuth()
  @ApiOkResponse({ type: GetAllTaskDto })
  async getAllTasks(@Req() req: AuthRequest, @Query() query: BaseQueryDto): Promise<GetAllTaskDto<CreateNewTaskDto>> {
    const result = await this.tasksService.getAllMyTasks(req.user.sub, query);
    return sendResponse({
      success: true,
      message: "Tasks fetched successfully",
      meta: result.meta,
      data: result.data
    })
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.User, UserRole.Admin)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CreateNewTaskResponseDto })
  async getSingleTask(@Param('id') taskId: string): Promise<SingleTaskDto> {
    const result = await this.tasksService.getTaskById(taskId);
    return sendResponse({
      success: true,
      message: "Task fetched successfully",
      data: result
    })
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.User, UserRole.Admin)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: UpdateWholeTaskDto })
  async updateWholeTask(@Body() UpdateTaskDto: UpdateTaskDto, @Param('id') taskId: string, @Req() req: AuthRequest): Promise<UpdateWholeTaskDto> {
    const result = await this.tasksService.updateWholeTask(taskId, req.user.sub, UpdateTaskDto)
    return sendResponse({
      success: true,
      message: "Task updated successfully",
      data: result
    })
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.User, UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @Put('status/:id')
  async updateTaskStatus(
    @Param('id') taskId: string,
    @Body() updateTaskDto: { taskStatus: TaskStatus },
  ) {
    const result = await this.tasksService.updateTasksStatus(
      taskId,
      updateTaskDto,
    );
    return sendResponse({
      success: true,
      message: 'Tasks status updated successfully',
      data: result,
    });
  }
}
