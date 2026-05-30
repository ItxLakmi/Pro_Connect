import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('match-freelancers/:projectId')
  async matchFreelancers(@Param('projectId') projectId: string) {
    return this.aiService.matchFreelancersForProject(projectId);
  }

  @Get('recommend-projects')
  async recommendProjects(@Request() req: any) {
    // req.user contains the decoded JWT token (assuming it has the user id)
    return this.aiService.recommendProjectsForFreelancer(req.user.userId || req.user.id);
  }

  @Get('skill-gap')
  async getSkillGap(@Request() req: any, @Query('targetRole') targetRole: string) {
    return this.aiService.analyzeSkillGap(req.user.userId || req.user.id, targetRole || 'Software Engineer');
  }

  @Get('career-path')
  async getCareerPath(@Request() req: any) {
    return this.aiService.suggestCareerPath(req.user.userId || req.user.id);
  }

  @Get('salary-prediction')
  async getSalaryPrediction(@Request() req: any) {
    return this.aiService.predictSalary(req.user.userId || req.user.id);
  }

  @Get('profile-improvements')
  async getProfileImprovements(@Request() req: any) {
    return this.aiService.suggestProfileImprovements(req.user.userId || req.user.id);
  }
}
