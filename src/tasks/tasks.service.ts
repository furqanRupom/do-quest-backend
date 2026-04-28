import { Injectable } from '@nestjs/common';
import { CreateNewTaskDto, CreateTaskResponseDto, UpdateTaskDto } from './dto';
import { TasksRepository } from './tasks.repository';
import { BaseQueryDto, MetaResponseDto } from '../common/dto';
import { StripeService } from '../stripe/stripe.service';
import { PaymentFlowStatus } from './enums/tasks.enum';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly stripeService: StripeService,
  ) {}
  async createNewTask(
    taskData: CreateNewTaskDto,
    userId: string,
  ): Promise<CreateTaskResponseDto> {
    const task = await this.tasksRepository.createTask(taskData, userId);
    const intent = await this.stripeService.createPaymentIntent({
      amount: taskData.budget,
      currency: 'usd',
      metadata: {
        taskId: task._id.toString(),
        userId: userId,
      },
    });
    await this.tasksRepository.updateTask(task._id.toString(), {
      status: task.status,
      paymentFlowStatus: PaymentFlowStatus.pending,
      paymentIntentId: intent.id,
    });
    return {
      ...task,
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
    };
  }
  async deleteTask(taskId: string, userId: string): Promise<void> {
    return await this.tasksRepository.deleteTask(taskId, userId);
  }
  async getAllTasks(
    userId: string,
    query: BaseQueryDto,
  ): Promise<MetaResponseDto<Partial<CreateTaskResponseDto>>> {
    return await this.tasksRepository.getAllTasks(userId, query);
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
}
