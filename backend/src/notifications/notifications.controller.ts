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
}
