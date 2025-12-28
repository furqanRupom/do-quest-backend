import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { LoginUserDto } from './dto/login-user.dto';

describe('AuthService', () => {
  let service: AuthService;

  const mockAuthRepository = {
    createUser: jest.fn(),
    findByUsernameOrEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockMailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailService,
          useValue: mockMailService, // ← Critical fix: MailService is now always provided
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user', async () => {
      const userData: CreateUserDto = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@gmail.com',
        password: 'password123',
      };

      const expectedResult = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@gmail.com',
      };

      mockAuthRepository.createUser.mockResolvedValue(expectedResult);

      const result = await service.registerUser(userData);

      expect(result).toHaveProperty('name', userData.name);
      expect(result).toHaveProperty('username', userData.username);
      expect(result).toHaveProperty('email', userData.email);
      expect(result).not.toHaveProperty('password');
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(userData);
    });
  });

  describe('loginUser', () => {
    const loginDto: LoginUserDto = {
      usernameOrEmail: 'johndoe',
      password: 'password123',
    };

    const mockUser = {
      _id: '12345',
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      comparePassword: jest.fn(),
    };

    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'secretAccessToken') return 'access-secret';
        if (key === 'accessTokenExpiry') return '15m';
        if (key === 'secretRefreshToken') return 'refresh-secret';
        if (key === 'refreshTokenExpiry') return '7d';
        return null;
      });

      mockJwtService.signAsync.mockImplementation((payload, options) => {
        if (options?.secret === 'access-secret') {
          return Promise.resolve('mock-access-token');
        }
        if (options?.secret === 'refresh-secret') {
          return Promise.resolve('mock-refresh-token');
        }
        return Promise.resolve('generic-token');
      });
    });

    it('should successfully login and return access and refresh tokens', async () => {
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);

      const result = await service.loginUser(loginDto);

      expect(mockAuthRepository.findByUsernameOrEmail).toHaveBeenCalledWith(loginDto.usernameOrEmail);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginDto.password);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('should throw HttpException if user is not found', async () => {
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(null);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('User not found via username or email', HttpStatus.NOT_FOUND),
      );

      expect(mockUser.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw HttpException if password is incorrect', async () => {
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED),
      );

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'resetSecret') return 'reset-secret';
        if (key === 'resetTokenExpiry') return '1h';
        return null;
      });

      mockJwtService.signAsync.mockResolvedValue('mock-reset-token');
    });

    it('should send a password reset email if user exists', async () => {
      const email = 'johndoe@gmail.com';
      const mockUser = {
        _id: '12345',
        name: 'John Doe',
        email,
      };

      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);

      await service.forgotPassword(email);

      expect(mockAuthRepository.findByUsernameOrEmail).toHaveBeenCalledWith(email);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser._id, email: mockUser.email },
        { secret: 'reset-secret', expiresIn: '1h' },
      );
      expect(mockMailService.sendEmail).toHaveBeenCalledWith({
        subject: 'Password Reset',
        template: 'forgot-password',
        recipeintEmail: email, // Note: typo in original – should be "recipientEmail"?
        context: {
          name: mockUser.name,
          resetPasswordLink: `http://localhost:3000/reset-password?token=mock-reset-token`,
        },
      });
    });

    it('should throw HttpException if user does not exist', async () => {
      const email = 'nonexistent@example.com';
      mockAuthRepository.findByUsernameOrEmail.mockResolvedValue(null);

      await expect(service.forgotPassword(email)).rejects.toThrow(
        new HttpException('User not found via email', HttpStatus.NOT_FOUND),
      );

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
      expect(mockMailService.sendEmail).not.toHaveBeenCalled();
    });
  });
  describe('resetPassword', () => {
    const validToken = 'valid-jwt-token';
    const newPassword = 'newStrongPassword123!';
    const mockUser = {
      _id: '12345',
      password: 'oldHashedPassword',
      save: jest.fn(),
    };

    beforeEach(() => {
      // Reset common mocks
      mockJwtService.verifyAsync.mockReset();
      mockAuthRepository.findById.mockReset();
      mockUser.save.mockReset();
    });

    it('should successfully reset password when token is valid and user exists', async () => {
      const decodedPayload = { sub: '12345', email: 'user@example.com' };

      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockAuthRepository.findById.mockResolvedValue(mockUser);
      mockUser.save.mockResolvedValue(undefined);

      await expect(service.resetPassword(validToken, newPassword)).resolves.toBeUndefined();

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(validToken, {
        secret: expect.any(String), // resetSecret from config
      });
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(decodedPayload.sub);
      expect(mockUser.password).toBe(newPassword); // Direct assignment before save
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw HttpException if user is not found', async () => {
      const decodedPayload = { sub: '99999', email: 'missing@example.com' };

      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockAuthRepository.findById.mockResolvedValue(null);

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should throw HttpException if token is invalid or expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow(
        new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST),
      );

      expect(mockAuthRepository.findById).not.toHaveBeenCalled();
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should throw HttpException for any other verification error', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow(
        new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST),
      );
    });
  });
  describe('refreshTokens', () => {
    const refreshToken = 'valid-refresh-token';

    const decodedPayload = {
      sub: '12345',
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      role: 'user',
    };

    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'secretAccessToken') return 'access-secret';
        if (key === 'accessTokenExpiry') return '15m';
        if (key === 'secretRefreshToken') return 'refresh-secret';
        if (key === 'refreshTokenExpiry') return '7d';
        return null;
      });

      mockJwtService.verifyAsync.mockReset();
      mockJwtService.signAsync.mockReset();
    });

    it('should generate new access and refresh tokens when refresh token is valid', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);

      mockJwtService.signAsync.mockImplementation((payload, options) => {
        if (options?.secret === 'access-secret') {
          return Promise.resolve('new-access-token');
        }
        if (options?.secret === 'refresh-secret') {
          return Promise.resolve('new-refresh-token');
        }
        return Promise.resolve('unknown-token');
      });

      const result = await service.refreshTokens(refreshToken);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'refresh-secret',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw HttpException if refresh token is invalid or expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        new HttpException('Invalid or expired refresh token', HttpStatus.BAD_REQUEST),
      );

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });

});