import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { NetworkingService } from './networking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('networking')
export class NetworkingController {
  constructor(private readonly networkingService: NetworkingService) {}

  // --- Follow ---
  @Post('follow/:id')
  @UseGuards(JwtAuthGuard)
  follow(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.followUser(req.user.userId, id);
  }

  @Delete('unfollow/:id')
  @UseGuards(JwtAuthGuard)
  unfollow(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.unfollowUser(req.user.userId, id);
  }

  // --- Feed ---
  @Post('posts')
  @UseGuards(JwtAuthGuard)
  createPost(@Body('content') content: string, @Request() req: any) {
    return this.networkingService.createPost(req.user.userId, content);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  getFeed(@Request() req: any) {
    return this.networkingService.getFeed(req.user.userId);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  likePost(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.likePost(req.user.userId, id);
  }

  // --- Notifications ---
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  getNotifications(@Request() req: any) {
    return this.networkingService.getNotifications(req.user.userId);
  }

  @Post('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string) {
    return this.networkingService.markNotificationAsRead(id);
  }
}
