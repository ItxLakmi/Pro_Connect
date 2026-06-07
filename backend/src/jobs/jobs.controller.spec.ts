import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

const mockJobsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getMyJobs: jest.fn(),
  getSavedJobs: jest.fn(),
  toggleSaveJob: jest.fn(),
};

const mockJob = {
  id: 'job-1',
  title: 'Senior Developer',
  description: 'Build amazing things',
  location: 'Remote',
  type: 'FULL_TIME',
  salaryRange: '100k-120k',
  postedById: 'user-1',
  createdAt: new Date(),
};

describe('JobsController', () => {
  let controller: JobsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [{ provide: JobsService, useValue: mockJobsService }],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── GET /jobs ─────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return an array of jobs', async () => {
      mockJobsService.findAll.mockResolvedValue([mockJob]);

      const result = await controller.findAll();

      expect(mockJobsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Senior Developer');
    });

    it('should pass search filter to service', async () => {
      mockJobsService.findAll.mockResolvedValue([]);

      await controller.findAll(undefined, undefined, 'developer', undefined, undefined, undefined);

      expect(mockJobsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.objectContaining({ contains: 'developer' }) }),
            ]),
          }),
        }),
      );
    });

    it('should pass location filter to service', async () => {
      mockJobsService.findAll.mockResolvedValue([]);

      await controller.findAll(undefined, undefined, undefined, 'Remote', undefined, undefined);

      expect(mockJobsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: expect.objectContaining({ contains: 'Remote' }),
          }),
        }),
      );
    });

    it('should pass pagination params (skip/take) to service', async () => {
      mockJobsService.findAll.mockResolvedValue([]);

      await controller.findAll('10', '5');

      expect(mockJobsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  // ─── GET /jobs/:id ─────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a single job', async () => {
      mockJobsService.findOne.mockResolvedValue(mockJob);

      const result = await controller.findOne('job-1');

      expect(mockJobsService.findOne).toHaveBeenCalledWith('job-1');
      expect(result).toEqual(mockJob);
    });

    it('should return null for non-existent job', async () => {
      mockJobsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  // ─── POST /jobs ────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create a new job for authenticated user', async () => {
      mockJobsService.create.mockResolvedValue(mockJob);

      const mockReq = { user: { userId: 'user-1' } };
      const dto = { title: 'Senior Developer', description: 'Build', location: 'Remote', type: 'FULL_TIME' };

      const result = await controller.create(mockReq, dto);

      expect(mockJobsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...dto,
          postedBy: { connect: { id: 'user-1' } },
        }),
      );
      expect(result).toEqual(mockJob);
    });
  });

  // ─── PATCH /jobs/:id ───────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update and return the job', async () => {
      const updated = { ...mockJob, title: 'Updated Title' };
      mockJobsService.update.mockResolvedValue(updated);

      const mockReq = { user: { userId: 'user-1' } };
      const result = await controller.update(mockReq, 'job-1', { title: 'Updated Title' } as any);

      expect(mockJobsService.update).toHaveBeenCalledWith('job-1', { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });
  });

  // ─── DELETE /jobs/:id ──────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete and return the removed job', async () => {
      mockJobsService.remove.mockResolvedValue(mockJob);

      const mockReq = { user: { userId: 'user-1' } };
      const result = await controller.remove(mockReq, 'job-1');

      expect(mockJobsService.remove).toHaveBeenCalledWith('job-1');
      expect(result).toEqual(mockJob);
    });
  });

  // ─── GET /jobs/me ──────────────────────────────────────────────────────────
  describe('findMyJobs()', () => {
    it('should return jobs posted by the authenticated user', async () => {
      mockJobsService.getMyJobs.mockResolvedValue([mockJob]);

      const mockReq = { user: { userId: 'user-1' } };
      const result = await controller.findMyJobs(mockReq);

      expect(mockJobsService.getMyJobs).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(1);
    });
  });

  // ─── GET /jobs/saved ──────────────────────────────────────────────────────
  describe('findSavedJobs()', () => {
    it('should return saved jobs for the authenticated user', async () => {
      mockJobsService.getSavedJobs.mockResolvedValue([mockJob]);

      const mockReq = { user: { userId: 'user-1' } };
      const result = await controller.findSavedJobs(mockReq);

      expect(mockJobsService.getSavedJobs).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(1);
    });
  });

  // ─── POST /jobs/:id/save ──────────────────────────────────────────────────
  describe('toggleSaveJob()', () => {
    it('should toggle save state and return result', async () => {
      mockJobsService.toggleSaveJob.mockResolvedValue({ saved: true });

      const mockReq = { user: { userId: 'user-1' } };
      const result = await controller.toggleSaveJob(mockReq, 'job-1');

      expect(mockJobsService.toggleSaveJob).toHaveBeenCalledWith('user-1', 'job-1');
      expect(result).toEqual({ saved: true });
    });
  });
});
