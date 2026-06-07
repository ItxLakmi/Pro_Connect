import {
  Controller, Get, Post, Delete, Patch,
  Param, Query, Body, Request, UseGuards,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommunityDto } from './dto/create-community.dto';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ── Communities ────────────────────────────────────────────────────────────
  @Get('my-groups')
  findMyGroups(@Request() req: any) {
    return this.communityService.getUserCommunities(req.user.userId);
  }

  @Get()
  findAll(@Query('type') type?: string, @Query('search') search?: string) {
    return this.communityService.findAll(type, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.communityService.findOne(id, req.user?.userId);
  }

  @Post()
  create(@Body() dto: CreateCommunityDto, @Request() req: any) {
    return this.communityService.create(req.user.userId, dto);
  }

  @Delete(':id')
  deleteCommunity(@Param('id') id: string, @Request() req: any) {
    return this.communityService.deleteCommunity(id, req.user.userId);
  }

  // ── Membership ─────────────────────────────────────────────────────────────
  @Post(':id/join')
  join(@Param('id') id: string, @Request() req: any) {
    return this.communityService.join(id, req.user.userId);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @Request() req: any) {
    return this.communityService.leave(id, req.user.userId);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.communityService.getMembers(id);
  }

  @Patch(':id/members/:userId/role')
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @Request() req: any,
  ) {
    return this.communityService.updateMemberRole(id, userId, role, req.user.userId);
  }

  // ── Posts ──────────────────────────────────────────────────────────────────
  @Get(':id/posts')
  getPosts(@Param('id') id: string) {
    return this.communityService.getPosts(id);
  }

  @Post(':id/posts')
  createPost(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.communityService.createPost(id, req.user.userId, content);
  }

  @Delete('posts/:postId')
  removePost(@Param('postId') postId: string, @Request() req: any) {
    return this.communityService.removePost(postId, req.user.userId);
  }

  // ── Likes ──────────────────────────────────────────────────────────────────
  @Post('posts/:postId/like')
  likePost(@Param('postId') postId: string, @Request() req: any) {
    return this.communityService.likePost(postId, req.user.userId);
  }

  // ── Comments ───────────────────────────────────────────────────────────────
  @Get('posts/:postId/comments')
  getComments(@Param('postId') postId: string) {
    return this.communityService.getComments(postId);
  }

  @Post('posts/:postId/comments')
  addComment(
    @Param('postId') postId: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.communityService.addComment(postId, req.user.userId, content);
  }

  @Delete('comments/:commentId')
  removeComment(@Param('commentId') commentId: string, @Request() req: any) {
    return this.communityService.removeComment(commentId, req.user.userId);
  }
}
