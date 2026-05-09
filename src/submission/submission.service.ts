import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SubmissionRepository } from './submission.repository';
import { StripeService } from '../stripe/stripe.service';
import { TasksRepository } from '../tasks/tasks.repository';
import { ApproveOrRejectDto, CreateSubmissionDto } from './dto';
import { PaymentFlowStatus, TaskStatus } from '../tasks/enums/tasks.enum';
import { Submission } from './schemas/submission.schema';
import { BaseQueryDto } from '../common/dto';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly stripeService: StripeService,
    private readonly tasksRepository: TasksRepository,
  ) {}

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto,
    taskId: string,
    userId: string,
  ): Promise<Submission> {
    const task = await this.tasksRepository.findTaskById(taskId);
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
    const task = await this.tasksRepository.findTaskById(taskId);
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

    const intent = await this.stripeService.retrievePaymentIntent(
      task.paymentIntentId,
    );
    if (intent.status !== 'requires_capture') {
      throw new BadRequestException(`Stripe status invalid: ${intent.status}`);
    }

    await this.stripeService.capturePaymentIntent(task.paymentIntentId);

    await this.submissionRepository.approveSubmission(submissionId);
    await this.submissionRepository.rejectAllExcept(taskId, submissionId);

    await this.tasksRepository.updateTask(taskId, {
      status: TaskStatus.completed,
      paymentFlowStatus: PaymentFlowStatus.captured,
    });

    return {
      capturedAmount: intent.amount / 100,
      winnerSubmissionId: submissionId,
    };
  }

  async rejectSubmission(
    approveSubmissionDto: ApproveOrRejectDto,
  ): Promise<void> {
    const { taskId, submissionId, approverId } = approveSubmissionDto;
    const task = await this.tasksRepository.findTaskById(taskId);
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

  async getSubmissionsByTaskId(taskId: string): Promise<Submission[]> {
    return this.submissionRepository.findByTaskId(taskId);
  }
  async countAllSubmissions(){
    return this.submissionRepository.countTotalSubmissions()
  }
  async getAllSubmissions(query:BaseQueryDto){
    return this.submissionRepository.getAllSubmissions(query)
  }
}
