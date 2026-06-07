import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

const mockUsersService = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mock-jwt-token'),
};

const mockEmailService = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    service = module.get<AuthService>(AuthService);
    // Inject the mock manually since NestJS token might differ
    (service as any).usersService = mockUsersService;
    (service as any).jwtService = mockJwtService;
    (service as any).emailService = mockEmailService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── validateUser ──────────────────────────────────────────────────────────
  describe('validateUser()', () => {
    it('should return user object (without password) if credentials are valid', async () => {
      const hashed = await bcrypt.hash('Test@1234', 10);
      const dbUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: hashed,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
      };
      mockUsersService.findOne.mockResolvedValue(dbUser);

      const result = await service.validateUser('test@example.com', 'Test@1234');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'anypass');

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      mockUsersService.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashed,
      });

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  // ─── login ─────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('should return access_token and user info', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await service.login(user);

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('password');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
    });
  });

  // ─── register ──────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('should create a new user and return access_token', async () => {
      mockUsersService.findOne.mockResolvedValue(null); // no existing user
      const createdUser = {
        id: 'user-new',
        email: 'new@example.com',
        role: 'USER',
        firstName: 'New',
        lastName: 'User',
      };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register({
        email: 'new@example.com',
        password: 'Test@1234',
        firstName: 'New',
        lastName: 'User',
      });

      expect(result).toHaveProperty('access_token');
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: 'existing', email: 'dup@example.com' });

      await expect(
        service.register({ email: 'dup@example.com', password: 'Test@1234' }),
      ).rejects.toThrow(ConflictException);

      expect(mockUsersService.create).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      const createdUser = { id: 'u1', email: 'a@b.com', role: 'USER', firstName: 'A', lastName: 'B' };
      mockUsersService.create.mockResolvedValue(createdUser);

      await service.register({ email: 'a@b.com', password: 'plaintext' });

      const callArg = mockUsersService.create.mock.calls[0][0];
      expect(callArg.password).not.toBe('plaintext');
      const isHashed = await bcrypt.compare('plaintext', callArg.password);
      expect(isHashed).toBe(true);
    });
  });
});
