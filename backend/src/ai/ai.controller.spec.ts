import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

const mockAiService = {
  matchFreelancersForProject: jest.fn(),
  recommendProjectsForFreelancer: jest.fn(),
  analyzeSkillGap: jest.fn(),
  suggestCareerPath: jest.fn(),
  predictSalary: jest.fn(),
  suggestProfileImprovements: jest.fn(),
};

const mockReq = { user: { userId: 'user-1', id: 'user-1' } };

describe('AiController', () => {
  let controller: AiController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: mockAiService }],
    }).compile();
    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('matchFreelancers() should call service with projectId', async () => {
    mockAiService.matchFreelancersForProject.mockResolvedValue([]);
    await controller.matchFreelancers('proj-1');
    expect(mockAiService.matchFreelancersForProject).toHaveBeenCalledWith('proj-1');
  });

  it('recommendProjects() should call service with user id', async () => {
    mockAiService.recommendProjectsForFreelancer.mockResolvedValue([]);
    await controller.recommendProjects(mockReq);
    expect(mockAiService.recommendProjectsForFreelancer).toHaveBeenCalledWith('user-1');
  });

  it('getSkillGap() should call service with userId and targetRole', async () => {
    mockAiService.analyzeSkillGap.mockResolvedValue({ matchPercentage: 80 });
    await controller.getSkillGap(mockReq, 'developer');
    expect(mockAiService.analyzeSkillGap).toHaveBeenCalledWith('user-1', 'developer');
  });

  it('getSalaryPrediction() should call predictSalary', async () => {
    mockAiService.predictSalary.mockResolvedValue({ estimatedMin: 80000, estimatedMax: 100000 });
    const result = await controller.getSalaryPrediction(mockReq);
    expect(result).toHaveProperty('estimatedMin');
  });

  it('getProfileImprovements() should return suggestions', async () => {
    mockAiService.suggestProfileImprovements.mockResolvedValue({ profileScore: 70, suggestions: [] });
    const result = await controller.getProfileImprovements(mockReq);
    expect(result).toHaveProperty('profileScore');
  });
});
