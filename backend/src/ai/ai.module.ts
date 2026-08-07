import { Module } from '@nestjs/common';
import { AIModule as AIServiceModule } from './ai.service';
import { AIController } from './ai.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-generation',
    }),
  ],
  providers: [AIServiceModule],
  controllers: [AIController],
  exports: [AIServiceModule],
})
export class AIModule {}