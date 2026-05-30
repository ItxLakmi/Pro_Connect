import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Job } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.JobCreateInput): Promise<Job> {
    return this.prisma.job.create({
      data,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.JobWhereUniqueInput;
    where?: Prisma.JobWhereInput;
    orderBy?: Prisma.JobOrderByWithRelationInput;
  }): Promise<Job[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.job.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        company: true,
        postedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Job | null> {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        postedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        applications: true,
      },
    });
  }

  async update(id: string, data: Prisma.JobUpdateInput): Promise<Job> {
    return this.prisma.job.update({
      data,
      where: { id },
    });
  }

  async remove(id: string): Promise<Job> {
    return this.prisma.job.delete({
      where: { id },
    });
  }

  async getMyJobs(userId: string): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: { postedById: userId },
      include: {
        company: true,
        applications: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleSaveJob(userId: string, jobId: string) {
    const existing = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (existing) {
      await this.prisma.savedJob.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      await this.prisma.savedJob.create({
        data: {
          userId,
          jobId,
        },
      });
      return { saved: true };
    }
  }

  async getSavedJobs(userId: string) {
    const savedJobs = await this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return savedJobs.map(sj => sj.job);
  }
}
