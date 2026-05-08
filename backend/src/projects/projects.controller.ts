import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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
}
