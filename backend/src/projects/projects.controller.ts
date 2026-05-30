import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createProjectDto: any, @Request() req: any) {
    return this.projectsService.create({
      ...createProjectDto,
      postedById: req.user.userId,
    });
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post(':id/bids')
  @UseGuards(JwtAuthGuard)
  createBid(
    @Param('id') id: string,
    @Body() createBidDto: any,
    @Request() req: any,
  ) {
    return this.projectsService.createBid({
      ...createBidDto,
      projectId: id,
      freelancerId: req.user.userId,
    });
  }

  @Post(':id/milestones')
  @UseGuards(JwtAuthGuard)
  createMilestone(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.createMilestone({
      ...body,
      projectId: id,
    });
  }

  @Get(':id/milestones')
  getMilestones(@Param('id') id: string) {
    return this.projectsService.getMilestones(id);
  }

  @Patch('milestones/:milestoneId/status')
  @UseGuards(JwtAuthGuard)
  updateMilestoneStatus(@Param('milestoneId') milestoneId: string, @Body() body: { status: string }) {
    return this.projectsService.updateMilestoneStatus(milestoneId, body.status);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.projectsService.createReview({
      ...body,
      projectId: id,
      reviewerId: req.user.userId,
    });
  }

  @Get(':id/reviews')
  getProjectReviews(@Param('id') id: string) {
    return this.projectsService.getProjectReviews(id);
  }
}
