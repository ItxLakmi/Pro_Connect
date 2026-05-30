import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { CreateInvestorProfileDto } from './dto/create-investor-profile.dto';
import { ConnectRequestDto } from './dto/connect-request.dto';

@Injectable()
export class InvestorService {
  constructor(private prisma: PrismaService) {}

  // ─── Startup Profiles ─────────────────────────────────────────────────────

  async upsertStartup(userId: string, dto: CreateStartupDto) {
    return this.prisma.startupProfile.upsert({
      where: { userId },
      update: { ...dto },
      create: { userId, ...dto },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  async getStartups(industry?: string, stage?: string) {
    return this.prisma.startupProfile.findMany({
      where: {
        ...(industry ? { industry } : {}),
        ...(stage ? { fundingStage: stage } : {}),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { connections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStartupById(id: string) {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
        _count: { select: { connections: true } },
      },
    });
    if (!startup) throw new NotFoundException('Startup not found');
    return startup;
  }

  async getMyStartup(userId: string) {
    return this.prisma.startupProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  // ─── Investor Profiles ────────────────────────────────────────────────────

  async upsertInvestorProfile(userId: string, dto: CreateInvestorProfileDto) {
    return this.prisma.investorProfile.upsert({
      where: { userId },
      update: { ...dto },
      create: { userId, ...dto },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  async getInvestors() {
    return this.prisma.investorProfile.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyInvestorProfile(userId: string) {
    return this.prisma.investorProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  // ─── Connections ──────────────────────────────────────────────────────────

  async sendConnection(fromUserId: string, dto: ConnectRequestDto) {
    return this.prisma.investorConnection.create({
      data: {
        fromUserId,
        toUserId: dto.toUserId,
        startupId: dto.startupId,
        message: dto.message,
      },
      include: {
        startup: true,
        toUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getMyConnections(userId: string) {
    return this.prisma.investorConnection.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        startup: true,
        fromUser: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        toUser: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateConnectionStatus(id: string, status: string) {
    const connection = await this.prisma.investorConnection.update({
      where: { id },
      data: { status },
    });

    if (status === 'ACCEPTED') {
      const participantIds = [connection.fromUserId, connection.toUserId];
      
      const existingConvo = await this.prisma.conversation.findFirst({
        where: {
          AND: participantIds.map((pid) => ({
            participants: { some: { id: pid } },
          })),
        },
      });

      if (!existingConvo) {
        await this.prisma.conversation.create({
          data: {
            participants: {
              connect: participantIds.map((pid) => ({ id: pid })),
            },
          },
        });
      }
    }

    return connection;
  }

  // ─── Matching ─────────────────────────────────────────────────────────────

  async getInvestorMatches(userId: string) {
    const investor = await this.prisma.investorProfile.findUnique({
      where: { userId },
    });
    
    if (!investor) throw new NotFoundException('Investor profile not found');

    const focusAreas = Array.isArray(investor.investmentFocus) 
      ? investor.investmentFocus.map((f: any) => String(f).toLowerCase()) 
      : [];

    const startups = await this.prisma.startupProfile.findMany({
      where: {
        amountSeeking: {
          gte: investor.minTicket,
          lte: investor.maxTicket,
        },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    const scoredStartups = startups.map(startup => {
      let score = 0;
      if (focusAreas.includes(startup.industry.toLowerCase())) {
        score += 50; 
      }
      return { ...startup, matchScore: score };
    });

    return scoredStartups.filter(s => s.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
  }
}
