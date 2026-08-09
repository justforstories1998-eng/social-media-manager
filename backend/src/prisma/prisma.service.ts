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

    // Run migrations on startup
    try {
      this.logger.log('Running database migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      this.logger.log('Migrations completed');
    } catch {
      this.logger.warn('Migration deploy failed, trying db push...');
      try {
        execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });
        this.logger.log('DB push completed');
      } catch (error) {
        this.logger.error('DB push also failed', (error as Error).message);
      }
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
