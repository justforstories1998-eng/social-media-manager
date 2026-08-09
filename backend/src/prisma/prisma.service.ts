import { Injectable, OnModuleInit, OnModuleDestroy, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      super({ log: ['error'] });
      this.logger.error('DATABASE_URL is not set! Database operations will fail.');
      return;
    }
    const adapter = new PrismaPg({ connectionString: dbUrl });
    super({ adapter, log: ['error'] });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.error('Skipping database connection - DATABASE_URL not configured');
      return;
    }
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL database');
    } catch (error) {
      this.logger.error('Failed to connect to database', (error as Error).message);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}
