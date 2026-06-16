import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

const mockApplicationsService = {
  apply: jest.fn(),
  getMyApplications: jest.fn(),
  getJobApplications: jest.fn(),
  updateStatus: jest.fn(),
};

const mockReq = { user: { userId: 'user-1' } };

describe('ApplicationsController', () => {
  let controller: ApplicationsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [{ provide: ApplicationsService, useValue: mockApplicationsService }],
    }).compile();
    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('apply() should call service with userId and jobId', async () => {
    mockApplicationsService.apply.mockResolvedValue({ id: 'app-1', status: 'PENDING' });
    const result = await controller.apply(mockReq, 'job-1');
    expect(mockApplicationsService.apply).toHaveBeenCalledWith('user-1', 'job-1');
    expect(result.status).toBe('PENDING');
  });

  it('getMyApplications() should return user applications', async () => {
    mockApplicationsService.getMyApplications.mockResolvedValue([{ id: 'app-1' }]);
    const result = await controller.getMyApplications(mockReq);
    expect(result).toHaveLength(1);
  });

  it('getJobApplications() should return applications for a job', async () => {
    mockApplicationsService.getJobApplications.mockResolvedValue([{ id: 'app-1' }]);
    const result = await controller.getJobApplications('job-1');
    expect(mockApplicationsService.getJobApplications).toHaveBeenCalledWith('job-1');
  });

  it('updateStatus() should update application status', async () => {
    mockApplicationsService.updateStatus.mockResolvedValue({ id: 'app-1', status: 'ACCEPTED' });
    const result = await controller.updateStatus('app-1', 'ACCEPTED');
    expect(mockApplicationsService.updateStatus).toHaveBeenCalledWith('app-1', 'ACCEPTED');
    expect(result.status).toBe('ACCEPTED');
  });
});
