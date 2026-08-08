import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TelegramService } from './telegram.service';
import { UpdateTelegramDto } from './dto/update-telegram.dto';

@Controller('telegram')
@UseGuards(JwtAuthGuard)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('settings')
  async getSettings(@Request() req: any) {
    return this.telegramService.getSettings(req.user.id);
  }

  @Put('settings')
  async updateSettings(@Request() req: any, @Body() updateTelegramDto: UpdateTelegramDto) {
    return this.telegramService.updateSettings(req.user.id, updateTelegramDto);
  }

  @Post('test')
  async testConnection(@Request() req: any) {
    return this.telegramService.testConnection(req.user.id);
  }
}
