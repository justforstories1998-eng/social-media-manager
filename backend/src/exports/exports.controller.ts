import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportsService } from './exports.service';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post()
  async create(
    @Request() req: any,
    @Body() body: { type: string; format: string; filters?: any },
  ) {
    return this.exportsService.create(req.user.id, body.type, body.format, body.filters);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.exportsService.findAll(req.user.id);
  }

  @Get(':id/download')
  async download(@Request() req: any, @Param('id') id: string) {
    return this.exportsService.download(id, req.user.id);
  }
}
