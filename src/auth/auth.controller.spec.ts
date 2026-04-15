import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto';
import { LoginUserDto } from './dto/login-user.dto';
import { IUser } from './interfaces/user.interface';
import { HttpException, HttpStatus } from '@nestjs/common';
import mongoose from 'mongoose';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { Response, Request } from 'express';

// ── Shared helper to create a mock Express Response ──────────────────────────
const buildMockResponse = (): jest.Mocked<Partial<Response>> => ({
  cookie: jest.fn() as any,
  clearCookie: jest.fn() as any,
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      registerUser: jest.fn(),
      loginUser: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      refreshTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // POST /auth/register
  // ─────────────────────────────────────────────
  describe('register', () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      name: 'Test User',
      password: 'password123',
      email: 'test@example.com',
      needPasswordChange: false, // caller value – controller overrides this
    };

    const serviceResult: IUser = {
      _id: new mongoose.Types.ObjectId(),
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      location: 'Test Location',
      company: 'Test Company',
      socialLinks: ['http://example.com'],
      needPasswordChange: true,
    };

    it('should return a success response with the created user', async () => {
      authService.registerUser.mockResolvedValue(serviceResult);

      const result = await controller.register(createUserDto);

      expect(result).toEqual({
        success: true,
        message: 'User registered successfully',
        data: serviceResult,
      });
    });

    it('should always forward needPasswordChange as true to the service', async () => {
      authService.registerUser.mockResolvedValue(serviceResult);

      await controller.register(createUserDto);

      // The controller spreads the DTO and overrides needPasswordChange to true
      expect(authService.registerUser).toHaveBeenCalledWith({
        ...createUserDto,
        needPasswordChange: true,
      });
    });

    it('should propagate service errors', async () => {
      authService.registerUser.mockRejectedValue(
        new HttpException('Email already exists', HttpStatus.CONFLICT),
      );

      await expect(controller.register(createUserDto)).rejects.toThrow(
        new HttpException('Email already exists', HttpStatus.CONFLICT),
      );
    });
  });

  // ─────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────
  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      usernameOrEmail: 'testuser',
      password: 'password123',
    };

    const tokens = {
      accessToken: 'jwt.access.token',
      refreshToken: 'jwt.refresh.token',
    };

    it('should return a success response with access and refresh tokens', async () => {
      authService.loginUser.mockResolvedValue(tokens);
      const mockRes = buildMockResponse() as unknown as Response;

      const result = await controller.login(mockRes, loginUserDto);

      expect(authService.loginUser).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual({
        success: true,
        message: 'User logged in successfully',
        data: tokens,
      });
    });

    it('should set auth cookies on the response', async () => {
      authService.loginUser.mockResolvedValue(tokens);
      const mockRes = buildMockResponse() as unknown as Response;

      await controller.login(mockRes, loginUserDto);

      // setAuthCookies must be called – verify via the cookie spy on the response
      expect(mockRes.cookie).toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when credentials are wrong', async () => {
      authService.loginUser.mockRejectedValue(
        new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED),
      );
      const mockRes = buildMockResponse() as unknown as Response;

      await expect(controller.login(mockRes, loginUserDto)).rejects.toThrow(
        new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw FORBIDDEN when the user must change their password', async () => {
      authService.loginUser.mockRejectedValue(
        new HttpException('Password change required', HttpStatus.FORBIDDEN),
      );
      const mockRes = buildMockResponse() as unknown as Response;

      await expect(controller.login(mockRes, loginUserDto)).rejects.toThrow(
        new HttpException('Password change required', HttpStatus.FORBIDDEN),
      );
    });
  });

  // ─────────────────────────────────────────────
  // POST /auth/forgot-password
  // ─────────────────────────────────────────────
  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should return a success response after sending the reset email', async () => {
      authService.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword({ email });

      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        success: true,
        message: 'Password reset email sent successfully',
        data: null,
      });
    });

    it('should throw NOT_FOUND when the email does not belong to any user', async () => {
      authService.forgotPassword.mockRejectedValue(
        new HttpException('User not found via email', HttpStatus.NOT_FOUND),
      );

      await expect(controller.forgotPassword({ email })).rejects.toThrow(
        new HttpException('User not found via email', HttpStatus.NOT_FOUND),
      );
    });

    it('should propagate unexpected service errors', async () => {
      authService.forgotPassword.mockRejectedValue(new Error('SMTP failure'));

      await expect(controller.forgotPassword({ email })).rejects.toThrow('SMTP failure');
    });
  });

  // ─────────────────────────────────────────────
  // POST /auth/reset-password
  // ─────────────────────────────────────────────
  describe('resetPassword', () => {
    const resetDto = {
      newPassword: 'newStrongPassword123!',
    };
    const token = "valid-reset-token-123"

    it('should return a success response after resetting the password', async () => {
      authService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(token,resetDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        token,
        resetDto.newPassword,
      );
      expect(result).toEqual({
        success: true,
        message: 'Password reset successfully',
        data: null,
      });
    });

    it('should throw BAD_REQUEST when the token is invalid or expired', async () => {
      authService.resetPassword.mockRejectedValue(
        new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.resetPassword(token,resetDto)).rejects.toThrow(
        new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw NOT_FOUND when the user in the token no longer exists', async () => {
      authService.resetPassword.mockRejectedValue(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.resetPassword(token,resetDto)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ─────────────────────────────────────────────
  // POST /auth/refresh-token
  // ─────────────────────────────────────────────
  describe('refreshToken', () => {
    const refreshTokenValue = 'valid-refresh-token-123';

    const buildMockRequest = (token: string) =>
      ({ cookies: { refreshToken: token } } as unknown as Request);

    const newTokens = {
      accessToken: 'new.jwt.access.token',
      refreshToken: 'new.jwt.refresh.token',
    };

    it('should return new tokens extracted from the cookie', async () => {
      authService.refreshTokens.mockResolvedValue(newTokens);

      const result = await controller.refreshToken(buildMockRequest(refreshTokenValue));

      expect(authService.refreshTokens).toHaveBeenCalledWith(refreshTokenValue);
      expect(result).toEqual({
        success: true,
        message: 'Token refreshed successfully',
        data: newTokens,
      });
    });

    it('should throw BAD_REQUEST when the refresh token is expired', async () => {
      authService.refreshTokens.mockRejectedValue(
        new HttpException('Invalid or expired refresh token', HttpStatus.BAD_REQUEST),
      );

      await expect(
        controller.refreshToken(buildMockRequest(refreshTokenValue)),
      ).rejects.toThrow(
        new HttpException('Invalid or expired refresh token', HttpStatus.BAD_REQUEST),
      );
    });

    it('should propagate unexpected service errors', async () => {
      authService.refreshTokens.mockRejectedValue(new Error('Unexpected error'));

      await expect(
        controller.refreshToken(buildMockRequest(refreshTokenValue)),
      ).rejects.toThrow('Unexpected error');
    });
  });
});