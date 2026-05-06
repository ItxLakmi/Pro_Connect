import { Controller, Get, Post, Put, Body, UseGuards, Req } from '@nestjs/common';
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

  @Put('me')
  async updateMyProfile(@Req() req: any, @Body() updateData: any) {
    return this.profilesService.update(req.user.userId, updateData);
  }

  @Post('experience')
  async addExperience(@Req() req: any, @Body() experienceData: any) {
    return this.profilesService.addExperience(req.user.userId, experienceData);
  }

  @Post('education')
  async addEducation(@Req() req: any, @Body() educationData: any) {
    return this.profilesService.addEducation(req.user.userId, educationData);
  }
}
