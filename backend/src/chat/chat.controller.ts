import { Controller, Get, Param, UseGuards, Request, Body, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.userId);
  }

  @Get('messages/:conversationId')
  getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @Post('start')
  startConversation(
    @Request() req: any, 
    @Body() body: { participantId: string, projectId?: string }
  ) {
    return this.chatService.findOrCreateConversation(
      [req.user.userId, body.participantId], 
      body.projectId
    );
  }
}
