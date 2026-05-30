import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NetworkingService {
  constructor(private prisma: PrismaService) {}

  // --- Follow System ---

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new Error('Cannot follow yourself');
    
    const follow = await this.prisma.follow.create({
      data: { followerId, followingId },
    });

    // Create notification
    await this.createNotification({
      userId: followingId,
      type: 'FOLLOW',
      title: 'New Follower',
      content: `Someone started following you!`,
    });

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string) {
    return this.prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  // --- Feed System ---

  async createPost(authorId: string, content: string) {
    return this.prisma.post.create({
      data: { authorId, content },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async getFeed(userId: string) {
    // Get IDs of users being followed
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    
    // Include the user's own posts in the feed
    followingIds.push(userId);

    return this.prisma.post.findMany({
      where: {
        authorId: { in: followingIds },
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async likePost(userId: string, postId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) {
      await this.prisma.like.delete({ where: { postId_userId: { postId, userId } } });
      return { liked: false };
    }
    await this.prisma.like.create({ data: { userId, postId } });
    return { liked: true };
  }

  async unlikePost(userId: string, postId: string) {
    return this.prisma.like.deleteMany({ where: { userId, postId } });
  }

  // --- Comments ---

  async addComment(userId: string, postId: string, content: string) {
    const comment = await this.prisma.comment.create({
      data: { authorId: userId, postId, content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
    return comment;
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== userId) throw new Error('Not authorised');
    return this.prisma.comment.delete({ where: { id: commentId } });
  }


  // --- Notifications ---

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    content: string;
    link?: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  async markNotificationAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
