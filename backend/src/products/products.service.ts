import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        userId,
        ...createProductDto,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, userId: string, updateProductDto: UpdateProductDto) {
    await this.findById(id, userId);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async bulkCreate(userId: string, products: CreateProductDto[]) {
    const createdProducts = await Promise.all(
      products.map((product) =>
        this.prisma.product.create({
          data: {
            userId,
            ...product,
          },
        })
      ),
    );

    return createdProducts;
  }
}
