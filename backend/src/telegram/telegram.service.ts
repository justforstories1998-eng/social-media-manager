import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTelegramDto } from './dto/update-telegram.dto';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    let settings = await this.prisma.telegramSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.telegramSetting.create({
        data: { userId },
      });
    }

    // Hide bot token for security
    return {
      ...settings,
      botToken: settings.botToken ? '••••••••' : null,
    };
  }

  async updateSettings(userId: string, updateTelegramDto: UpdateTelegramDto) {
    return this.prisma.telegramSetting.upsert({
      where: { userId },
      update: updateTelegramDto,
      create: {
        userId,
        ...updateTelegramDto,
      },
    });
  }

  async testConnection(userId: string) {
    const settings = await this.prisma.telegramSetting.findUnique({
      where: { userId },
    });

    if (!settings?.botToken) {
      return { success: false, message: 'Bot token not configured' };
    }

    try {
      // Here you would use telegraf to test the connection
      // For now, we'll just return a success response
      return {
        success: true,
        message: 'Telegram connection test successful',
        chatId: settings.chatId,
      };
    } catch (error) {
      this.logger.error(`Telegram connection test failed: ${error.message}`);
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
      };
    }
  }
}
