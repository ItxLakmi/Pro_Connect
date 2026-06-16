import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { NetworkingService } from './networking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('networking')
@UseGuards(JwtAuthGuard)
export class NetworkingController {
  constructor(private readonly networkingService: NetworkingService) {}

  // ─── Follow ───────────────────────────────────────────────────────────────

  @Post('follow/:id')
  follow(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.followUser(req.user.userId, id);
  }

  @Delete('unfollow/:id')
  unfollow(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.unfollowUser(req.user.userId, id);
  }

  @Get('follow-status/:id')
  getFollowStatus(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.getFollowStatus(req.user.userId, id);
  }

  // ─── Connections ──────────────────────────────────────────────────────────

  @Post('connections/request/:userId')
  sendConnectionRequest(@Param('userId') userId: string, @Request() req: any) {
    return this.networkingService.sendConnectionRequest(req.user.userId, userId);
  }

  @Post('connections/accept/:requestId')
  acceptConnectionRequest(@Param('requestId') requestId: string, @Request() req: any) {
    return this.networkingService.acceptConnectionRequest(requestId, req.user.userId);
  }

  @Post('connections/reject/:requestId')
  rejectConnectionRequest(@Param('requestId') requestId: string, @Request() req: any) {
    return this.networkingService.rejectConnectionRequest(requestId, req.user.userId);
  }

  @Delete('connections/:userId')
  removeConnection(@Param('userId') userId: string, @Request() req: any) {
    return this.networkingService.removeConnection(req.user.userId, userId);
  }

  @Get('connections')
  getConnections(@Request() req: any) {
    return this.networkingService.getConnections(req.user.userId);
  }

  @Get('connections/requests')
  getConnectionRequests(@Request() req: any) {
    return this.networkingService.getConnectionRequests(req.user.userId);
  }

  @Get('connections/status/:userId')
  getConnectionStatus(@Param('userId') userId: string, @Request() req: any) {
    return this.networkingService.getConnectionStatus(req.user.userId, userId);
  }

  @Get('network-stats')
  getNetworkStats(@Request() req: any) {
    return this.networkingService.getNetworkStats(req.user.userId);
  }

  @Get('people-you-may-know')
  getPeopleYouMayKnow(@Request() req: any) {
    return this.networkingService.getPeopleYouMayKnow(req.user.userId);
  }

  // ─── Feed ─────────────────────────────────────────────────────────────────

  @Post('posts')
  createPost(@Body('content') content: string, @Request() req: any) {
    return this.networkingService.createPost(req.user.userId, content);
  }

  @Get('feed')
  getFeed(@Request() req: any) {
    return this.networkingService.getFeed(req.user.userId);
  }

  @Post('posts/:id/like')
  likePost(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.likePost(req.user.userId, id);
  }

  @Post('posts/:id/unlike')
  unlikePost(@Param('id') id: string, @Request() req: any) {
    return this.networkingService.unlikePost(req.user.userId, id);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @Post('posts/:id/comments')
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.networkingService.addComment(req.user.userId, id, content);
  }

  @Get('posts/:id/comments')
  getComments(@Param('id') id: string) {
    return this.networkingService.getComments(id);
  }

  @Delete('posts/comments/:commentId')
  deleteComment(@Param('commentId') commentId: string, @Request() req: any) {
    return this.networkingService.deleteComment(commentId, req.user.userId);
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  @Get('notifications')
  getNotifications(@Request() req: any) {
    return this.networkingService.getNotifications(req.user.userId);
  }

  @Post('notifications/:id/read')
  markAsRead(@Param('id') id: string) {
    return this.networkingService.markNotificationAsRead(id);
  }
}
