import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { BaseQueryDto } from '../common/dto';
import { CreateNewTaskDto, CreateTaskResponseDto } from './dto';
import { Reflector } from '@nestjs/core';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockUserId = 'user-id-123';
  const mockAuthRequest = { user: { sub: mockUserId } } as any;

  const mockTask: CreateTaskResponseDto = {
    _id: 'task-id-1' as any,
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

  const mockMeta = { page: 1, limit: 10, total: 1, totalPage: 1 };

  const sendResponse = (res: any) => res; // mock utility if imported

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            createNewTask: jest.fn().mockResolvedValue(mockTask),
            deleteTask: jest.fn().mockResolvedValue(undefined),
            getAllTasks: jest.fn().mockResolvedValue({
              data: [mockTask],
              meta: mockMeta,
            }),
            getTaskById: jest.fn().mockResolvedValue(mockTask),
          },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNewTask', () => {
    it('should call service.createNewTask and return response', async () => {
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

      const result = await controller.createNewTask(dto, mockAuthRequest);
      expect(service.createNewTask).toHaveBeenCalledWith(dto, mockUserId);
      expect(result.data).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should call service.deleteTask and return response', async () => {
      const deleteDto = { id: 'task-id-1' };
      const result = await controller.deleteTask(deleteDto, mockAuthRequest);
      expect(service.deleteTask).toHaveBeenCalledWith('task-id-1', mockUserId);
      expect(result.data).toBeNull();
    });
  });

  describe('getAllTasks', () => {
    it('should call service.getAllTasks and return data with meta', async () => {
      const query: BaseQueryDto = { searchTerm: 'Task 1', page: 1, limit: 10 };
      const result = await controller.getAllTasks(mockAuthRequest, query);
      expect(service.getAllTasks).toHaveBeenCalledWith(mockUserId, query);
      expect(result.data).toEqual([mockTask]);
      expect(result.meta).toEqual(mockMeta);
    });
  });

  describe('getSingleTask', () => {
    it('should call service.getTaskById and return single task', async () => {
      const result = await controller.getSingleTask('task-id-1');
      expect(service.getTaskById).toHaveBeenCalledWith('task-id-1');
      expect(result.data).toEqual(mockTask);
    });
  });
});
