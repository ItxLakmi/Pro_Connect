import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: string, jobId: string) {
    // Check if already applied
    const existing = await this.prisma.application.findFirst({
      where: {
        userId,
        jobId,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already applied for this job');
    }

    // Create application
    return this.prisma.application.create({
      data: {
        userId,
        jobId,
        status: 'PENDING',
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });
  }

  async getMyApplications(userId: string) {
    return this.prisma.application.findMany({
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
  }

  async getJobApplications(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          include: {
            profile: {
              include: {
                experience: true,
                skills: true,
              },
            },
          },
        },
      },
    });
  }

  async updateStatus(applicationId: string, status: string) {
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
  }
}
