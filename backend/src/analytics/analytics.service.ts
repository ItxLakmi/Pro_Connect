import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // --- Core KPIs ---
    const [
      totalUsers,
      totalJobs,
      totalProjects,
      totalCourses,
      totalEnrollments,
      totalApplications,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.job.count(),
      this.prisma.project.count(),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.application.count(),
      this.prisma.userSubscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    // --- User Growth: last 30 days, grouped by day ---
    const newUsersRaw = await this.prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build a day-by-day map
    const growthMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      growthMap[key] = 0;
    }
    for (const u of newUsersRaw) {
      const key = u.createdAt.toISOString().substring(0, 10);
      if (growthMap[key] !== undefined) growthMap[key]++;
    }
    const userGrowth = Object.entries(growthMap).map(([date, count]) => ({
      date,
      users: count,
    }));

    // --- User Role Distribution ---
    const roleGroups = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });
    const roleDistribution = roleGroups.map((g) => ({
      role: g.role,
      count: g._count.role,
    }));

    // --- Job Status Breakdown ---
    const jobStatuses = await this.prisma.job.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const jobBreakdown = jobStatuses.map((j) => ({
      status: j.status,
      count: j._count.status,
    }));

    // --- Application Status Breakdown ---
    const appStatuses = await this.prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const applicationBreakdown = appStatuses.map((a) => ({
      status: a.status,
      count: a._count.status,
    }));

    // --- Revenue: platform fees on completed projects ---
    const completedProjects = await this.prisma.project.findMany({
      where: { status: 'COMPLETED' },
      select: { platformFee: true, budget: true },
    });
    const totalRevenue = completedProjects.reduce((sum, p) => {
      return sum + (p.platformFee ?? (p.budget ?? 0) * 0.075);
    }, 0);

    // --- Skill Test Pass Rate ---
    const [passedAttempts, totalAttempts] = await Promise.all([
      this.prisma.skillTestAttempt.count({ where: { passed: true } }),
      this.prisma.skillTestAttempt.count(),
    ]);
    const skillPassRate =
      totalAttempts > 0
        ? Math.round((passedAttempts / totalAttempts) * 100)
        : 0;

    // --- Course Enrollment Breakdown by Level ---
    const coursesByLevel = await this.prisma.course.groupBy({
      by: ['level'],
      _count: { level: true },
    });
    const courseLevelBreakdown = coursesByLevel.map((c) => ({
      level: c.level,
      count: c._count.level,
    }));

    return {
      kpis: {
        totalUsers,
        totalJobs,
        totalProjects,
        totalCourses,
        totalEnrollments,
        totalApplications,
        activeSubscriptions,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        skillPassRate,
      },
      userGrowth,
      roleDistribution,
      jobBreakdown,
      applicationBreakdown,
      courseLevelBreakdown,
    };
  }
}
