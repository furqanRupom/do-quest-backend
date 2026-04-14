import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { StripeService } from '../stripe/stripe.service';
import { CreateNewTaskDto } from './dto';
import { BaseQueryDto } from '../common/dto';
import { PaymentFlowStatus } from './enums/tasks.enum';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('TasksService', () => {
  let service: TasksService;
  let repository: any;
  let stripeService: any;

  const mockUserId = 'user-id-123';

  const mockTask = {
    _id: 'task-id-1',
    title: 'Task 1',
    description: 'Task description',
    successRequirements: ['Requirement 1'],
    attachments: 'attachment1',
    budget: 100,
    deadline: new Date().toISOString(),
    maxSubmissions: 5,
    categories: ['Category 1'],
    tags: ['tag1'],
    status: 'active',
  };

  const mockPaymentIntent = {
    id: 'pi_123',
    client_secret: 'secret_123',
  };

  const mockMeta = { page: 1, limit: 10, total: 1, totalPage: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: {
            createTask: jest.fn(),
            updateTask: jest.fn(),
            deleteTask: jest.fn(),
            getAllTasks: jest.fn(),
            getTaskById: jest.fn(),
          },
        },
        {
          provide: StripeService,
          useValue: {
            createPaymentIntent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(TasksRepository);
    stripeService = module.get(StripeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('createNewTask', () => {
    it('should create task, create payment intent, update task, and return enriched response', async () => {
      const dto: CreateNewTaskDto = {
        title: 'Task 1',
        description: 'Task description',
        successRequirements: ['Requirement 1'],
        attachments: 'attachment1',
        budget: 100,
        deadline: new Date().toISOString(),
        maxSubmissions: 5,
        categories: ['Category 1'],
        tags: ['tag1'],
      };

      repository.createTask.mockResolvedValue(mockTask);
      stripeService.createPaymentIntent.mockResolvedValue(mockPaymentIntent);
      repository.updateTask.mockResolvedValue({});

      const result = await service.createNewTask(dto, mockUserId);

      expect(repository.createTask).toHaveBeenCalledWith(dto, mockUserId);
      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith({
        amount: 100,
        currency: 'usd',
        metadata: {
          taskId: 'task-id-1',
          userId: mockUserId,
        },
      });
      expect(repository.updateTask).toHaveBeenCalledWith('task-id-1', {
        status: mockTask.status,
        paymentFlowStatus: PaymentFlowStatus.pending,
        paymentIntentId: 'pi_123',
      });

      expect(result).toEqual({
        ...mockTask,
        paymentIntentId: 'pi_123',
        clientSecret: 'secret_123',
      });
    });
  });


  describe('deleteTask', () => {
    it('should call repository.deleteTask', async () => {
      repository.deleteTask.mockResolvedValue(undefined);

      await service.deleteTask('task-id-1', mockUserId);

      expect(repository.deleteTask).toHaveBeenCalledWith('task-id-1', mockUserId);
    });
  });


  describe('getAllTasks', () => {
    it('should return paginated tasks', async () => {
      const query: BaseQueryDto = { searchTerm: 'Task 1', page: 1, limit: 10 };

      repository.getAllTasks.mockResolvedValue({
        data: [mockTask],
        meta: mockMeta,
      });

      const result = await service.getAllTasks(mockUserId, query);

      expect(repository.getAllTasks).toHaveBeenCalledWith(mockUserId, query);
      expect(result.data).toEqual([mockTask]);
      expect(result.meta).toEqual(mockMeta);
    });
  });


  describe('getTaskById', () => {
    it('should return task by id', async () => {
      repository.getTaskById.mockResolvedValue(mockTask);

      const result = await service.getTaskById('task-id-1');

      expect(repository.getTaskById).toHaveBeenCalledWith('task-id-1');
      expect(result).toEqual(mockTask);
    });
  });
});
