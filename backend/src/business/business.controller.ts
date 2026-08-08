import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessService } from './business.service';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('business')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.businessService.getProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.updateProfile(req.user.id, updateBusinessDto);
  }
}
