import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { LoginUserDto } from './dto/login-user.dto';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ─────────────────────────────────────────────
// Mock Type Definitions
// ─────────────────────────────────────────────
type MockAuthRepository = jest.Mocked<AuthRepository>;
type MockJwtService = jest.Mocked<JwtService>;
type MockConfigService = jest.Mocked<ConfigService>;
type MockMailService = jest.Mocked<MailService>;

interface MockUserDocument {
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: string;
  needPasswordChange: boolean;
  password?: string;
  comparePassword: jest.Mock<(password: string) => Promise<boolean>>;
  save?: jest.Mock<() => Promise<void>>;
}

describe('AuthService', () => {
  let service: AuthService;

  const mockAuthRepository: MockAuthRepository = {
    createUser: jest.fn(),
    findByUsernameOrEmail: jest.fn(),
    findById: jest.fn(),
  } as unknown as MockAuthRepository;

  const mockJwtService: MockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as MockJwtService;

  const mockConfigService: MockConfigService = {
    get: jest.fn(),
  } as unknown as MockConfigService;

  const mockMailService: MockMailService = {
    sendEmail: jest.fn(),
  } as unknown as MockMailService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // registerUser
  // ─────────────────────────────────────────────
  describe('registerUser', () => {
    const userData: CreateUserDto = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      password: 'password123',
      needPasswordChange: true,
    };

    it('should call authRepository.createUser with the correct payload', async () => {
      const repoResult = {
        name: userData.name,
        username: userData.username,
        email: userData.email,
      };
      mockAuthRepository.createUser.mockResolvedValue(repoResult as any);

      await service.registerUser(userData);

      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(userData);
    });

    it('should return the created user without a password field', async () => {
      const repoResult = {
        name: userData.name,
        username: userData.username,
        email: userData.email,
      };
      mockAuthRepository.createUser.mockResolvedValue(repoResult as any);

      const result = await service.registerUser(userData);

      expect(result).toHaveProperty('name', userData.name);
      expect(result).toHaveProperty('username', userData.username);
      expect(result).toHaveProperty('email', userData.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should propagate repository errors', async () => {
      mockAuthRepository.createUser.mockRejectedValue(new Error('Duplicate key'));

      await expect(service.registerUser(userData)).rejects.toThrow('Duplicate key');
    });
  });

  // ─────────────────────────────────────────────
  // loginUser
  // ─────────────────────────────────────────────
  describe('loginUser', () => {
    const loginDto: LoginUserDto = {
      usernameOrEmail: 'johndoe',
      password: 'password123',
    };

    const createMockUser = (overrides?: Partial<MockUserDocument>): MockUserDocument => ({
      _id: '12345',
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      role: 'user',
      needPasswordChange: false,
      comparePassword: jest.fn(),
      ...overrides,
    });

    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string): string | null => {
        const map: Record<string, string> = {
          secretAccessToken: 'access-secret',
          accessTokenExpiry: '15m',
          secretRefreshToken: 'refresh-secret',
          refreshTokenExpiry: '7d',
        };
        return map[key] ?? null;
      });

      mockJwtService.signAsync.mockImplementation(
        (_payload: unknown, options?: { secret?: string }): Promise<string> => {
          if (options?.secret === 'access-secret') return Promise.resolve('mock-access-token');
          if (options?.secret === 'refresh-secret') return Promise.resolve('mock-refresh-token');
          return Promise.resolve('generic-token');
        },
      );
    });

    it('should return access and refresh tokens on successful login', async () => {
      const mockUser = createMockUser();
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(await (mockUser as unknown as ReturnType<AuthRepository['findByUsernameOrEmail']>));
      mockUser.comparePassword.mockResolvedValue(true);

      const result = await service.loginUser(loginDto);

      expect(mockAuthRepository.findByUsernameOrEmail).toHaveBeenCalledWith(
        loginDto.usernameOrEmail,
      );
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginDto.password);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(null);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('User not found via username or email', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw UNAUTHORIZED when the password is incorrect', async () => {
      const mockUser = createMockUser();
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(await (mockUser as unknown as ReturnType<AuthRepository['findByUsernameOrEmail']>));
      mockUser.comparePassword.mockResolvedValue(false);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw FORBIDDEN when needPasswordChange is true', async () => {
      const mockUser = createMockUser({ needPasswordChange: true });
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(await (mockUser as unknown as ReturnType<AuthRepository['findByUsernameOrEmail']>));
      mockUser.comparePassword.mockResolvedValue(true);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('Password change required', HttpStatus.FORBIDDEN),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should sign tokens with the correct payload and config values', async () => {
      const mockUser = createMockUser();
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(await (mockUser as unknown as ReturnType<AuthRepository['findByUsernameOrEmail']>));
      mockUser.comparePassword.mockResolvedValue(true);

      await service.loginUser(loginDto);

      const expectedPayload = {
        sub: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      };

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(1, expectedPayload, {
        secret: 'access-secret',
        expiresIn: '15m',
      });
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(2, expectedPayload, {
        secret: 'refresh-secret',
        expiresIn: '7d',
      });
    });
  });

  // ─────────────────────────────────────────────
  // forgotPassword
  // ─────────────────────────────────────────────
  describe('forgotPassword', () => {
    const email = 'johndoe@gmail.com';
    const mockUser = { _id: '12345', name: 'John Doe', email };

    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string): string | null => {
        const map: Record<string, string> = {
          resetSecret: 'reset-secret',
          resetTokenExpiry: '1h',
          forgotPasswordUrl: 'http://localhost:3000',
        };
        return map[key] ?? null;
      });
      mockJwtService.signAsync.mockResolvedValue('mock-reset-token');
    });

    it('should sign a reset token with the correct payload', async () => {
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(await (mockUser as unknown as ReturnType<AuthRepository['findByUsernameOrEmail']>));

      await service.forgotPassword(email);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser._id, email: mockUser.email },
        { secret: 'reset-secret', expiresIn: '1h' },
      );
    });

    it('should send a password reset email with the correct context', async () => {
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(await (mockUser as unknown as ReturnType<AuthRepository['findByUsernameOrEmail']>));

      await service.forgotPassword(email);

      expect(mockMailService.sendEmail).toHaveBeenCalledWith({
        subject: 'Password Reset',
        template: 'forgot-password',
        recipeintEmail: email,
        context: {
          name: mockUser.name,
          resetPasswordLink: `http://localhost:3000/reset-password?token=mock-reset-token`,
        },
      });
    });

    it('should throw NOT_FOUND when no user matches the email', async () => {
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(null);

      await expect(service.forgotPassword(email)).rejects.toThrow(
        new HttpException('User not found via email', HttpStatus.NOT_FOUND),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
      expect(mockMailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // resetPassword
  // ─────────────────────────────────────────────
  describe('resetPassword', () => {
    const validToken = 'valid-jwt-token';
    const newPassword = 'newStrongPassword123!';
    const decodedPayload = { sub: '12345', email: 'user@example.com' };

    const createMockUserWithSave = (): MockUserDocument => ({
      _id: '12345',
      password: 'oldHashedPassword',
      username: 'testuser',
      email: 'user@example.com',
      role: 'user',
      needPasswordChange: false,
      comparePassword: jest.fn(),
      save: jest.fn(),
    });

    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string): string | null =>
        key === 'resetSecret' ? 'reset-secret' : null,
      );
    });

    it('should update the user password and call save on a valid token', async () => {
      const mockUser = createMockUserWithSave();
      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockAuthRepository.findById.mockResolvedValue(await (mockUser as unknown as ReturnType<AuthRepository['findById']>));
      mockUser.save!.mockResolvedValue();

      await expect(service.resetPassword(validToken, newPassword)).resolves.toBeUndefined();

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(validToken, {
        secret: 'reset-secret',
      });
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(decodedPayload.sub);
      expect(mockUser.password).toBe(newPassword);
      expect(mockUser.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NOT_FOUND when the user decoded from the token does not exist', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: '99999', email: 'missing@example.com' });
      mockAuthRepository.findById.mockResolvedValue(null);

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw BAD_REQUEST when the JWT has expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow(
        new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST),
      );
      expect(mockAuthRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST for any other JWT verification error', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow(
        new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST),
      );
      expect(mockAuthRepository.findById).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // refreshTokens
  // ─────────────────────────────────────────────
  describe('refreshTokens', () => {
    const refreshToken = 'valid-refresh-token';
    const decodedPayload = {
      sub: '12345',
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      role: 'user',
    };

    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string): string | null => {
        const map: Record<string, string> = {
          secretAccessToken: 'access-secret',
          accessTokenExpiry: '15m',
          secretRefreshToken: 'refresh-secret',
          refreshTokenExpiry: '7d',
        };
        return map[key] ?? null;
      });
    });

    it('should return new access and refresh tokens for a valid refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockJwtService.signAsync.mockImplementation(
        (_payload: unknown, options?: { secret?: string }): Promise<string> => {
          if (options?.secret === 'access-secret') return Promise.resolve('new-access-token');
          if (options?.secret === 'refresh-secret') return Promise.resolve('new-refresh-token');
          return Promise.resolve('unknown-token');
        },
      );

      const result = await service.refreshTokens(refreshToken);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'refresh-secret',
      });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should sign new tokens using the decoded payload fields', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockJwtService.signAsync.mockResolvedValue('any-token');

      await service.refreshTokens(refreshToken);

      const expectedPayload = {
        sub: decodedPayload.sub,
        username: decodedPayload.username,
        email: decodedPayload.email,
        role: decodedPayload.role,
      };

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(1, expectedPayload, {
        secret: 'access-secret',
        expiresIn: '15m',
      });
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(2, expectedPayload, {
        secret: 'refresh-secret',
        expiresIn: '7d',
      });
    });

    it('should throw BAD_REQUEST when the refresh token is expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        new HttpException('Invalid or expired refresh token', HttpStatus.BAD_REQUEST),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST for any refresh token verification failure', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        new HttpException('Invalid or expired refresh token', HttpStatus.BAD_REQUEST),
      );
    });
  });
});