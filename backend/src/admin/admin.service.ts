import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // User Management
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true }
    });
  }

  // Profile Moderation
  async getProfiles() {
    return this.prisma.profile.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      }
    });
  }

  // Approvals
  async getJobs() {
    return this.prisma.job.findMany({
      include: {
        company: true,
        postedBy: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async updateJobStatus(jobId: string, status: string) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status }
    });
  }

  async getCourses() {
    return this.prisma.course.findMany({
      include: {
        instructor: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async updateCourseStatus(courseId: string, status: string) {
    return this.prisma.course.update({
      where: { id: courseId },
      data: { status }
    });
  }

  // Payment Monitoring & Reporting
  async getReports() {
    const totalUsers = await this.prisma.user.count();
    const totalJobs = await this.prisma.job.count();
    const totalCourses = await this.prisma.course.count();
    
    // Sum of all platform fees from completed projects
    const projectsWithFees = await this.prisma.project.findMany({
      where: { platformFee: { gt: 0 } },
      select: { platformFee: true }
    });
    const totalRevenue = projectsWithFees.reduce((acc, curr) => acc + (curr.platformFee || 0), 0);

    return {
      totalUsers,
      totalJobs,
      totalCourses,
      totalRevenue
    };
  }

  // Advertisements
  async getAdvertisements() {
    return this.prisma.advertisement.findMany();
  }

  async createAdvertisement(data: { title: string; imageUrl: string; targetUrl: string }) {
    return this.prisma.advertisement.create({ data });
  }

  async toggleAdvertisement(id: string, active: boolean) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { active }
    });
  }
}
