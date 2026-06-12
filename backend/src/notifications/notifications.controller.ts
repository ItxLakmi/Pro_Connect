import { Controller, Get, Post, Patch, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req) {
    try {
      if (!req.user?.userId) {
        throw new BadRequestException('User ID not found in token');
      }
      return await this.notificationsService.getUserNotifications(req.user.userId);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    try {
      const count = await this.notificationsService.getUnreadCount(req.user.userId);
      return { count };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // IMPORTANT: 'read-all' must come BEFORE ':id/read' to avoid route conflict
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    try {
      await this.notificationsService.markAllAsRead(req.user.userId);
      return { success: true };
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    try {
      await this.notificationsService.markAsRead(id, req.user.userId);
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  @Post('test')
  async createTestNotification(@Request() req) {
    try {
      const testNotifications = [
        {
          userId: req.user.userId,
          type: 'FOLLOW',
          title: 'New Follower',
          content: 'John Doe started following you',
          link: '/profile/john-doe',
        },
        {
          userId: req.user.userId,
          type: 'BID_RECEIVED',
          title: 'New Bid on Your Project',
          content: 'A freelancer placed a bid on your project - "Web Development"',
          link: '/projects/123',
        },
        {
          userId: req.user.userId,
          type: 'COMMENT',
          title: 'New Comment',
          content: 'Someone commented on your post',
          link: '/posts/456',
        },
        {
          userId: req.user.userId,
          type: 'MESSAGE',
          title: 'New Message',
          content: 'You have a new message from Sarah Smith',
          link: '/messages',
        },
        {
          userId: req.user.userId,
          type: 'LIKE',
          title: 'Post Liked',
          content: 'Your post received a like',
          link: '/feed',
        },
        {
          userId: req.user.userId,
          type: 'CONNECTION_REQUEST',
          title: 'Connection Request',
          content: 'Kasun Perera sent you a connection request',
          link: '/network',
        },
      ];

      const created = [];
      for (const notification of testNotifications) {
        const result = await this.notificationsService.createNotification(notification);
        created.push(result);
      }

      console.log(`Created ${created.length} test notifications for user ${req.user.userId}`);
      return { success: true, created: created.length, notifications: created };
    } catch (error) {
      console.error('Error creating test notifications:', error);
      throw error;
    }
  }
}
