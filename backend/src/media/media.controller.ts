import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    return this.mediaService.upload(req.user.id, file, folder);
  }

  @Get()
  async findAll(@Request() req: any, @Query('folder') folder?: string) {
    return this.mediaService.findAll(req.user.id, folder);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.mediaService.delete(id, req.user.id);
  }
}
