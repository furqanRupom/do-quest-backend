import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { CreateNewTaskDto, CreateTaskResponseDto } from './dto';
import { BaseQueryDto} from '../common/dto';

describe('TasksService', () => {
  let service: TasksService;
  let repository: TasksRepository;

  const mockUserId = 'user-id-123';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: {
            createTask: jest.fn().mockResolvedValue(mockTask),
            deleteTask: jest.fn().mockResolvedValue(undefined),
            getAllTasks: jest.fn().mockResolvedValue({
              data: [mockTask],
              meta: mockMeta,
            }),
            getTaskById: jest.fn().mockResolvedValue(mockTask),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<TasksRepository>(TasksRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewTask', () => {
    it('should call repository.createTask and return task', async () => {
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

      const result = await service.createNewTask(dto, mockUserId);
      expect(repository.createTask).toHaveBeenCalledWith(dto, mockUserId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should call repository.deleteTask', async () => {
      await service.deleteTask('task-id-1', mockUserId);
      expect(repository.deleteTask).toHaveBeenCalledWith('task-id-1', mockUserId);
    });
  });

  describe('getAllTasks', () => {
    it('should call repository.getAllTasks and return data with meta', async () => {
      const query: BaseQueryDto = { searchTerm: 'Task 1', page: 1, limit: 10 };
      const result = await service.getAllTasks(mockUserId, query);
      expect(repository.getAllTasks).toHaveBeenCalledWith(mockUserId, query);
      expect(result.data).toEqual([mockTask]);
      expect(result.meta).toEqual(mockMeta);
    });
  });

  describe('getTaskById', () => {
    it('should call repository.getTaskById and return task', async () => {
      const result = await service.getTaskById('task-id-1');
      expect(repository.getTaskById).toHaveBeenCalledWith('task-id-1');
      expect(result).toEqual(mockTask);
    });
  });
});
