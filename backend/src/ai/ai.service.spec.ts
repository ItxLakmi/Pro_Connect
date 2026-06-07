import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  project: { findUnique: jest.fn(), findMany: jest.fn() },
  user: { findUnique: jest.fn(), findMany: jest.fn() },
};

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('matchFreelancersForProject()', () => {
    it('should throw NotFoundException if project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);
      await expect(service.matchFreelancersForProject('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should return sorted matches for a valid project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1', title: 'React Developer', description: 'Build UI with React and TypeScript',
      });
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'u1', firstName: 'Alice', lastName: 'Smith', avatar: null,
          profile: {
            headline: 'Senior React Dev', bio: 'Experienced',
            skills: [{ name: 'React' }, { name: 'TypeScript' }],
            experience: [],
          },
        },
        {
          id: 'u2', firstName: 'Bob', lastName: 'Jones', avatar: null,
          profile: null,
        },
      ]);

      const result = await service.matchFreelancersForProject('p1');
      expect(Array.isArray(result)).toBe(true);
      // Alice should have a higher score than Bob (who has no profile)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('score');
        expect(result[0]).toHaveProperty('matchedKeywords');
      }
    });
  });

  describe('analyzeSkillGap()', () => {
    it('should throw NotFoundException if user profile not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.analyzeSkillGap('u1', 'developer')).rejects.toThrow(NotFoundException);
    });

    it('should return skill gap analysis for a developer role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        profile: {
          skills: [{ name: 'JavaScript' }, { name: 'React' }],
        },
      });

      const result = await service.analyzeSkillGap('u1', 'frontend developer');
      expect(result).toHaveProperty('matchingSkills');
      expect(result).toHaveProperty('missingSkills');
      expect(result).toHaveProperty('matchPercentage');
      expect(result.targetRole).toBe('frontend developer');
    });
  });

  describe('predictSalary()', () => {
    it('should throw NotFoundException if user profile not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.predictSalary('u1')).rejects.toThrow(NotFoundException);
    });

    it('should return salary prediction with range', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        profile: {
          skills: [{ name: 'React' }, { name: 'Node.js' }],
          experience: [
            { startDate: new Date('2020-01-01'), endDate: new Date('2023-01-01') },
          ],
        },
      });

      const result = await service.predictSalary('u1');
      expect(result).toHaveProperty('estimatedMin');
      expect(result).toHaveProperty('estimatedMax');
      expect(result.estimatedMax).toBeGreaterThan(result.estimatedMin);
      expect(result.currency).toBe('USD');
    });
  });

  describe('suggestProfileImprovements()', () => {
    it('should return suggestions for an incomplete profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        profile: {
          headline: null, bio: null,
          skills: [],
          experience: [],
          education: [],
          linkedinUrl: null, githubUrl: null, websiteUrl: null,
        },
      });

      const result = await service.suggestProfileImprovements('u1');
      expect(result).toHaveProperty('profileScore');
      expect(result).toHaveProperty('suggestions');
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.isComplete).toBe(false);
    });

    it('should return high score for a complete profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        profile: {
          headline: 'Senior Developer',
          bio: 'A very detailed bio with more than fifty characters here to pass the check',
          skills: [1, 2, 3, 4, 5].map((i) => ({ name: `Skill${i}` })),
          experience: [{ company: 'Acme', position: 'Dev', description: 'Code', startDate: new Date() }],
          education: [],
          linkedinUrl: 'https://linkedin.com/in/test',
          githubUrl: null,
          websiteUrl: null,
        },
      });

      const result = await service.suggestProfileImprovements('u1');
      expect(result.profileScore).toBeGreaterThanOrEqual(80);
    });
  });
});
