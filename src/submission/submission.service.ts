import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubmissionRepository } from './submission.repository';
import { StripeService } from '../stripe/stripe.service';
import { ApproveOrRejectDto, CreateSubmissionDto } from './dto';
import { PaymentFlowStatus, TaskStatus } from '../tasks/enums/tasks.enum';
import { Submission } from './schemas/submission.schema';
import { BaseQueryDto } from '../common/dto';
import { TasksService } from '../tasks/tasks.service';
import { SubmissionStatus } from './enums/submission.enum';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly stripeService: StripeService,
    private readonly tasksService:TasksService,
  ) {}

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto,
    taskId: string,
    userId: string,
  ): Promise<Submission> {
    const task = await this.tasksService.findTaskById(taskId);
    if (!task) {
      throw new BadRequestException('Task not found');
    }
    if (task.status !== TaskStatus.active) {
      throw new BadRequestException(
        'Cannot submit to a task that is not active',
      );
    }
    if (task.user.equals(userId)) {
      throw new BadRequestException('You cannot submit your own tasks!');
    }
    const isSubmissionExit = await this.submissionRepository.existingSubmission(taskId,userId)
    if(isSubmissionExit) {
      throw new HttpException("You already have an active submission for this task",HttpStatus.CONFLICT)
    }
    const submission = await this.submissionRepository.createSubmission(
      createSubmissionDto,
      taskId,
      userId,
    );
    return submission;
  }

  async approveSubmission(
    approveSubmissionDto: ApproveOrRejectDto,
  ): Promise<{ capturedAmount: number; winnerSubmissionId: string }> {

    const { taskId, submissionId, approverId } = approveSubmissionDto;

    const task = await this.tasksService.findTaskById(taskId);

    if (!task || task.user.toString() !== approverId) {
      throw new ForbiddenException(
        'Not authorized to approve submissions for this task',
      );
    }

    if (task.paymentIntentId == null) {
      throw new BadRequestException(
        'No payment intent associated with this task',
      );
    }

    if (task.paymentFlowStatus !== PaymentFlowStatus.authorized) {
      throw new BadRequestException('Funds not authorized');
    }

    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission || submission.task.toString() !== taskId) {
      throw new BadRequestException('Submission not found for this task');
    }

    if(submission.status !== SubmissionStatus.pending){
      throw new HttpException(
        `Submission is already ${submission.status.toLowerCase()}`,
        HttpStatus.BAD_REQUEST
      )
    }

    const worker = submission.user as any
    if(!worker.userStripeId || !worker.payoutsEnabled){
      throw new HttpException(
        "Worker has not completed Stripe onboarding. Cannot pay out.",
        HttpStatus.BAD_REQUEST
      )
    }

    await this.stripeService.capturePaymentIntent(task.paymentIntentId);
    await this.submissionRepository.approveSubmission(submissionId);
    await this.submissionRepository.rejectAllExcept(taskId, submissionId);

    await this.tasksService.updateTask(taskId, {
      status: TaskStatus.completed,
      paymentFlowStatus: PaymentFlowStatus.captured,
    });

    return {
      capturedAmount: 100,
      winnerSubmissionId: submissionId,
    };
  }

  async rejectSubmission(
    approveSubmissionDto: ApproveOrRejectDto,
  ): Promise<void> {
    const { taskId, submissionId, approverId } = approveSubmissionDto;
    const task = await this.tasksService.findTaskById(taskId);
    if (!task || task.user.toString() !== approverId) {
      throw new ForbiddenException(
        'Not authorized to reject submissions for this task',
      );
    }

    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission || submission.task.toString() !== taskId) {
      throw new BadRequestException('Submission not found for this task');
    }

    await this.submissionRepository.rejectSubmission(submissionId);
  }

  async getSubmissionsByTaskId(taskId: string,userId:string): Promise<Submission[]> {
    const task = await this.tasksService.findTaskById(taskId)
    if(!task){
      throw new NotFoundException("Task not found")
    }
    if(task.user.toString() !== userId){
      throw new ForbiddenException("You do not own this task")
    }
    return await this.submissionRepository.getSubmissionsByTaskId(taskId);
  }
  async countAllSubmissions(){
    return this.submissionRepository.countTotalSubmissions()
  }
  async getAllSubmissions(query:BaseQueryDto){
    return this.submissionRepository.getAllSubmissions(query)
  }
  async getMySubmissions(userId:string,query:BaseQueryDto){
    return await this.submissionRepository.getMySubmissions(userId,query)
  }

  

}
