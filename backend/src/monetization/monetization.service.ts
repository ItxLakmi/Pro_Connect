import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonetizationService {
  constructor(private prisma: PrismaService) {}

  // --- Subscriptions ---

  async getSubscriptionPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { active: true },
    });
  }

  async subscribeUser(userId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Default to 30 days for monthly
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (plan.billingCycle === 'YEARLY' ? 365 : 30));

    return this.prisma.userSubscription.create({
      data: {
        userId,
        planId,
        endDate,
      },
    });
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.userSubscription.findMany({
      where: { userId },
      include: { plan: true },
    });
  }

  // --- Profile Boosting ---

  async boostProfile(profileId: string, days: number = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.profile.update({
      where: { id: profileId },
      data: {
        isBoosted: true,
        boostedUntil: endDate,
      },
    });
  }

  // --- Job Posting Fees ---

  async payJobFee(jobId: string, promote: boolean = false) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        feePaid: true,
        isPromoted: promote,
      },
    });
  }
}
