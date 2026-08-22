import { Module } from '@nestjs/common';
import { AIGenerationController } from './ai-generation.controller';
import { AIGenerationService } from './ai-generation.service';

@Module({
  controllers: [AIGenerationController],
  providers: [AIGenerationService],
  exports: [AIGenerationService],
})
export class AIGenerationModule {}
