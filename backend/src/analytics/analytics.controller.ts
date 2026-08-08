import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.analyticsService.getDashboard(req.user.id);
  }

  @Get('platform/:platform')
  async getPlatformStats(@Request() req: any, @Param('platform') platform: string) {
    return this.analyticsService.getPlatformStats(req.user.id, platform);
  }
}
