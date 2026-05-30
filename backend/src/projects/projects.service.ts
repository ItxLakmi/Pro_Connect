import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    budget?: number;
    postedById: string;
  }) {
    return this.prisma.project.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        postedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        bids: {
          include: {
            freelancer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async createBid(data: {
    projectId: string;
    freelancerId: string;
    amount: number;
    proposal: string;
  }) {
    return this.prisma.bid.create({
      data,
    });
  }

  async findBidsByProject(projectId: string) {
    return this.prisma.bid.findMany({
      where: { projectId },
      include: {
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  // --- Phase 3.6 Milestone & Payment Logic ---

  async createMilestone(data: {
    projectId: string;
    title: string;
    description?: string;
    amount: number;
    dueDate?: Date;
  }) {
    return this.prisma.milestone.create({
      data,
    });
  }

  async getMilestones(projectId: string) {
    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateMilestoneStatus(id: string, status: string) {
    const milestone = await this.prisma.milestone.update({
      where: { id },
      data: { status },
      include: { project: true },
    });

    if (status === 'PAID') {
      const commission = milestone.amount * 0.10; // 10% fee
      await this.prisma.project.update({
        where: { id: milestone.projectId },
        data: {
          platformFee: { increment: commission },
        },
      });
    }

    return milestone;
  }

  // --- Phase 3.6 Review System Logic ---

  async createReview(data: {
    projectId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
  }) {
    return this.prisma.review.create({
      data,
    });
  }

  async getProjectReviews(projectId: string) {
    return this.prisma.review.findMany({
      where: { projectId },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        reviewee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }
}
