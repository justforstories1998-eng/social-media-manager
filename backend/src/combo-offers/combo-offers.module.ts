import { Module } from '@nestjs/common';
import { ComboOffersController } from './combo-offers.controller';
import { ComboOffersService } from './combo-offers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AIModule],
  controllers: [ComboOffersController],
  providers: [ComboOffersService],
  exports: [ComboOffersService],
})
export class ComboOffersModule {}
