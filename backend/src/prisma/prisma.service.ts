import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      super({ log: ['error'] });
      this.logger.error('DATABASE_URL is not set!');
      return;
    }
    const adapter = new PrismaPg({ connectionString: dbUrl });
    super({ adapter, log: ['error'] });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.error('Skipping - DATABASE_URL not configured');
      return;
    }

    // Sync database schema on startup
    try {
      this.logger.log('Syncing database schema...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      this.logger.log('Database schema synced');
    } catch (error) {
      this.logger.error('DB push failed', (error as Error).message);
    }

    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL database');
    } catch (error) {
      this.logger.error('Failed to connect to database', (error as Error).message);
    }
  }

  async onModuleDestroy() {
    try { await this.$disconnect(); } catch {}
  }
}
