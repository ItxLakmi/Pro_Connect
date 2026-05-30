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

  @Post('posts/:id/unlike')
  @UseGuards(JwtAuthGuard)
  unlikePost(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.unlikePost(req.user.userId, id);
  }

  // --- Comments ---
  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.networkingService.addComment(req.user.userId, id, content);
  }

  @Get('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  getComments(@Param('id') id: string) {
    return this.networkingService.getComments(id);
  }

  @Delete('posts/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  deleteComment(@Param('commentId') commentId: string, @Request() req: any) {
    return this.networkingService.deleteComment(commentId, req.user.userId);
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
