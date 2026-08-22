import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AIModule } from './ai/ai.module';
import { BusinessModule } from './business/business.module';
import { ProductsModule } from './products/products.module';
import { PostsModule } from './posts/posts.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { TelegramModule } from './telegram/telegram.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ExportsModule } from './exports/exports.module';
import { AdminModule } from './admin/admin.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { AIGenerationModule } from './ai-generation/ai-generation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: (() => {
        if (process.env.REDIS_URL) {
          const url = new URL(process.env.REDIS_URL);
          return { host: url.hostname, port: parseInt(url.port || '6379'), password: url.password || undefined };
        }
        return { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') };
      })(),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AIModule,
    BusinessModule,
    ProductsModule,
    PostsModule,
    SchedulerModule,
    TelegramModule,
    AnalyticsModule,
    MediaModule,
    NotificationsModule,
    ExportsModule,
    AdminModule,
    WebsocketsModule,
    AIGenerationModule,
  ],
})
export class AppModule {}