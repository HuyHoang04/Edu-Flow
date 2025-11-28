import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins (reflects request origin)
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 4000;
  // Listen on 0.0.0.0 to accept connections from all interfaces (IPv4 and IPv6)
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Main Backend Service running on: http://localhost:${port}`);
  console.log(`📚 API available at: http://localhost:${port}/api`);
}

bootstrap();
// Trigger rebuild
