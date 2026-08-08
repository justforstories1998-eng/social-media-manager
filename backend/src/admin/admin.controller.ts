import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: { isActive?: boolean; name?: string }) {
    return this.adminService.updateUser(id, body);
  }

  @Get('health')
  async getHealth() {
    return this.adminService.getHealth();
  }
}
