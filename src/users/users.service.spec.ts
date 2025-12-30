import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ChangePasswordDto, UpdateUserDto } from './dto';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  const mockUserId = 'user-123';

  const mockUser = {
    _id: mockUserId,
    email: 'test@example.com',
    comparePassword: jest.fn(),
  };

  const mockUsersRepository = {
    getUserWithoutPassword: jest.fn(),
    updateProfile: jest.fn(),
    getUserById: jest.fn(),
    updateUserPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------
  // Service existence
  // ---------------------------------------------------
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------
  // getUserProfile
  // ---------------------------------------------------
  describe('getUserProfile', () => {
    it('should return user profile when user exists', async () => {
      usersRepository.getUserWithoutPassword.mockResolvedValue(
        mockUser as any,
      );

      const result = await service.getUserProfile(mockUserId);

      expect(usersRepository.getUserWithoutPassword).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NOT_FOUND if user does not exist', async () => {
      usersRepository.getUserWithoutPassword.mockResolvedValue(null);

      await expect(
        service.getUserProfile(mockUserId),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ---------------------------------------------------
  // updateUserProfile
  // ---------------------------------------------------
  describe('updateUserProfile', () => {
    it('should update and return user profile', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = {
        _id: mockUserId,
        name: 'Updated Name',
      };

      usersRepository.updateProfile.mockResolvedValue(
        updatedUser as any,
      );

      const result = await service.updateUserProfile(
        mockUserId,
        updateDto,
      );

      expect(usersRepository.updateProfile).toHaveBeenCalledWith(
        mockUserId,
        updateDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  // ---------------------------------------------------
  // changeUserPassword
  // ---------------------------------------------------
  describe('changeUserPassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldPass123',
      newPassword: 'newPass123',
    };

    it('should change password successfully', async () => {
      mockUser.comparePassword.mockResolvedValue(true);
      usersRepository.getUserById.mockResolvedValue(
        mockUser as any,
      );

      usersRepository.updateUserPassword.mockResolvedValue(undefined);

      await expect(
        service.changeUserPassword(mockUserId, changePasswordDto),
      ).resolves.toBeUndefined();

      expect(usersRepository.getUserById).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(mockUser.comparePassword).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
      );
      expect(usersRepository.updateUserPassword).toHaveBeenCalledWith(
        mockUserId,
        changePasswordDto.newPassword,
      );
    });

    it('should throw NOT_FOUND if user does not exist', async () => {
      usersRepository.getUserById.mockResolvedValue(null);

      await expect(
        service.changeUserPassword(mockUserId, changePasswordDto),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw BAD_REQUEST if current password is incorrect', async () => {
      mockUser.comparePassword.mockResolvedValue(false);
      usersRepository.getUserById.mockResolvedValue(
        mockUser as any,
      );

      await expect(
        service.changeUserPassword(mockUserId, changePasswordDto),
      ).rejects.toThrow(
        new HttpException(
          'Current password is incorrect',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(usersRepository.updateUserPassword).not.toHaveBeenCalled();
    });
  });
});
