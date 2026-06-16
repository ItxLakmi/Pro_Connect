import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
        avatar: true,
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

  async createUser(data: { firstName: string; lastName: string; email: string; password: string; role: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
        isEmailVerified: true,
      },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true, avatar: true },
    });
  }

  // Profile Moderation
  async getProfiles() {
    return this.prisma.profile.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
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

  async createJob(data: { title: string; description: string; location: string; type: string; postedById: string }) {
    return this.prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        type: data.type,
        postedById: data.postedById,
        status: 'APPROVED',
      },
      include: {
        company: true,
        postedBy: { select: { firstName: true, lastName: true } },
      },
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

  async createCourse(data: { title: string; description: string; price: number; level: string; instructorId: string }) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        level: data.level,
        instructorId: data.instructorId,
        status: 'APPROVED',
      },
      include: {
        instructor: { select: { firstName: true, lastName: true } },
      },
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

  async createAdvertisement(data: { title: string; description?: string; imageUrl: string; targetUrl: string; startDate?: string; endDate?: string }) {
    return this.prisma.advertisement.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    });
  }

  async toggleAdvertisement(id: string, active: boolean) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { active }
    });
  }

  // ── Subscription Plans ────────────────────────────────────────────────────

  async getSubscriptionPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async createSubscriptionPlan(data: {
    name: string;
    price: number;
    billingCycle: string;
    features: string[];
  }) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name.toUpperCase().replace(/\s+/g, '_'),
        price: data.price,
        billingCycle: data.billingCycle,
        features: data.features,
      },
    });
  }

  async toggleSubscriptionPlan(id: string, active: boolean) {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { active },
    });
  }

  async updateSubscriptionPlan(
    id: string,
    data: {
      name: string;
      price: number;
      billingCycle: string;
      features: string[];
    }
  ) {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: data.name.toUpperCase().replace(/\s+/g, '_'),
        price: data.price,
        billingCycle: data.billingCycle,
        features: data.features,
      },
    });
  }

  // ── User Subscriptions ────────────────────────────────────────────────────

  async getAllUserSubscriptions() {
    return this.prisma.userSubscription.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserSubscription(id: string, data: { status?: string; endDate?: string }) {
    return this.prisma.userSubscription.update({
      where: { id },
      data: {
        status: data.status,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        plan: true,
      },
    });
  }

  async deleteUserSubscription(id: string) {
    return this.prisma.userSubscription.delete({
      where: { id },
    });
  }
}
