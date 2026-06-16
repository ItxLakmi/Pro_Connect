import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  async createMessage(data: {
    content: string;
    senderId: string;
    conversationId: string;
  }) {
    const message = await this.prisma.message.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        conversation: {
          include: {
            participants: true,
          }
        }
      },
    });

    // Notify other participants
    const otherParticipants = message.conversation.participants.filter(p => p.id !== data.senderId);
    for (const participant of otherParticipants) {
      await this.notificationsService.createNotification({
        userId: participant.id,
        type: 'MESSAGE',
        title: `New message from ${message.sender.firstName}`,
        content: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
        link: `/messages`,
      });

      // Send email
      if (participant.email) {
        await this.emailService.sendNewMessageNotification(
          participant.email, 
          `${message.sender.firstName} ${message.sender.lastName}`, 
          data.content
        );
      }
    }

    return message;
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOrCreateConversation(participantIds: string[], projectId?: string) {
    // Basic implementation: find a conversation where both participants exist
    let whereClause: any = {
      AND: participantIds.map((id) => ({
        participants: { some: { id } },
      })),
    };
    
    if (projectId) {
      whereClause.projectId = projectId;
    }

    const includeOptions = {
      participants: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' as const },
      },
    };

    const conversation = await this.prisma.conversation.findFirst({
      where: whereClause,
      include: includeOptions,
    });

    if (conversation) return conversation;

    return this.prisma.conversation.create({
      data: {
        projectId,
        participants: {
          connect: participantIds.map((id) => ({ id })),
        },
      },
      include: includeOptions,
    });
  }
}
