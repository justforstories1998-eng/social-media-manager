import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateBusinessDto: UpdateBusinessDto) {
    return this.prisma.businessProfile.upsert({
      where: { userId },
      update: updateBusinessDto,
      create: {
        userId,
        businessName: updateBusinessDto.businessName || 'My Business',
        ...updateBusinessDto,
      },
    });
  }
}
