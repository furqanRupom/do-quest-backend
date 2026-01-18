import { Injectable } from '@nestjs/common';
import { CreateNewTaskDto, CreateTaskResponseDto } from './dto';
import { TasksRepository } from './tasks.repository';
import { MetaResponseDto } from '../common/dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository
  ) { }
  async createNewTask(taskData: CreateNewTaskDto,userId:string): Promise<CreateTaskResponseDto> {
    return await this.tasksRepository.createTask(taskData,userId)
  }
  async deleteTask(taskId:string,userId:string): Promise<void> {
    return await this.tasksRepository.deleteTask(taskId,userId)
  }
  async getAllTasks(userId:string,query:Record<string,unknown>): Promise<MetaResponseDto<Partial<CreateTaskResponseDto>>> {
    return await this.tasksRepository.getAllTasks(userId, query)
  }
  // TODO: fixed any type issue
  async getTaskById(taskId:string): Promise<any> {
    return await this.tasksRepository.getTaskById(taskId)
  }

}
