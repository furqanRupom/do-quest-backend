import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockAuthService = {
      registerUser: jest.fn(),
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
        message: 'User registered successfully',
        data: serviceResult,
      });
    });
  });
});