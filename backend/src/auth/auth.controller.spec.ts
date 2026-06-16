import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  register: jest.fn(),
  validateUser: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── POST /auth/register ────────────────────────────────────────────────────
  describe('register()', () => {
    it('should call authService.register and return token', async () => {
      const dto = { email: 'test@example.com', password: 'Test@1234', firstName: 'Test', lastName: 'User' };
      const response = { access_token: 'jwt-token', user: { id: '1', email: 'test@example.com' } };
      mockAuthService.register.mockResolvedValue(response);

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });

    it('should propagate ConflictException for duplicate email', async () => {
      mockAuthService.register.mockRejectedValue(new ConflictException('Email already exists'));

      await expect(
        controller.register({ email: 'dup@example.com', password: '123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── POST /auth/login ──────────────────────────────────────────────────────
  describe('login()', () => {
    it('should return token when credentials are valid', async () => {
      const validUser = { id: '1', email: 'test@example.com', role: 'USER', firstName: 'T', lastName: 'U' };
      const loginResponse = { access_token: 'jwt-token', user: validUser };

      mockAuthService.validateUser.mockResolvedValue(validUser);
      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login({ email: 'test@example.com', password: 'Test@1234' });

      expect(mockAuthService.validateUser).toHaveBeenCalledWith('test@example.com', 'Test@1234');
      expect(mockAuthService.login).toHaveBeenCalledWith(validUser);
      expect(result).toEqual(loginResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        controller.login({ email: 'bad@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
});
