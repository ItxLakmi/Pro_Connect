import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Prisma Mock ───────────────────────────────────────────────────────────────
const mockPrisma = {
  job: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  savedJob: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
};

// ─── Sample Data ──────────────────────────────────────────────────────────────
const mockJob = {
  id: 'job-1',
  title: 'Senior Developer',
  description: 'Build amazing things',
  location: 'Remote',
  type: 'FULL_TIME',
  salaryRange: '100k-120k',
  postedById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create() ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create and return a job', async () => {
      mockPrisma.job.create.mockResolvedValue(mockJob);

      const result = await service.create({
        title: 'Senior Developer',
        description: 'Build amazing things',
        location: 'Remote',
        type: 'FULL_TIME',
        postedBy: { connect: { id: 'user-1' } },
      } as any);

      expect(mockPrisma.job.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockJob);
      expect(result.title).toBe('Senior Developer');
    });
  });

  // ─── findAll() ──────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return array of jobs', async () => {
      const jobs = [mockJob, { ...mockJob, id: 'job-2', title: 'Frontend Engineer' }];
      mockPrisma.job.findMany.mockResolvedValue(jobs);

      const result = await service.findAll({});

      expect(mockPrisma.job.findMany).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });

    it('should pass skip and take to prisma', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);

      await service.findAll({ skip: 10, take: 5 });

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });

    it('should return empty array when no jobs exist', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(result).toEqual([]);
    });
  });

  // ─── findOne() ──────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a single job by id', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      const result = await service.findOne('job-1');

      expect(mockPrisma.job.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'job-1' } }),
      );
      expect(result).toEqual(mockJob);
    });

    it('should return null if job not found', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  // ─── update() ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update and return the updated job', async () => {
      const updatedJob = { ...mockJob, title: 'Updated Title' };
      mockPrisma.job.update.mockResolvedValue(updatedJob);

      const result = await service.update('job-1', { title: 'Updated Title' });

      expect(mockPrisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'job-1' } }),
      );
      expect(result.title).toBe('Updated Title');
    });
  });

  // ─── remove() ───────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete and return the deleted job', async () => {
      mockPrisma.job.delete.mockResolvedValue(mockJob);

      const result = await service.remove('job-1');

      expect(mockPrisma.job.delete).toHaveBeenCalledWith({ where: { id: 'job-1' } });
      expect(result).toEqual(mockJob);
    });
  });

  // ─── getMyJobs() ────────────────────────────────────────────────────────────
  describe('getMyJobs()', () => {
    it('should return jobs posted by the given user', async () => {
      const userJobs = [mockJob];
      mockPrisma.job.findMany.mockResolvedValue(userJobs);

      const result = await service.getMyJobs('user-1');

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { postedById: 'user-1' } }),
      );
      expect(result).toEqual(userJobs);
    });
  });

  // ─── toggleSaveJob() ────────────────────────────────────────────────────────
  describe('toggleSaveJob()', () => {
    it('should save job if not already saved', async () => {
      mockPrisma.savedJob.findUnique.mockResolvedValue(null);
      mockPrisma.savedJob.create.mockResolvedValue({ id: 'saved-1', userId: 'user-1', jobId: 'job-1' });

      const result = await service.toggleSaveJob('user-1', 'job-1');

      expect(mockPrisma.savedJob.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ saved: true });
    });

    it('should unsave job if already saved', async () => {
      mockPrisma.savedJob.findUnique.mockResolvedValue({ id: 'saved-1', userId: 'user-1', jobId: 'job-1' });
      mockPrisma.savedJob.delete.mockResolvedValue({ id: 'saved-1' });

      const result = await service.toggleSaveJob('user-1', 'job-1');

      expect(mockPrisma.savedJob.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ saved: false });
    });
  });

  // ─── getSavedJobs() ─────────────────────────────────────────────────────────
  describe('getSavedJobs()', () => {
    it('should return list of saved jobs for a user', async () => {
      const savedJobRecords = [
        { id: 'saved-1', userId: 'user-1', jobId: 'job-1', job: mockJob },
      ];
      mockPrisma.savedJob.findMany.mockResolvedValue(savedJobRecords);

      const result = await service.getSavedJobs('user-1');

      expect(result).toEqual([mockJob]);
    });

    it('should return empty array if no saved jobs', async () => {
      mockPrisma.savedJob.findMany.mockResolvedValue([]);

      const result = await service.getSavedJobs('user-1');

      expect(result).toEqual([]);
    });
  });
});
