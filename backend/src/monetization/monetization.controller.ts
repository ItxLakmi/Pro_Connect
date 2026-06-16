import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { MonetizationService } from './monetization.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('monetization')
export class MonetizationController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Get('plans')
  getSubscriptionPlans() {
    return this.monetizationService.getSubscriptionPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  subscribe(@Req() req: any, @Body('planId') planId: string) {
    return this.monetizationService.subscribeUser(req.user.userId, planId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions')
  getMySubscriptions(@Req() req: any) {
    return this.monetizationService.getUserSubscriptions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscriptions/:id/cancel')
  cancelSubscription(@Req() req: any, @Param('id') id: string) {
    return this.monetizationService.cancelSubscription(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payhere-hash')
  getPayHereHash(@Body() body: { orderId: string; amount: number; currency: string }) {
    return this.monetizationService.generatePayHereHash(body.orderId, body.amount, body.currency);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/:id/boost')
  boostProfile(@Param('id') profileId: string, @Body('days') days: number) {
    return this.monetizationService.boostProfile(profileId, days);
  }

  @UseGuards(JwtAuthGuard)
  @Post('job/:id/pay')
  payJobFee(@Param('id') jobId: string, @Body('promote') promote: boolean) {
    return this.monetizationService.payJobFee(jobId, promote);
  }

  // PayHere Webhook (Public endpoint, no JwtAuthGuard)
  @Post('notify')
  async handlePayHereWebhook(@Body() payload: any) {
    const success = await this.monetizationService.processPayHereWebhook(payload);
    return { success };
  }
}
