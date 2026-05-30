import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a match score for all freelancers against a specific project
   */
  async matchFreelancersForProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 1. Extract keywords from project (title & description)
    const projectKeywords = this.extractKeywords(`${project.title} ${project.description}`);

    // 2. Get all active freelancers with their profiles
    const freelancers = await this.prisma.user.findMany({
      where: { role: 'FREELANCER' },
      include: {
        profile: {
          include: {
            skills: true,
            experience: true,
          }
        }
      }
    });

    // 3. Calculate scores
    const matches = freelancers.map(freelancer => {
      let score = 0;
      let matchedKeywords: string[] = [];

      if (freelancer.profile) {
        // Check Skills
        freelancer.profile.skills.forEach(skill => {
          if (projectKeywords.includes(skill.name.toLowerCase())) {
            score += 10;
            matchedKeywords.push(skill.name);
          }
        });

        // Check Experience
        freelancer.profile.experience.forEach(exp => {
          const expKeywords = this.extractKeywords(`${exp.company} ${exp.position} ${exp.description || ''}`);
          projectKeywords.forEach(pk => {
            if (expKeywords.includes(pk)) {
              score += 2; // Experience matches carry some weight
              if (!matchedKeywords.includes(pk)) matchedKeywords.push(pk);
            }
          });
        });
        
        // Add a small baseline score if they have a completed profile
        if (freelancer.profile.bio && freelancer.profile.headline) {
          score += 5;
        }
      }

      // Calculate percentage match (arbitrary max score of 50 for this basic MVP logic)
      const matchPercentage = Math.min(Math.round((score / 50) * 100), 100);

      return {
        freelancerId: freelancer.id,
        firstName: freelancer.firstName,
        lastName: freelancer.lastName,
        avatar: freelancer.avatar,
        headline: freelancer.profile?.headline,
        score: matchPercentage,
        matchedKeywords: Array.from(new Set(matchedKeywords))
      };
    });

    // Sort by highest score first
    return matches.sort((a, b) => b.score - a.score).filter(m => m.score > 0);
  }

  /**
   * Recommends projects for a specific freelancer
   */
  async recommendProjectsForFreelancer(freelancerId: string) {
    const freelancer = await this.prisma.user.findUnique({
      where: { id: freelancerId, role: 'FREELANCER' },
      include: {
        profile: {
          include: {
            skills: true,
            experience: true
          }
        }
      }
    });

    if (!freelancer) {
      throw new NotFoundException('Freelancer not found or user is not a freelancer');
    }

    // Extract freelancer keywords
    const skills = freelancer.profile?.skills.map(s => s.name.toLowerCase()) || [];
    let expKeywords: string[] = [];
    freelancer.profile?.experience.forEach(exp => {
      expKeywords.push(...this.extractKeywords(`${exp.position} ${exp.description || ''}`));
    });

    const freelancerKeywords = Array.from(new Set([...skills, ...expKeywords]));

    // Get OPEN projects
    const projects = await this.prisma.project.findMany({
      where: { status: 'OPEN' },
      include: {
        postedBy: {
          select: { firstName: true, lastName: true, avatar: true }
        },
        _count: {
          select: { bids: true }
        }
      }
    });

    // Calculate match score
    const matches = projects.map(project => {
      const projectKeywords = this.extractKeywords(`${project.title} ${project.description}`);
      let score = 0;
      let matchedKeywords: string[] = [];

      freelancerKeywords.forEach(fk => {
        if (projectKeywords.includes(fk)) {
          score += 5; // Good match
          matchedKeywords.push(fk);
        }
      });

      const matchPercentage = Math.min(Math.round((score / 30) * 100), 100);

      return {
        ...project,
        matchScore: matchPercentage,
        matchedKeywords
      };
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore).filter(m => m.matchScore > 0);
  }

  /**
   * Analyzes skill gap between a user's profile and a target role
   */
  async analyzeSkillGap(userId: string, targetRole: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: { skills: true }
        }
      }
    });

    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }

    const userSkills = user.profile.skills.map(s => s.name.toLowerCase());
    
    const roleKeywords = this.extractKeywords(targetRole);
    let expectedSkills: string[] = [];

    if (roleKeywords.includes('developer') || roleKeywords.includes('engineer')) {
      expectedSkills = ['javascript', 'typescript', 'react', 'node.js', 'git', 'sql', 'api'];
    } else if (roleKeywords.includes('designer')) {
      expectedSkills = ['figma', 'ui/ux', 'adobe', 'wireframing', 'prototyping', 'css'];
    } else if (roleKeywords.includes('manager')) {
      expectedSkills = ['agile', 'scrum', 'leadership', 'jira', 'communication', 'strategy'];
    } else {
      expectedSkills = ['communication', 'problem solving', 'teamwork', 'project management'];
    }

    const missingSkills = expectedSkills.filter(skill => !userSkills.includes(skill));
    const matchingSkills = expectedSkills.filter(skill => userSkills.includes(skill));

    return {
      targetRole,
      matchingSkills,
      missingSkills,
      matchPercentage: Math.round((matchingSkills.length / expectedSkills.length) * 100) || 0
    };
  }

  /**
   * Suggests career path based on user's current experience
   */
  async suggestCareerPath(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: { experience: true, skills: true }
        }
      }
    });

    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }

    const exp = user.profile.experience.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];
    const currentTitle = exp ? exp.position.toLowerCase() : 'junior professional';
    
    let nextSteps = [];

    if (currentTitle.includes('junior')) {
      nextSteps = [
        { role: currentTitle.replace('junior', 'mid-level').trim(), timeframe: '1-2 years' },
        { role: currentTitle.replace('junior', 'senior').trim(), timeframe: '3-5 years' }
      ];
    } else if (currentTitle.includes('senior')) {
      nextSteps = [
        { role: 'Lead ' + currentTitle.replace('senior', '').trim(), timeframe: '1-3 years' },
        { role: 'Engineering/Product Manager', timeframe: '2-4 years' }
      ];
    } else {
      nextSteps = [
        { role: 'Senior ' + currentTitle, timeframe: '2-3 years' },
        { role: 'Lead ' + currentTitle, timeframe: '4-5 years' }
      ];
    }

    return {
      currentRole: exp ? exp.position : 'Entry Level',
      suggestedPaths: nextSteps,
      recommendedActions: [
        'Take advanced certification courses',
        'Contribute to open source projects',
        'Network with senior professionals in your field'
      ]
    };
  }

  /**
   * Predicts salary range based on profile
   */
  async predictSalary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: { experience: true, skills: true }
        }
      }
    });

    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }

    let baseSalary = 50000;
    
    const yearsOfExp = user.profile.experience.reduce((total, exp) => {
      const start = new Date(exp.startDate).getTime();
      const end = exp.endDate ? new Date(exp.endDate).getTime() : new Date().getTime();
      return total + (end - start) / (1000 * 60 * 60 * 24 * 365.25);
    }, 0);

    baseSalary += yearsOfExp * 5000;
    baseSalary += user.profile.skills.length * 1000;

    const minSalary = Math.round(baseSalary * 0.9 / 1000) * 1000;
    const maxSalary = Math.round(baseSalary * 1.2 / 1000) * 1000;

    return {
      estimatedMin: minSalary,
      estimatedMax: maxSalary,
      currency: 'USD',
      factors: {
        yearsOfExperience: Math.round(yearsOfExp * 10) / 10,
        skillCount: user.profile.skills.length,
        industryDemand: 'High'
      }
    };
  }

  /**
   * Suggests profile improvements to boost visibility
   */
  async suggestProfileImprovements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: { skills: true, experience: true, education: true }
        }
      }
    });

    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }

    const suggestions = [];
    let score = 100;
    const p = user.profile;

    if (!p.headline) {
      suggestions.push({ type: 'CRITICAL', message: 'Add a professional headline to stand out to recruiters.' });
      score -= 15;
    }
    
    if (!p.bio || p.bio.length < 50) {
      suggestions.push({ type: 'HIGH', message: 'Expand your bio. Profiles with detailed summaries get 3x more views.' });
      score -= 10;
    }

    if (p.skills.length < 5) {
      suggestions.push({ type: 'MEDIUM', message: 'Add more skills. Aim for at least 5-10 core skills relevant to your industry.' });
      score -= 10;
    }

    if (p.experience.length === 0) {
      suggestions.push({ type: 'HIGH', message: 'Add your work experience. This is the most viewed section by recruiters.' });
      score -= 20;
    }

    if (!p.linkedinUrl && !p.githubUrl && !p.websiteUrl) {
      suggestions.push({ type: 'LOW', message: 'Link your external portfolios (LinkedIn, GitHub, or Personal Website) to build trust.' });
      score -= 5;
    }

    return {
      profileScore: Math.max(0, score),
      suggestions,
      isComplete: score >= 90
    };
  }

  /**
   * Helper function to extract lowercase keywords from text, ignoring common stop words
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];
    
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'for', 'with', 'to', 'in', 'on', 'of', 'at', 'by'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }
}
