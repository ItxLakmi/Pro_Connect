import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: string, jobId: string) {
    const existing = await this.prisma.application.findFirst({ where: { userId, jobId } });
    if (existing) throw new BadRequestException('You have already applied for this job');

    return this.prisma.application.create({
      data: { userId, jobId, status: 'PENDING' },
      include: { job: { include: { company: true } } },
    });
  }

  async getMyApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJobApplications(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            profile: {
              include: {
                experience: { orderBy: { startDate: 'desc' }, take: 3 },
                education: { orderBy: { startDate: 'desc' }, take: 2 },
                skills: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(applicationId: string, status: string) {
    // status: PENDING | SHORTLISTED | INTERVIEW | REJECTED
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
  }
}
