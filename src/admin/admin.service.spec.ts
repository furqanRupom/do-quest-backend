import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { BaseQueryDto } from '../common/dto';
import { describe, it, expect, beforeEach, jest,afterEach } from '@jest/globals';

describe('AdminService', () => {
  let service: AdminService;
  let repository: jest.Mocked<AdminRepository>;

  const mockAdminRepository = {
    countTotalUsers: jest.fn(),
    countTotalSubmissions: jest.fn(),
    countTotalTasks: jest.fn(),
    getAllUsers: jest.fn(),
    getAllSubmissions: jest.fn(),
    getAllTasks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: mockAdminRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    repository = module.get(AdminRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('countTotals', () => {
    it('should return total users, submissions, and tasks', async () => {
      repository.countTotalUsers.mockResolvedValue(10);
      repository.countTotalSubmissions.mockResolvedValue(25);
      repository.countTotalTasks.mockResolvedValue(5);

      const result = await service.countTotals();

      expect(result).toEqual({
        users: 10,
        submissions: 25,
        tasks: 5,
      });

      expect(repository.countTotalUsers).toHaveBeenCalled();
      expect(repository.countTotalSubmissions).toHaveBeenCalled();
      expect(repository.countTotalTasks).toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('should return users from repository', async () => {
      const query: BaseQueryDto = { page: 1, limit: 10 } as any;
      const users = [{ id: 1 }, { id: 2 }];

      repository.getAllUsers.mockResolvedValue(users as any);

      const result = await service.getAllUsers(query);

      expect(result).toBe(users);
      expect(repository.getAllUsers).toHaveBeenCalledWith(query);
    });
  });

  // ---------------- getAllSubmissions ----------------
  describe('getAllSubmissions', () => {
    it('should return submissions from repository', async () => {
      const query: BaseQueryDto = { page: 1, limit: 10 } as any;
      const submissions = [{ id: 101 }, { id: 102 }];

      repository.getAllSubmissions.mockResolvedValue(submissions as any);

      const result = await service.getAllSubmissions(query);

      expect(result).toBe(submissions);
      expect(repository.getAllSubmissions).toHaveBeenCalledWith(query);
    });
  });

  describe('getAllTasks', () => {
    it('should return tasks from repository', async () => {
      const query: BaseQueryDto = { page: 1, limit: 10 } as any;
      const tasks = [{ id: 201 }, { id: 202 }];

      repository.getAllTasks.mockResolvedValue(tasks as any);

      const result = await service.getAllTasks(query);

      expect(result).toBe(tasks);
      expect(repository.getAllTasks).toHaveBeenCalledWith(query);
    });
  });
});
