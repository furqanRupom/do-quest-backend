import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { ExecutionContext } from '@nestjs/common';
import {
  ChangePasswordDto,
  UpdateUserDto,
} from './dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUserId = 'user-123';

  const mockAuthRequest = {
    user: {
      sub: mockUserId,
    },
  };

  const mockUsersService = {
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    changeUserPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
      };

      usersService.getUserProfile.mockResolvedValue(mockProfile as any);

      const result = await controller.getUserProfile(
        mockAuthRequest as any,
      );

      expect(usersService.getUserProfile).toHaveBeenCalledWith(mockUserId);

      expect(result).toEqual({
        success: true,
        message: 'User Profile fetched successfully',
        data: mockProfile,
      });
    });
  });


  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedProfile = {
        id: mockUserId,
        name: 'Updated Name',
      };

      usersService.updateUserProfile.mockResolvedValue(
        updatedProfile as any,
      );

      const result = await controller.updateProfile(
        updateDto,
        mockAuthRequest as any,
      );

      expect(usersService.updateUserProfile).toHaveBeenCalledWith(
        mockUserId,
        updateDto,
      );

      expect(result).toEqual({
        success: true,
        message: 'User Profile updated successfully',
        data: updatedProfile,
      });
    });
  });


  describe('changePassword', () => {
    it('should change user password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPass123',
        newPassword: 'newPass123',
      };

      usersService.changeUserPassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        changePasswordDto,
        mockAuthRequest as any,
      );

      expect(usersService.changeUserPassword).toHaveBeenCalledWith(
        mockUserId,
        changePasswordDto,
      );

      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully',
        data: null,
      });
    });
  });
});
