import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
@UseGuards(JwtAuthGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('queue')
  async getQueue(@Request() req: any) {
    return this.schedulerService.getQueue(req.user.id);
  }

  @Post('schedule/:postId')
  async schedulePost(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() body: { platforms: string[]; scheduledFor: string },
  ) {
    return this.schedulerService.schedulePost(
      req.user.id,
      postId,
      body.platforms,
      new Date(body.scheduledFor),
    );
  }

  @Delete(':id')
  async cancelSchedule(@Request() req: any, @Param('id') id: string) {
    return this.schedulerService.cancelSchedule(id, req.user.id);
  }
}
