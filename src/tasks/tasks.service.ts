import { Injectable } from '@nestjs/common';
import { CreateNewTaskDto, CreateTaskResponseDto } from './dto';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository
  ) { }
  async createNewTask(taskData: CreateNewTaskDto,userId:string): Promise<CreateTaskResponseDto> {
    return await this.tasksRepository.createTask(taskData,userId)
  }

}
