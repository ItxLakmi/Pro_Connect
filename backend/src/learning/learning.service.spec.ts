import { Test, TestingModule } from '@nestjs/testing';
import { LearningService } from './learning.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  course: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  courseModule: { create: jest.fn() },
  enrollment: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  moduleProgress: { upsert: jest.fn(), count: jest.fn() },
  learningPath: { findMany: jest.fn(), findUnique: jest.fn() },
  skillTest: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  skillTestAttempt: { create: jest.fn(), findMany: jest.fn() },
  skillBadge: { upsert: jest.fn(), findMany: jest.fn() },
};

describe('LearningService', () => {
  let service: LearningService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<LearningService>(LearningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCourses()', () => {
    it('should return list of courses', async () => {
      const courses = [{ id: 'c1', title: 'React Basics' }];
      mockPrisma.course.findMany.mockResolvedValue(courses);
      const result = await service.getCourses();
      expect(result).toEqual(courses);
    });
  });

  describe('getCourseById()', () => {
    it('should return a course by id', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1', title: 'React' });
      const result = await service.getCourseById('c1');
      expect(result.id).toBe('c1');
    });

    it('should return null if not found', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      const result = await service.getCourseById('bad-id');
      expect(result).toBeNull();
    });
  });

  describe('enrollInCourse()', () => {
    it('should create an enrollment', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1', instructorId: 'instructor-1' });
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue({ id: 'e1', userId: 'u1', courseId: 'c1' });
      const result = await service.enrollInCourse('u1', 'c1');
      expect(result.id).toBe('e1');
      expect(mockPrisma.enrollment.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      await expect(service.enrollInCourse('u1', 'c1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is the instructor', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1', instructorId: 'u1' });
      await expect(service.enrollInCourse('u1', 'c1')).rejects.toThrow(
        expect.objectContaining({ message: 'Instructors cannot enroll in their own courses.' })
      );
    });

    it('should throw ConflictException if user is already enrolled', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1', instructorId: 'instructor-1' });
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
      await expect(service.enrollInCourse('u1', 'c1')).rejects.toThrow(
        expect.objectContaining({ message: 'You are already enrolled in this course.' })
      );
    });
  });

  describe('getMyEnrollments()', () => {
    it('should return enrollments for a user', async () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([{ id: 'e1' }]);
      const result = await service.getMyEnrollments('u1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } }),
      );
    });
  });

  describe('getCourseEnrollment()', () => {
    it('should return a user enrollment for a specific course', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', userId: 'u1', courseId: 'c1' });
      const result = await service.getCourseEnrollment('u1', 'c1');
      expect(result).toBeDefined();
      expect(result.id).toBe('e1');
    });
  });

  describe('getSkillTests()', () => {
    it('should return all skill tests', async () => {
      mockPrisma.skillTest.findMany.mockResolvedValue([{ id: 'st1', title: 'JS Test' }]);
      const result = await service.getSkillTests();
      expect(result).toHaveLength(1);
    });
  });

  describe('getSkillTestById()', () => {
    it('should return a skill test', async () => {
      mockPrisma.skillTest.findUnique.mockResolvedValue({ id: 'st1', title: 'JS Test', questions: [] });
      const result = await service.getSkillTestById('st1');
      expect(result.id).toBe('st1');
    });

    it('should throw NotFoundException for non-existent test', async () => {
      mockPrisma.skillTest.findUnique.mockResolvedValue(null);
      await expect(service.getSkillTestById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLearningPaths()', () => {
    it('should return all learning paths', async () => {
      mockPrisma.learningPath.findMany.mockResolvedValue([{ id: 'lp1', title: 'Frontend Path' }]);
      const result = await service.getLearningPaths();
      expect(result).toHaveLength(1);
    });
  });

  describe('getLearningPathById()', () => {
    it('should throw NotFoundException for non-existent path', async () => {
      mockPrisma.learningPath.findUnique.mockResolvedValue(null);
      await expect(service.getLearningPathById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMyBadges()', () => {
    it('should return badges for a user', async () => {
      mockPrisma.skillBadge.findMany.mockResolvedValue([{ id: 'b1' }]);
      const result = await service.getMyBadges('u1');
      expect(result).toHaveLength(1);
    });
  });
});
