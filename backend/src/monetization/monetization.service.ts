import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class MonetizationService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

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

    const subscription = await this.prisma.userSubscription.upsert({
      where: {
        userId_planId: {
          userId,
          planId,
        },
      },
      update: {
        status: 'ACTIVE',
        endDate,
        startDate: new Date(),
      },
      create: {
        userId,
        planId,
        endDate,
        status: 'ACTIVE',
      },
    });

    // Fetch user details for email/notification
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const planName = plan.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      // 1. In-app notification
      await this.notificationsService.createNotification({
        userId,
        type: 'SUBSCRIPTION_SUCCESS',
        title: 'Subscription Activated',
        content: `Your ${planName} subscription has been successfully activated. Enjoy your premium features!`,
        link: '/premium',
      });

      // 2. Email notification
      if (user.email) {
        await this.emailService.sendMail(
          user.email,
          'Subscription Activated - Pro Connect',
          `Hello ${user.firstName},\n\nYour ${planName} subscription has been successfully activated. Enjoy your premium features!`,
          `<h3>Subscription Activated</h3><p>Hello ${user.firstName},</p><p>Your <strong>${planName}</strong> subscription has been successfully activated. Enjoy your premium features!</p>`
        );
      }
    }

    return subscription;
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.userSubscription.findMany({
      where: { userId },
      include: { plan: true },
    });
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub || sub.userId !== userId) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELED' },
    });
  }

  // --- PayHere Hash Generation ---

  generatePayHereHash(orderId: string, amount: number, currency: string) {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_SECRET;

    if (!merchantId || !merchantSecret) {
      throw new InternalServerErrorException('PayHere credentials not configured in backend .env');
    }

    const amountFormatted = parseFloat(amount.toString()).toFixed(2);
    
    // md5(merchant_id + order_id + amountFormated + currency + strtoupper(md5(merchant_secret)))
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashData = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
    const hash = crypto.createHash('md5').update(hashData).digest('hex').toUpperCase();

    return {
      hash,
      merchantId,
      amountFormatted,
    };
  }

  // --- PayHere Webhook (Server-Side Fulfillment) ---

  async processPayHereWebhook(payload: any) {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_SECRET;

    if (!merchantId || !merchantSecret) {
      console.error('PayHere webhook failed: missing environment variables');
      return false;
    }

    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1, // We will pass userId here
      custom_2, // We will pass planId here
    } = payload;

    // Verify md5sig
    // md5sig = strtoupper (md5 ( merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(payhere_secret)) ) )
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashData = `${merchantId}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
    const generatedHash = crypto.createHash('md5').update(hashData).digest('hex').toUpperCase();

    if (generatedHash !== md5sig) {
      console.error('PayHere webhook signature mismatch', { order_id });
      return false;
    }

    // status_code: 2 = success
    if (parseInt(status_code) === 2 && custom_1 && custom_2) {
      await this.subscribeUser(custom_1, custom_2);
      console.log(`Successfully activated subscription for user ${custom_1}`);
      return true;
    }

    return false;
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
