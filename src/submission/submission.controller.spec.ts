import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
describe('SubmissionController', () => {
  let controller: SubmissionController;
  let service: any;

  const mockSubmissionService = {
    createSubmission: jest.fn(),
    getSubmissionsByTaskId: jest.fn(),
    approveSubmission: jest.fn(),
    rejectSubmission: jest.fn(),
  };

  const mockReq = {
    user: {
      sub: 'user1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        {
          provide: SubmissionService,
          useValue: mockSubmissionService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
    service = module.get(SubmissionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('createSubmission', () => {
    it('should create submission and return wrapped response', async () => {
      const submission = { id: 'sub1' };
      service.createSubmission.mockResolvedValue(submission);

      const result = await controller.createSubmission(
        'task1',
        { content: 'work' } as any,
        mockReq as any,
      );

      expect(service.createSubmission).toHaveBeenCalledWith(
        { content: 'work' },
        'task1',
        'user1',
      );

      expect(result).toEqual({
        success: true,
        message: 'Submission created successfully',
        data: submission,
      });
    });
  });


  describe('list', () => {
    it('should return submissions list', async () => {
      const submissions = [{ id: 's1' }, { id: 's2' }];
      service.getSubmissionsByTaskId.mockResolvedValue(submissions);

      const result = await controller.list('task1');

      expect(service.getSubmissionsByTaskId).toHaveBeenCalledWith('task1');
      expect(result).toEqual({
        success: true,
        message: 'Submissions retrieved successfully',
        data: submissions,
      });
    });
  });


  describe('approveSubmission', () => {
    it('should approve submission and return wrapped response', async () => {
      const approvalResult = {
        capturedAmount: 50,
        winnerSubmissionId: 'sub1',
      };

      service.approveSubmission.mockResolvedValue(approvalResult);

      const result = await controller.approveSubmission(
        'task1',
        'sub1',
        mockReq as any,
      );

      expect(service.approveSubmission).toHaveBeenCalledWith({
        taskId: 'task1',
        submissionId: 'sub1',
        approverId: 'user1',
      });

      expect(result).toEqual({
        success: true,
        message: 'Submission approved successfully',
        data: approvalResult,
      });
    });
  });


  describe('rejectSubmission', () => {
    it('should reject submission and return wrapped response', async () => {
      service.rejectSubmission.mockResolvedValue(undefined);

      const result = await controller.rejectSubmission(
        'task1',
        'sub1',
        mockReq as any,
      );

      expect(service.rejectSubmission).toHaveBeenCalledWith({
        taskId: 'task1',
        submissionId: 'sub1',
        approverId: 'user1',
      });

      expect(result).toEqual({
        success: true,
        message: 'Submission rejected successfully',
        data: null,
      });
    });
  });
});
