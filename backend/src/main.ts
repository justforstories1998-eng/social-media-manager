import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global API prefix
  app.setGlobalPrefix('api');

  // Security middleware (OWASP Top 10 compliant)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cookieParser());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api', limiter);

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // CORS
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // CORS for uploaded files (express.static doesn't go through NestJS CORS)
  const uploadsCors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header('Access-Control-Allow-Origin', frontendUrl);
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  };

  // Serve uploaded files statically
  app.use('/uploads', uploadsCors, express.static(join(process.cwd(), 'uploads')));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('AI Social Media Management Platform')
    .setDescription('Enterprise-grade, completely free, self-hosted Social Media Management Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('business', 'Business profile')
    .addTag('products', 'Product management')
    .addTag('posts', 'Content & Posts')
    .addTag('ai', 'AI Generation')
    .addTag('analytics', 'Analytics & Reports')
    .addTag('scheduler', 'Content Scheduler')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true }
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Backend running on port ${port}`);
  logger.log(`API Docs: http://localhost:${port}/api/docs`);
  logger.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
  logger.log(`REDIS_URL: ${process.env.REDIS_URL ? 'SET' : 'NOT SET'}`);
  logger.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
  logger.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
}
bootstrap();