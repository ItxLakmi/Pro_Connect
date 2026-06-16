import { Controller, Get, Post, Put, Patch, Delete, Body, UseGuards, Req, Param, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  async getMyProfile(@Req() req: any) {
    return this.profilesService.findByUserId(req.user.userId);
  }

  @Get('search')
  async searchUsers(@Req() req: any, @Query('q') q: string) {
    return this.profilesService.searchUsers(q, req.user.userId);
  }

  @Get(':userId')
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Put('me')
  async updateMyProfile(@Req() req: any, @Body() updateData: any) {
    return this.profilesService.update(req.user.userId, updateData);
  }

  @Patch('company')
  async updateCompanyProfile(@Req() req: any, @Body() companyData: any) {
    return this.profilesService.updateCompany(req.user.userId, companyData);
  }

  @Post('experience')
  async addExperience(@Req() req: any, @Body() experienceData: any) {
    return this.profilesService.addExperience(req.user.userId, experienceData);
  }

  @Post('education')
  async addEducation(@Req() req: any, @Body() educationData: any) {
    return this.profilesService.addEducation(req.user.userId, educationData);
  }

  // ─── Profile Skills ──────────────────────────────────────────────────────

  @Post('skills')
  async addProfileSkill(
    @Req() req: any,
    @Body() body: { skillName: string; percentage: number },
  ) {
    return this.profilesService.addProfileSkill(req.user.userId, body.skillName, body.percentage ?? 50);
  }

  @Put('skills/:skillId')
  async updateProfileSkill(
    @Req() req: any,
    @Param('skillId') skillId: string,
    @Body() body: { percentage: number },
  ) {
    return this.profilesService.updateProfileSkill(req.user.userId, skillId, body.percentage);
  }

  @Delete('skills/:skillId')
  async removeProfileSkill(@Req() req: any, @Param('skillId') skillId: string) {
    return this.profilesService.removeProfileSkill(req.user.userId, skillId);
  }

  @Post('skills/:skillId/endorse')
  async endorseSkill(@Req() req: any, @Param('skillId') skillId: string) {
    return this.profilesService.endorseSkill(req.user.userId, skillId);
  }

  @Delete('skills/:skillId/endorse')
  async unendorseSkill(@Req() req: any, @Param('skillId') skillId: string) {
    return this.profilesService.unendorseSkill(req.user.userId, skillId);
  }

  // ─── Portfolio ───────────────────────────────────────────────────────────

  @Post('portfolio')
  async addProject(@Req() req: any, @Body() data: any) {
    return this.profilesService.addProject(req.user.userId, data);
  }

  @Put('portfolio/:id')
  async updateProject(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.profilesService.updateProject(req.user.userId, id, data);
  }

  @Delete('portfolio/:id')
  async deleteProject(@Req() req: any, @Param('id') id: string) {
    return this.profilesService.deleteProject(req.user.userId, id);
  }
}
