import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import type { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockAuthService = {
      registerUser: jest.fn(),
      loginUser: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(), 
      json: jest.fn(),
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

      const serviceResult = { username: 'testuser', email: 'test@example.com' };

      mockAuthService.registerUser.mockResolvedValue(serviceResult);

      await controller.register(createUserDto, mockResponse as Response);

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
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

      // Mock the service to return tokens
      mockAuthService.loginUser.mockResolvedValue(tokens);

      // Call the login method
      await controller.login(loginUserDto, mockResponse as Response);

      // Assertions
      expect(mockAuthService.loginUser).toHaveBeenCalledWith(loginUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User logged in successfully',
        data: tokens,
      });
    });
  });
});