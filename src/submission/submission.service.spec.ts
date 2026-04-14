import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionService } from './submission.service';
import { SubmissionRepository } from './submission.repository';
import { StripeService } from '../stripe/stripe.service';
import { TasksRepository } from '../tasks/tasks.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PaymentFlowStatus, TaskStatus } from '../tasks/enums/tasks.enum';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

describe('SubmissionService', () => {
  let service: SubmissionService;
  let submissionRepo: any;
  let stripeService: any;
  let tasksRepo: any;

  const mockSubmissionRepo = {
    createSubmission: jest.fn(),
    findById: jest.fn(),
    approveSubmission: jest.fn(),
    rejectSubmission: jest.fn(),
    rejectAllExcept: jest.fn(),
    findByTaskId: jest.fn(),
  };

  const mockStripeService = {
    retrievePaymentIntent: jest.fn(),
    capturePaymentIntent: jest.fn(),
  };

  const mockTasksRepo = {
    getTaskById: jest.fn(),
    findTaskById: jest.fn(),
    updateTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        { provide: SubmissionRepository, useValue: mockSubmissionRepo },
        { provide: StripeService, useValue: mockStripeService },
        { provide: TasksRepository, useValue: mockTasksRepo },
      ],
    }).compile();

    service = module.get<SubmissionService>(SubmissionService);
    submissionRepo = module.get(SubmissionRepository);
    stripeService = module.get(StripeService);
    tasksRepo = module.get(TasksRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('createSubmission', () => {
    it('should create submission if task is active', async () => {
      const task = { id: 'task1', status: TaskStatus.active };
      const submission = { id: 'sub1' };

      tasksRepo.getTaskById.mockResolvedValue(task);
      submissionRepo.createSubmission.mockResolvedValue(submission);

      const result = await service.createSubmission(
        { content: 'work' } as any,
        'task1',
        'user1',
      );

      expect(tasksRepo.getTaskById).toHaveBeenCalledWith('task1');
      expect(submissionRepo.createSubmission).toHaveBeenCalledWith(
        { content: 'work' },
        'task1',
        'user1',
      );
      expect(result).toBe(submission);
    });

    it('should throw if task not found', async () => {
      tasksRepo.getTaskById.mockResolvedValue(null);

      await expect(
        service.createSubmission({} as any, 'task1', 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if task is not active', async () => {
      tasksRepo.getTaskById.mockResolvedValue({ status: TaskStatus.completed });

      await expect(
        service.createSubmission({} as any, 'task1', 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });


  describe('approveSubmission', () => {
    const baseTask = {
      _id: 'task1',
      user: 'owner1',
      paymentIntentId: 'pi_123',
      paymentFlowStatus: PaymentFlowStatus.authorized,
      status: TaskStatus.active,
    };

    const baseSubmission = {
      _id: 'sub1',
      task: 'task1',
    };

    it('should approve submission and capture payment', async () => {
      tasksRepo.findTaskById.mockResolvedValue(baseTask);
      submissionRepo.findById.mockResolvedValue(baseSubmission);
      stripeService.retrievePaymentIntent.mockResolvedValue({
        status: 'requires_capture',
        amount: 5000,
      });
      stripeService.capturePaymentIntent.mockResolvedValue({});
      submissionRepo.approveSubmission.mockResolvedValue({});
      submissionRepo.rejectAllExcept.mockResolvedValue({});
      tasksRepo.updateTask.mockResolvedValue({});

      const result = await service.approveSubmission({
        taskId: 'task1',
        submissionId: 'sub1',
        approverId: 'owner1',
      });

      expect(stripeService.retrievePaymentIntent).toHaveBeenCalledWith('pi_123');
      expect(stripeService.capturePaymentIntent).toHaveBeenCalledWith('pi_123');
      expect(submissionRepo.approveSubmission).toHaveBeenCalledWith('sub1');
      expect(submissionRepo.rejectAllExcept).toHaveBeenCalledWith('task1', 'sub1');
      expect(tasksRepo.updateTask).toHaveBeenCalledWith('task1', {
        status: TaskStatus.completed,
        paymentFlowStatus: PaymentFlowStatus.captured,
      });

      expect(result).toEqual({
        capturedAmount: 50,
        winnerSubmissionId: 'sub1',
      });
    });

    it('should throw if approver is not task owner', async () => {
      tasksRepo.findTaskById.mockResolvedValue({ ...baseTask, user: 'otherUser' });

      await expect(
        service.approveSubmission({
          taskId: 'task1',
          submissionId: 'sub1',
          approverId: 'owner1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw if no payment intent', async () => {
      tasksRepo.findTaskById.mockResolvedValue({
        ...baseTask,
        paymentIntentId: null,
      });

      await expect(
        service.approveSubmission({
          taskId: 'task1',
          submissionId: 'sub1',
          approverId: 'owner1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if stripe status is invalid', async () => {
      tasksRepo.findTaskById.mockResolvedValue(baseTask);
      submissionRepo.findById.mockResolvedValue(baseSubmission);
      stripeService.retrievePaymentIntent.mockResolvedValue({
        status: 'succeeded',
        amount: 5000,
      });

      await expect(
        service.approveSubmission({
          taskId: 'task1',
          submissionId: 'sub1',
          approverId: 'owner1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });


  describe('rejectSubmission', () => {
    it('should reject submission', async () => {
      tasksRepo.findTaskById.mockResolvedValue({ _id: 'task1', user: 'owner1' });
      submissionRepo.findById.mockResolvedValue({ _id: 'sub1', task: 'task1' });
      submissionRepo.rejectSubmission.mockResolvedValue({});

      await service.rejectSubmission({
        taskId: 'task1',
        submissionId: 'sub1',
        approverId: 'owner1',
      });

      expect(submissionRepo.rejectSubmission).toHaveBeenCalledWith('sub1');
    });

    it('should throw if not task owner', async () => {
      tasksRepo.findTaskById.mockResolvedValue({ _id: 'task1', user: 'other' });

      await expect(
        service.rejectSubmission({
          taskId: 'task1',
          submissionId: 'sub1',
          approverId: 'owner1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });


  describe('getSubmissionsByTaskId', () => {
    it('should return submissions', async () => {
      const submissions = [{ id: 's1' }, { id: 's2' }];
      submissionRepo.findByTaskId.mockResolvedValue(submissions);

      const result = await service.getSubmissionsByTaskId('task1');

      expect(submissionRepo.findByTaskId).toHaveBeenCalledWith('task1');
      expect(result).toBe(submissions);
    });
  });
});
