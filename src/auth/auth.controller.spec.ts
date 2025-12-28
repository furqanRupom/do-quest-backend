import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { IUser } from './interfaces/user.interface';
import mongoose from 'mongoose';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      registerUser: jest.fn(),
      loginUser: jest.fn(),
      forgotPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return success response', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        name: 'Test User',
        password: 'password123',
        email: 'test@example.com',
      };

      const serviceResult:IUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        location: 'Test Location',
        company: 'Test Company',
        socialLinks: ['http://example.com'],
};

      jest.spyOn(authService, 'registerUser').mockResolvedValue(serviceResult);

      const result = await controller.register(createUserDto);

      expect(authService.registerUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        success: true,
        message: 'User registered successfully',
        data: serviceResult,
      });
    });
  });

  describe('login', () => {
    it('should login a user and return tokens with success response', async () => {
      const loginUserDto: LoginUserDto = {
        usernameOrEmail: 'testuser',
        password: 'password123',
      };

      const tokens = {
        accessToken: 'jwt.access.token.here',
        refreshToken: 'jwt.refresh.token.here',
      };

      jest.spyOn(authService, 'loginUser').mockResolvedValue(tokens);

      const result = await controller.login(loginUserDto);

      expect(authService.loginUser).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual({
        success: true,
        message: 'User logged in successfully',
        data: tokens,
      });
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should call authService.forgotPassword and return success response', async () => {
      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(undefined);

      const result = await controller.forgotPassword({ email });

      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        success: true,
        message: 'Password reset email sent successfully',
        data: null,
      });
    });

    it('should throw if authService.forgotPassword fails', async () => {
      const error = new Error('Failed to send email');
      jest.spyOn(authService, 'forgotPassword').mockRejectedValue(error);

      await expect(controller.forgotPassword({ email })).rejects.toThrow('Failed to send email');
    });
  });

});
