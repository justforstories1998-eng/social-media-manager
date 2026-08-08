import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, format: string, filters?: any) {
    return this.prisma.export.create({
      data: {
        userId,
        type,
        format,
        filters,
        status: 'pending',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.export.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const exportRecord = await this.prisma.export.findFirst({
      where: { id, userId },
    });

    if (!exportRecord) {
      throw new NotFoundException('Export not found');
    }

    return exportRecord;
  }

  async download(id: string, userId: string) {
    const exportRecord = await this.findById(id, userId);

    if (exportRecord.status !== 'completed') {
      throw new NotFoundException('Export not ready for download');
    }

    return exportRecord;
  }
}
