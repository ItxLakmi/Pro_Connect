import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('apply/:jobId')
  async apply(@Req() req: any, @Param('jobId') jobId: string) {
    return this.applicationsService.apply(req.user.userId, jobId);
  }

  @Get('me')
  async getMyApplications(@Req() req: any) {
    return this.applicationsService.getMyApplications(req.user.userId);
  }

  @Get('job/:jobId')
  async getJobApplications(@Param('jobId') jobId: string) {
    // Note: In a real app, check if user is the recruiter of this job
    return this.applicationsService.getJobApplications(jobId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.applicationsService.updateStatus(id, status);
  }
}
