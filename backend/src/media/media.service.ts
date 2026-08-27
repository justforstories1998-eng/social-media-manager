import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(userId: string, file: Express.Multer.File, folder?: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif',
      'video/mp4', 'video/webm', 'video/quicktime',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}. Accepted: images (jpg, png, gif, webp, svg, bmp, tiff, avif) and videos (mp4, webm, mov).`);
    }

    const uploadFolder = folder || 'general';

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `wondermedia/${uploadFolder}`,
          resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
          transformation: file.mimetype.startsWith('image/')
            ? [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }]
            : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });

    const media = await this.prisma.media.create({
      data: {
        userId,
        filename: result.public_id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: result.secure_url,
        folder: uploadFolder,
        tags: [],
        metadata: {
          width: result.width,
          height: result.height,
          cloudinaryId: result.public_id,
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

    // Delete from Cloudinary
    const metadata = media.metadata as any;
    if (metadata?.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(metadata.cloudinaryId);
      } catch {
        // Ignore Cloudinary deletion errors
      }
    }

    return this.prisma.media.delete({
      where: { id },
    });
  }
}
