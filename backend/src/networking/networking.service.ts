import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NetworkingService {
  constructor(private prisma: PrismaService) {}

  // ─── Follow System ────────────────────────────────────────────────────────

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');
    
    const follow = await this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    });

    await this.createNotification({
      userId: followingId,
      type: 'FOLLOW',
      title: 'New Follower',
      content: `Someone started following you!`,
    });

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string) {
    try {
      return await this.prisma.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });
    } catch {
      return { message: 'Not following' };
    }
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

  // ─── Connection System ────────────────────────────────────────────────────

  async sendConnectionRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new BadRequestException('Cannot connect with yourself');

    // Check if already connected
    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });
    if (existing) throw new ConflictException('Already connected');

    // Check if request already exists
    const existingRequest = await this.prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        status: 'PENDING',
      },
    });
    if (existingRequest) throw new ConflictException('Connection request already pending');

    const request = await this.prisma.connectionRequest.upsert({
      where: { senderId_receiverId: { senderId, receiverId } },
      create: { senderId, receiverId, status: 'PENDING' },
      update: { status: 'PENDING' },
    });

    await this.createNotification({
      userId: receiverId,
      type: 'CONNECTION_REQUEST',
      title: 'Connection Request',
      content: 'Someone sent you a connection request!',
    });

    return request;
  }

  async acceptConnectionRequest(requestId: string, userId: string) {
    const request = await this.prisma.connectionRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.receiverId !== userId) throw new BadRequestException('Not authorized');

    // Update request status
    await this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    // Create the bidirectional connection record
    const connection = await this.prisma.connection.upsert({
      where: {
        user1Id_user2Id: {
          user1Id: request.senderId < request.receiverId ? request.senderId : request.receiverId,
          user2Id: request.senderId < request.receiverId ? request.receiverId : request.senderId,
        },
      },
      create: {
        user1Id: request.senderId < request.receiverId ? request.senderId : request.receiverId,
        user2Id: request.senderId < request.receiverId ? request.receiverId : request.senderId,
      },
      update: {},
    });

    await this.createNotification({
      userId: request.senderId,
      type: 'CONNECTION_ACCEPTED',
      title: 'Connection Accepted',
      content: 'Your connection request was accepted!',
    });

    return connection;
  }

  async rejectConnectionRequest(requestId: string, userId: string) {
    const request = await this.prisma.connectionRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.receiverId !== userId) throw new BadRequestException('Not authorized');

    return this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  async removeConnection(userId: string, targetUserId: string) {
    const connection = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId },
        ],
      },
    });
    if (!connection) throw new NotFoundException('Connection not found');
    return this.prisma.connection.delete({ where: { id: connection.id } });
  }

  async getConnections(userId: string) {
    const connections = await this.prisma.connection.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true, location: true } } } },
        user2: { select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true, location: true } } } },
      },
    });

    return connections.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      user: c.user1Id === userId ? c.user2 : c.user1,
    }));
  }

  async getConnectionRequests(userId: string) {
    const [incoming, outgoing] = await Promise.all([
      this.prisma.connectionRequest.findMany({
        where: { receiverId: userId, status: 'PENDING' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true, location: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.connectionRequest.findMany({
        where: { senderId: userId, status: 'PENDING' },
        include: {
          receiver: { select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true, location: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { incoming, outgoing };
  }

  async getConnectionStatus(userId: string, targetUserId: string) {
    const connected = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId },
        ],
      },
    });
    if (connected) return { status: 'CONNECTED', connectionId: connected.id };

    const sentRequest = await this.prisma.connectionRequest.findFirst({
      where: { senderId: userId, receiverId: targetUserId, status: 'PENDING' },
    });
    if (sentRequest) return { status: 'PENDING_SENT', requestId: sentRequest.id };

    const receivedRequest = await this.prisma.connectionRequest.findFirst({
      where: { senderId: targetUserId, receiverId: userId, status: 'PENDING' },
    });
    if (receivedRequest) return { status: 'PENDING_RECEIVED', requestId: receivedRequest.id };

    return { status: 'NONE' };
  }

  async getFollowStatus(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { following: !!follow };
  }

  // ─── Feed System ──────────────────────────────────────────────────────────

  async createPost(authorId: string, content: string) {
    return this.prisma.post.create({
      data: { authorId, content },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true } } },
        },
        _count: { select: { likes: true, comments: true } },
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

    // Get IDs of connections
    const connections = await this.prisma.connection.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      select: { user1Id: true, user2Id: true },
    });
    const connectionIds = connections.map((c) => (c.user1Id === userId ? c.user2Id : c.user1Id));

    // Combine: own posts + followed + connected (deduplicated)
    const authorIds = Array.from(new Set([userId, ...followingIds, ...connectionIds]));

    // Fetch Regular Posts
    const rawPosts = await this.prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      include: {
        author: {
          select: {
            id: true, firstName: true, lastName: true, avatar: true,
            profile: { select: { headline: true } },
          },
        },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const mappedPosts = rawPosts.map(post => {
      let feedType = 'USER_POST';
      if (post.authorId !== userId) {
        if (connectionIds.includes(post.authorId)) feedType = 'CONNECTION_POST';
        else if (followingIds.includes(post.authorId)) feedType = 'FOLLOWING_POST';
      }
      return { ...post, feedType };
    });

    // Fetch Job Posts
    const rawJobs = await this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        company: true,
        postedBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true } } },
        },
      },
    });
    const mappedJobs = rawJobs.map(job => ({
      ...job,
      feedType: 'JOB_POST',
      author: job.postedBy,
    }));

    // Fetch Group Posts (Communities user is part of)
    const myCommunities = await this.prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });
    const communityIds = myCommunities.map(c => c.communityId);
    
    let mappedGroupPosts: any[] = [];
    if (communityIds.length > 0) {
      const rawGroupPosts = await this.prisma.communityPost.findMany({
        where: { communityId: { in: communityIds }, isRemoved: false },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true } } } },
          community: { select: { id: true, name: true, coverImage: true } },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId }, select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      mappedGroupPosts = rawGroupPosts.map(gp => ({
        ...gp,
        feedType: 'GROUP_POST',
      }));
    }

    // Merge and Sort
    const unifiedFeed = [...mappedPosts, ...mappedJobs, ...mappedGroupPosts];
    unifiedFeed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return unifiedFeed;
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

  // ─── Comments ─────────────────────────────────────────────────────────────

  async addComment(userId: string, postId: string, content: string) {
    return this.prisma.comment.create({
      data: { authorId: userId, postId, content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true } } } },
      },
    });
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true, profile: { select: { headline: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new BadRequestException('Not authorized');
    return this.prisma.comment.delete({ where: { id: commentId } });
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  async createNotification(data: { userId: string; type: string; title: string; content: string; link?: string }) {
    return this.prisma.notification.create({ data });
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  async markNotificationAsRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  // ─── Network Stats ────────────────────────────────────────────────────────

  async getNetworkStats(userId: string) {
    const [connectionsCount, followingCount, followersCount] = await Promise.all([
      this.prisma.connection.count({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
      this.prisma.follow.count({ where: { followingId: userId } }),
    ]);
    return { connectionsCount, followingCount, followersCount };
  }

  // ─── People You May Know ──────────────────────────────────────────────────

  async getPeopleYouMayKnow(userId: string) {
    // Get current connections
    const connections = await this.prisma.connection.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      select: { user1Id: true, user2Id: true },
    });
    const connectedIds = connections.map((c) => (c.user1Id === userId ? c.user2Id : c.user1Id));
    connectedIds.push(userId);

    // Get pending requests
    const pending = await this.prisma.connectionRequest.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }], status: 'PENDING' },
      select: { senderId: true, receiverId: true },
    });
    const pendingIds = pending.flatMap((r) => [r.senderId, r.receiverId]);
    const excludeIds = Array.from(new Set([...connectedIds, ...pendingIds]));

    return this.prisma.user.findMany({
      where: { id: { notIn: excludeIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        profile: { select: { headline: true, location: true } },
      },
      take: 10,
    });
  }
}
