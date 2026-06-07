import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards,
  Req
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createJobDto: any) {
    return this.jobsService.create({
      ...createJobDto,
      postedBy: { connect: { id: req.user.userId } },
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyJobs(@Req() req: any) {
    return this.jobsService.getMyJobs(req.user.userId);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  findSavedJobs(@Req() req: any) {
    return this.jobsService.getSavedJobs(req.user.userId);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  toggleSaveJob(@Req() req: any, @Param('id') id: string) {
    return this.jobsService.toggleSaveJob(req.user.userId, id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  closeJob(@Req() req: any, @Param('id') id: string) {
    return this.jobsService.closeJob(id, req.user.userId);
  }

  @Patch(':id/reopen')
  @UseGuards(JwtAuthGuard)
  reopenJob(@Req() req: any, @Param('id') id: string) {
    return this.jobsService.reopenJob(id, req.user.userId);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('type') type?: string,
    @Query('salary') salary?: string,
  ) {
    const where: Prisma.JobWhereInput = { status: { not: 'CLOSED' } };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (type) where.type = type;
    if (salary) where.salaryRange = { contains: salary, mode: 'insensitive' };

    return this.jobsService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() updateJobDto: Prisma.JobUpdateInput) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
