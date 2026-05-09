import { Injectable } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { CreateNewTaskDto, CreateTaskResponseDto } from '../tasks/dto';
import { TasksService } from '../tasks/tasks.service';
import { PaymentFlowStatus } from '../tasks/enums/tasks.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService:StripeService,
    private readonly tasksService:TasksService
  ){}

  async createTaskWithPayment(payload:CreateNewTaskDto,userId:string):Promise<CreateTaskResponseDto>{
    const task = await this.tasksService.createNewTask(payload,userId)
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
}
