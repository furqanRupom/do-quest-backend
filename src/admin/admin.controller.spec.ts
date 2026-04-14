import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BaseQueryDto } from '../common/dto';
import { describe, it, expect, beforeEach, jest,afterEach } from '@jest/globals';
describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminService>;

  const mockAdminService = {
    countTotals: jest.fn(),
    getAllUsers: jest.fn(),
    getAllSubmissions: jest.fn(),
    getAllTasks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------- countTotals ----------------
  describe('countTotals', () => {
    it('should return wrapped totals response', async () => {
      const totals = { users: 10, submissions: 5, tasks: 3 };
      service.countTotals.mockResolvedValue(totals);

      const result = await controller.countTotals();

      expect(result).toEqual({
        success: true,
        message: 'Totals counted successfully',
        data: totals,
      });
      expect(service.countTotals).toHaveBeenCalled();
    });
  });

  // ---------------- getAllUsers ----------------
  describe('getAllUsers', () => {
    it('should return wrapped users response', async () => {
      const query: BaseQueryDto = { page: 1, limit: 10 } as any;
      const users = [{ id: 1 }, { id: 2 }];
      service.getAllUsers.mockResolvedValue(users);

      const result = await controller.getAllUsers(query);

      expect(result).toEqual({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      });
      expect(service.getAllUsers).toHaveBeenCalledWith(query);
    });
  });

  // ---------------- getAllSubmissions ----------------
  describe('getAllSubmissions', () => {
    it('should return wrapped submissions response', async () => {
      const query: BaseQueryDto = { page: 1, limit: 10 } as any;
      const submissions = [{ id: 101 }, { id: 102 }];
      service.getAllSubmissions.mockResolvedValue(submissions);

      const result = await controller.getAllSubmissions(query);

      expect(result).toEqual({
        success: true,
        message: 'Submissions retrieved successfully',
        data: submissions,
      });
      expect(service.getAllSubmissions).toHaveBeenCalledWith(query);
    });
  });

  // ---------------- getAllTasks ----------------
  describe('getAllTasks', () => {
    it('should return wrapped tasks response', async () => {
      const query: BaseQueryDto = { page: 1, limit: 10 } as any;
      const tasks = [{ id: 201 }, { id: 202 }];
      service.getAllTasks.mockResolvedValue(tasks);

      const result = await controller.getAllTasks(query);

      expect(result).toEqual({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks,
      });
      expect(service.getAllTasks).toHaveBeenCalledWith(query);
    });
  });
});
