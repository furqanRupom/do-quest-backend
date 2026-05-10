import { Injectable } from '@nestjs/common';
import { CreateNewTaskDto, CreateTaskResponseDto, UpdateTaskDto } from './dto';
import { TasksRepository } from './tasks.repository';
import { BaseQueryDto, MetaResponseDto } from '../common/dto';
import { TaskStatus } from './enums/tasks.enum';
import { Task, TaskDocument } from './schemas/tasks.schema';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
  ) { }
  async createNewTask(
    taskData: CreateNewTaskDto,
    userId: string,
  ): Promise<CreateTaskResponseDto> {
    return await this.tasksRepository.createTask(taskData, userId);
  }
  async updateTask(taskId: string, task: any) {
    await this.tasksRepository.updateTask(taskId.toString(), task);
  }
  async deleteTask(taskId: string, userId: string): Promise<void> {
    return await this.tasksRepository.deleteTask(taskId, userId);
  }
  async getAllMyTasks(
    userId: string,
    query: BaseQueryDto,
  ): Promise<MetaResponseDto<Partial<CreateTaskResponseDto>>> {
    return await this.tasksRepository.getAllTasks(userId, query);
  }

  
  async browseAllTasks(
    query: BaseQueryDto,
  ): Promise<MetaResponseDto<Partial<any>>> {
    return await this.tasksRepository.browseTasks(query)
  }
  async getTaskById(taskId: string): Promise<Partial<CreateTaskResponseDto>> {
    return await this.tasksRepository.getTaskById(taskId);
  }

  async updateWholeTask(
    taskId: string,
    userId: string,
    updateData: Partial<UpdateTaskDto>,
  ): Promise<any> {
    return this.tasksRepository.updateWholeTask(taskId, userId, updateData);
  }

  async countAllTasks() {
    return await this.tasksRepository.countTotalTasks()
  }
  async getAllTasksAdmin(query: BaseQueryDto) {
    return await this.tasksRepository.getAllTasksAdmin(query)
  }
  async updateTasksStatus(
    taskId: string,
    taskStatus: { taskStatus: TaskStatus },
  ) {
    return await this.tasksRepository.updateTaskStatus(taskId, taskStatus);
  }
  async getTasksBountiesBarData(): Promise<any> {
    return this.tasksRepository.getTasksBountiesBarData();
  }
  async incrementApprovedSubmissions(taskId: string) {
    return await this.tasksRepository.incrementApprovedSubmissions(taskId)
  }
  async findTaskById(taskId:string) :Promise<TaskDocument | null >{
    return await this.tasksRepository.findTaskById(taskId)
  }
  async findTaskByPaymentIntentId(paymentIntentId:string){
    return await  this.tasksRepository.findTaskByPaymentIntentId(paymentIntentId)
  }
}
