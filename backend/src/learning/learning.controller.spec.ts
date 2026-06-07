import { Test, TestingModule } from '@nestjs/testing';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

const mockLearningService = {
  createCourse: jest.fn(),
  getCourses: jest.fn(),
  getCourseById: jest.fn(),
  createCourseModule: jest.fn(),
  enrollInCourse: jest.fn(),
  getMyEnrollments: jest.fn(),
  markModuleComplete: jest.fn(),
  getLearningPaths: jest.fn(),
  getLearningPathById: jest.fn(),
  createSkillTest: jest.fn(),
  getSkillTests: jest.fn(),
  getSkillTestById: jest.fn(),
  submitAttempt: jest.fn(),
  getMyBadges: jest.fn(),
  getMyAttempts: jest.fn(),
  getCourseEnrollment: jest.fn(),
};

const mockReq = { user: { userId: 'user-1' } };

describe('LearningController', () => {
  let controller: LearningController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningController],
      providers: [{ provide: LearningService, useValue: mockLearningService }],
    }).compile();
    controller = module.get<LearningController>(LearningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getCourses() should return course list', async () => {
    mockLearningService.getCourses.mockResolvedValue([{ id: 'c1' }]);
    const result = await controller.getCourses();
    expect(result).toHaveLength(1);
  });

  it('getCourseById() should return single course', async () => {
    mockLearningService.getCourseById.mockResolvedValue({ id: 'c1', title: 'React' });
    const result = await controller.getCourseById('c1');
    expect(result.id).toBe('c1');
  });

  it('enrollInCourse() should call service with userId and courseId', async () => {
    mockLearningService.enrollInCourse.mockResolvedValue({ id: 'e1' });
    await controller.enrollInCourse(mockReq, { courseId: 'c1' } as any);
    expect(mockLearningService.enrollInCourse).toHaveBeenCalledWith('user-1', 'c1');
  });

  it('getMyEnrollments() should return enrollments', async () => {
    mockLearningService.getMyEnrollments.mockResolvedValue([{ id: 'e1' }]);
    const result = await controller.getMyEnrollments(mockReq);
    expect(result).toHaveLength(1);
  });

  it('getCourseEnrollment() should return enrollment for a specific course', async () => {
    mockLearningService.getCourseEnrollment.mockResolvedValue({ id: 'e1' });
    const result = await controller.getCourseEnrollment(mockReq, 'c1');
    expect(mockLearningService.getCourseEnrollment).toHaveBeenCalledWith('user-1', 'c1');
    expect(result.id).toBe('e1');
  });

  it('getSkillTests() should return skill tests', async () => {
    mockLearningService.getSkillTests.mockResolvedValue([{ id: 'st1' }]);
    const result = await controller.getSkillTests();
    expect(result).toHaveLength(1);
  });

  it('getSkillTestById() should return a skill test', async () => {
    mockLearningService.getSkillTestById.mockResolvedValue({ id: 'st1' });
    const result = await controller.getSkillTestById('st1');
    expect(result.id).toBe('st1');
  });

  it('getLearningPaths() should return learning paths', async () => {
    mockLearningService.getLearningPaths.mockResolvedValue([{ id: 'lp1' }]);
    const result = await controller.getLearningPaths();
    expect(result).toHaveLength(1);
  });

  it('getMyBadges() should return user badges', async () => {
    mockLearningService.getMyBadges.mockResolvedValue([{ id: 'b1' }]);
    const result = await controller.getMyBadges(mockReq);
    expect(mockLearningService.getMyBadges).toHaveBeenCalledWith('user-1');
    expect(result).toHaveLength(1);
  });

  it('getUserBadges() should return badges for a specific user', async () => {
    mockLearningService.getMyBadges.mockResolvedValue([{ id: 'b1' }]);
    const result = await controller.getUserBadges('user-2');
    expect(mockLearningService.getMyBadges).toHaveBeenCalledWith('user-2');
    expect(result).toHaveLength(1);
  });
});
