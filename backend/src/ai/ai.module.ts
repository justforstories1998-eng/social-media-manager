import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../prisma/prisma.module';
import { AIGenerationModule } from '../ai-generation/ai-generation.module';
import { ProviderRegistry } from './providers/provider-registry';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'ai-generation',
    }),
    AIGenerationModule,
  ],
  providers: [AIService, ProviderRegistry],
  controllers: [AIController],
  exports: [AIService, ProviderRegistry],
})
export class AIModule {}