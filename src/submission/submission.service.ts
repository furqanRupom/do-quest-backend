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
import { TasksService } from '../tasks/tasks.service';
import { SubmissionStatus } from './enums/submission.enum';
import { WalletService } from '../wallet/wallet.service';
import { RejectSubmissionDto } from './dto/reject-submission.dto';
import { RequestRevisionDto } from './dto/request-revision.dto';
import { SubmissionQueryDto } from './dto/submission.list.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly stripeService: StripeService,
    private readonly tasksService: TasksService,
    private readonly walletService: WalletService,
    private readonly usersService: UsersService
  ) { }

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto,
    taskId: string,
    userId: string,
  ): Promise<Submission> {
    const task = await this.tasksService.findTaskById(taskId);
    const user = await this.usersService.getUserProfile(userId)


    if (!user.payoutsEnabled) {
      throw new ForbiddenException("You must enable payouts before submitting a bounty.")
    }

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

    const isSubmissionExit = await this.submissionRepository.existingSubmission(taskId, userId)
    if (isSubmissionExit) {
      throw new HttpException("You already have an active submission for this task", HttpStatus.CONFLICT)
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
  ): Promise<any> {

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

    const worker = await this.usersService.getUserProfile(submission.user.toString())
    if (submission.status !== SubmissionStatus.pending) {
      throw new HttpException(
        `Submission is already ${submission.status.toLowerCase()}`,
        HttpStatus.BAD_REQUEST
      )
    }

    if (!worker.userStripeId || !worker.payoutsEnabled) {
      throw new HttpException(
        "Worker has not completed Stripe onboarding. Cannot pay out.",
        HttpStatus.BAD_REQUEST
      )
    }

    await this.stripeService.capturePaymentIntent(task.paymentIntentId);

    const platformFreePercent = 0.10
    const totalAmount = task.budget
    const platformFee = Math.floor(totalAmount * platformFreePercent)
    const workerAmount = totalAmount - platformFee

    const transfer = await this.stripeService.createTransfer({
      amount: workerAmount,
      destination: worker.userStripeId,
      metadata: {
        taskId: taskId,
        submissionId,
        workerId: worker._id.toString()
      }
    })


    await this.submissionRepository.approveSubmission(submissionId, transfer.id);

    await this.walletService.releaseEscrowToWorker({
      creatorId: approverId,
      workerId: worker._id.toString(),
      taskId: taskId,
      submissionId,
      amount: workerAmount,
      stripeTransferId: transfer.id
    })

    await this.tasksService.incrementApprovedSubmissions(taskId)


    return {
      submission: submission,
      transfer: { id: transfer.id, amount: workerAmount },
    };
  }

  async rejectSubmission(
    submissionId: string,
    approverId: string,
    dto: RejectSubmissionDto
  ): Promise<void> {

    const submission = await this.submissionRepository.findSubmissionById(submissionId);

    if (!submission) {
      throw new NotFoundException("Submission not found")
    }
    const task = await this.tasksService.findTaskById(submission.task.toString());


    if (!task || task.user.toString() !== approverId) {
      throw new ForbiddenException(
        'You do not own this task',
      );
    }


    if (submission.status !== SubmissionStatus.pending) {
      throw new HttpException(
        `Submission is already ${submission.status.toLowerCase()}`,
        HttpStatus.BAD_REQUEST,
      );
    }


    await this.submissionRepository.rejectSubmission(submissionId, dto)

  }
  async revisionSubmission(submissionId: string, ownerId: string, dto: RequestRevisionDto) {

    const submission = await this.submissionRepository.findSubmissionById(submissionId);
    if (!submission) throw new NotFoundException('Submission not found');

    if (submission.status !== SubmissionStatus.pending) {
      throw new HttpException(
        `Submission is already ${submission.status.toLowerCase()}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const task = await this.tasksService.findTaskById(
      submission.task.toString(),
    );
    if (!task || task.user.toString() !== ownerId) {
      throw new ForbiddenException('You do not own this task');
    }

    return await this.submissionRepository.revisionSubmission(submissionId, dto.revisionNote)


  }


  async reSubmit(
    submissionId: string,
    workerId: string,
    dto: CreateSubmissionDto
  ) {
    const submission = await this.submissionRepository.findSubmissionById(submissionId)
    if (!submission) {
      throw new NotFoundException("Submission not found")
    }
    if (submission.user.toString() !== workerId) {
      throw new ForbiddenException("This is not your submission")
    }

    if (submission.status !== SubmissionStatus.revision_requested) {
      throw new HttpException(
        "Only submissions with revision requested can be resubmitted.",
        HttpStatus.BAD_REQUEST
      )
    }

    await this.submissionRepository.resubmitSubmission(submissionId, dto)
  }

  
  async getSubmissionsByTaskId(taskId: string,submissioinQueryDto:SubmissionQueryDto){
    const task = await this.tasksService.findTaskById(taskId)
    if (!task) {
      throw new NotFoundException("Task not found")
    }
    return await this.submissionRepository.getSubmissionsByTasksId(taskId, submissioinQueryDto)
  }

  
  async countAllSubmissions() {
    return this.submissionRepository.countTotalSubmissions()
  }
  async getAllSubmissions(query: SubmissionQueryDto) {
    return this.submissionRepository.getAllSubmissions(query)
  }
  async getMySubmissions(userId: string, query: SubmissionQueryDto) {
    return await this.submissionRepository.getMySubmissions(userId, query)
  }
  async getSubmission(submissionId: string) {
    const submission = await this.submissionRepository.findById(submissionId)
    if (!submission) {
      throw new NotFoundException("Submission not found")
    }
    return submission
  }
}
