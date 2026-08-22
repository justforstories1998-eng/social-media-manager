import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../prisma/prisma.module';
import { AIGenerationModule } from '../ai-generation/ai-generation.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'ai-generation',
    }),
    AIGenerationModule,
  ],
  providers: [AIService],
  controllers: [AIController],
  exports: [AIService],
})
export class AIModule {}