import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  application: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

const mockApplication = {
  id: 'app-1',
  userId: 'user-1',
  jobId: 'job-1',
  status: 'PENDING',
  createdAt: new Date(),
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('apply()', () => {
    it('should create application if not already applied', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockApplication);

      const result = await service.apply('user-1', 'job-1');
      expect(result.status).toBe('PENDING');
      expect(mockPrisma.application.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if already applied', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

      await expect(service.apply('user-1', 'job-1')).rejects.toThrow(BadRequestException);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });
  });

  describe('getMyApplications()', () => {
    it('should return list of user applications', async () => {
      mockPrisma.application.findMany.mockResolvedValue([mockApplication]);

      const result = await service.getMyApplications('user-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('getJobApplications()', () => {
    it('should return applications for a specific job', async () => {
      mockPrisma.application.findMany.mockResolvedValue([mockApplication]);

      const result = await service.getJobApplications('job-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { jobId: 'job-1' } }),
      );
    });
  });

  describe('updateStatus()', () => {
    it('should update application status', async () => {
      const updated = { ...mockApplication, status: 'ACCEPTED' };
      mockPrisma.application.update.mockResolvedValue(updated);

      const result = await service.updateStatus('app-1', 'ACCEPTED');
      expect(result.status).toBe('ACCEPTED');
      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'app-1' }, data: { status: 'ACCEPTED' } }),
      );
    });
  });
});
