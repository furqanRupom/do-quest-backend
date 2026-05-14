import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { CreateNewTaskDto, CreateTaskResponseDto } from '../tasks/dto';
import { TasksService } from '../tasks/tasks.service';
import { PaymentFlowStatus, TaskStatus } from '../tasks/enums/tasks.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly tasksService: TasksService,
    private readonly usersService:UsersService
  ) { }
  async createTaskWithPayment(payload: CreateNewTaskDto, userId: string): Promise<CreateTaskResponseDto> {
    const user = await this.usersService.getUserProfile(userId)
    if(!user.payoutsEnabled) {
      throw new ForbiddenException("You must enable payouts before creating a new bounty.")
    }
    const task = await this.tasksService.createNewTask(payload, userId)
    const intent = await this.stripeService.createPaymentIntent({
      amount: payload.budget,
      currency: 'usd',
      metadata: {
        taskId: task._id.toString(),
        userId: userId,
      },
    });
    await this.tasksService.updateTask(task._id.toString(), {
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

  async cancelTask(taskId: string, userId: string) {
    const task = await this.tasksService.findTaskById(taskId)
    if (!task) {
      throw new NotFoundException("Task not found")
    }

    if (task.user.toString() !== userId) {
      throw new ForbiddenException("You do not own this task")
    }

    if (
      task.status == TaskStatus.completed ||
      task.status == TaskStatus.cancelled
    ) {
      throw new HttpException(`Task is already ${task.status.toLowerCase()}`, HttpStatus.BAD_REQUEST)
    }

    if (
      task.paymentIntentId
    ) {
      try {
        const intent = await this.stripeService.retrievePaymentIntent(task.paymentIntentId)


        if (
          intent.status !== 'canceled' &&
          intent.status !== 'succeeded'
        ) {
          await this.stripeService.cancelPaymentIntent(task.paymentIntentId)
          return { message: "Task cancelation initiated. Refund will be processed." }
        }
      } catch (error) {

      }
    }

    await this.tasksService.updateTask(taskId, {
      status: TaskStatus.cancelled,
      paymentFlowStatus: PaymentFlowStatus.cancelled
    })
  }
}
