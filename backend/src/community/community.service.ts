import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  // ─── Slug helper ──────────────────────────────────────────────────────────
  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') + '-' + Date.now();
  }

  // ─── List communities ─────────────────────────────────────────────────────
  async findAll(type?: string, search?: string) {
    return this.prisma.community.findMany({
      where: {
        ...(type ? { type: type as any } : {}),
        ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { category: { contains: search, mode: 'insensitive' } }] } : {}),
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { members: true, posts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Get single community ─────────────────────────────────────────────────
  async findOne(id: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { members: true, posts: true } },
        members: userId
          ? { where: { userId }, select: { role: true, joinedAt: true } }
          : false,
      },
    });
    if (!community) throw new NotFoundException('Community not found');
    return community;
  }

  // ─── Create community ─────────────────────────────────────────────────────
  async create(creatorId: string, dto: CreateCommunityDto) {
    const slug = this.toSlug(dto.name);
    const community = await this.prisma.community.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        type: dto.type as any,
        category: dto.category,
        coverImage: dto.coverImage,
        isPrivate: dto.isPrivate ?? false,
        creatorId,
      },
    });
    // Creator is automatically ADMIN
    await this.prisma.communityMember.create({
      data: { communityId: community.id, userId: creatorId, role: 'ADMIN' },
    });
    return community;
  }

  // ─── Join / Leave ─────────────────────────────────────────────────────────
  async join(communityId: string, userId: string) {
    const existing = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (existing) throw new ConflictException('Already a member');
    return this.prisma.communityMember.create({
      data: { communityId, userId, role: 'MEMBER' },
    });
  }

  async leave(communityId: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!member) throw new NotFoundException('Not a member');
    if (member.role === 'ADMIN') throw new ForbiddenException('Creator cannot leave');
    return this.prisma.communityMember.delete({
      where: { communityId_userId: { communityId, userId } },
    });
  }

  // ─── Members ──────────────────────────────────────────────────────────────
  async getMembers(communityId: string) {
    return this.prisma.communityMember.findMany({
      where: { communityId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async updateMemberRole(communityId: string, targetUserId: string, role: string, requesterId: string) {
    const requester = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId: requesterId } },
    });
    if (!requester || (requester.role !== 'ADMIN' && requester.role !== 'MODERATOR')) {
      throw new ForbiddenException('Only moderators/admins can change roles');
    }
    return this.prisma.communityMember.update({
      where: { communityId_userId: { communityId, userId: targetUserId } },
      data: { role: role as any },
    });
  }

  // ─── Community Posts ──────────────────────────────────────────────────────
  async getPosts(communityId: string) {
    return this.prisma.communityPost.findMany({
      where: { communityId, isRemoved: false },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createPost(communityId: string, authorId: string, content: string) {
    // Must be a member
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId: authorId } },
    });
    if (!member) throw new ForbiddenException('Join the community to post');
    return this.prisma.communityPost.create({
      data: { communityId, authorId, content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async removePost(postId: string, requesterId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: post.communityId, userId: requesterId } },
    });
    if (!member || (member.role === 'MEMBER' && post.authorId !== requesterId)) {
      throw new ForbiddenException('Not authorised to remove this post');
    }
    return this.prisma.communityPost.update({ where: { id: postId }, data: { isRemoved: true } });
  }

  // ─── Community Post Likes ─────────────────────────────────────────────────
  async likePost(postId: string, userId: string) {
    const existing = await this.prisma.communityPostLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) {
      await this.prisma.communityPostLike.delete({ where: { postId_userId: { postId, userId } } });
      return { liked: false };
    }
    await this.prisma.communityPostLike.create({ data: { postId, userId } });
    return { liked: true };
  }

  // ─── Community Comments ───────────────────────────────────────────────────
  async getComments(postId: string) {
    return this.prisma.communityComment.findMany({
      where: { postId, isRemoved: false },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(postId: string, authorId: string, content: string) {
    return this.prisma.communityComment.create({
      data: { postId, authorId, content },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  async removeComment(commentId: string, requesterId: string) {
    const comment = await this.prisma.communityComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    const post = await this.prisma.communityPost.findUnique({ where: { id: comment.postId } });
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: post!.communityId, userId: requesterId } },
    });
    if (!member || (member.role === 'MEMBER' && comment.authorId !== requesterId)) {
      throw new ForbiddenException('Not authorised to remove this comment');
    }
    return this.prisma.communityComment.update({ where: { id: commentId }, data: { isRemoved: true } });
  }
}
