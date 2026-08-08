import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async upload(userId: string, file: Express.Multer.File, folder?: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', folder || 'general');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    // Process image with Sharp if it's an image
    if (file.mimetype.startsWith('image/')) {
      await sharp(file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(filepath);
    } else {
      fs.writeFileSync(filepath, file.buffer);
    }

    const url = `/uploads/${folder || 'general'}/${filename}`;

    const media = await this.prisma.media.create({
      data: {
        userId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        folder: folder || 'general',
        tags: [],
        metadata: {
          width: file.mimetype.startsWith('image/') ? 1920 : undefined,
          height: file.mimetype.startsWith('image/') ? 1080 : undefined,
        },
      },
    });

    return media;
  }

  async findAll(userId: string, folder?: string) {
    return this.prisma.media.findMany({
      where: {
        userId,
        ...(folder && { folder }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string, userId: string) {
    const media = await this.prisma.media.findFirst({
      where: { id, userId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete file from disk
    const filepath = path.join(process.cwd(), media.url);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    return this.prisma.media.delete({
      where: { id },
    });
  }
}
