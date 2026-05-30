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
  @Post('profile/:id/boost')
  boostProfile(@Param('id') profileId: string, @Body('days') days: number) {
    return this.monetizationService.boostProfile(profileId, days);
  }

  @UseGuards(JwtAuthGuard)
  @Post('job/:id/pay')
  payJobFee(@Param('id') jobId: string, @Body('promote') promote: boolean) {
    return this.monetizationService.payJobFee(jobId, promote);
  }
}
