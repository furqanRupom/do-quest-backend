import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';

describe('AuthService', () => {
  let service: AuthService;

  const mockAuthRepository = {
    createUser: jest.fn(),  
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,   
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user', async () => {
    const userData = {
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