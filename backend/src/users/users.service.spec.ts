import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  profile: {
    update: jest.fn(),
  },
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'USER',
  avatar: 'default.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne()', () => {
    it('should find user by email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findOne('test@example.com');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { profile: true },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById()', () => {
    it('should find user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findById('user-1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: { profile: true },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('create()', () => {
    it('should create user and initialize empty profile', async () => {
      mockPrisma.user.create.mockResolvedValue(mockUser);
      const dto = { email: 'test@example.com', password: 'hash' };
      const result = await service.create(dto as any);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          profile: { create: {} },
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile()', () => {
    it('should update user profile', async () => {
      const updatedProfile = { id: 'prof-1', userId: 'user-1', headline: 'Dev' };
      mockPrisma.profile.update.mockResolvedValue(updatedProfile);
      const result = await service.updateProfile('user-1', { headline: 'Dev' });
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { headline: 'Dev' },
      });
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('updateAvatar()', () => {
    it('should update user avatar', async () => {
      const updatedUser = { ...mockUser, avatar: 'new-avatar.jpg' };
      mockPrisma.user.update.mockResolvedValue(updatedUser);
      const result = await service.updateAvatar('user-1', 'new-avatar.jpg');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { avatar: 'new-avatar.jpg' },
      });
      expect(result).toEqual(updatedUser);
    });
  });
});
