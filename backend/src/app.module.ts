import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ApplicationsModule } from './applications/applications.module';
import { ProjectsModule } from './projects/projects.module';

import { ChatModule } from './chat/chat.module';
import { NetworkingModule } from './networking/networking.module';
import { AiModule } from './ai/ai.module';
import { LearningModule } from './learning/learning.module';
import { CommunityModule } from './community/community.module';
import { InvestorModule } from './investor/investor.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { MonetizationModule } from './monetization/monetization.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 60000 }),
    PrismaModule,
    AuthModule,
    UsersModule,
    JobsModule,
    ProfilesModule,
    ApplicationsModule,
    ProjectsModule,
    ChatModule,
    NetworkingModule,
    AiModule,
    LearningModule,
    InvestorModule,
    CommunityModule,
    EmailModule,
    NotificationsModule,
    AdminModule,
    MonetizationModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
