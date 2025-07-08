import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  // 确保uploads目录存在
  const uploadsPath = join(process.cwd(), 'uploads');
  const picPath = join(uploadsPath, 'pic');
  const measurementPath = join(picPath, 'measurement');
  const covidPath = join(picPath, 'covid');

  console.log('[STARTUP] Checking uploads directories...');
  console.log('[STARTUP] Process CWD:', process.cwd());
  console.log('[STARTUP] Node ENV:', process.env.NODE_ENV);

  try {
    if (!existsSync(uploadsPath)) {
      console.log('[STARTUP] Creating uploads directory:', uploadsPath);
      mkdirSync(uploadsPath, { recursive: true });
    }
    if (!existsSync(picPath)) {
      console.log('[STARTUP] Creating pic directory:', picPath);
      mkdirSync(picPath, { recursive: true });
    }
    if (!existsSync(measurementPath)) {
      console.log('[STARTUP] Creating measurement directory:', measurementPath);
      mkdirSync(measurementPath, { recursive: true });
    }
    if (!existsSync(covidPath)) {
      console.log('[STARTUP] Creating covid directory:', covidPath);
      mkdirSync(covidPath, { recursive: true });
    }
    console.log('[STARTUP] All upload directories are ready');
  } catch (error) {
    console.error('[STARTUP] Error creating upload directories:', error);
    // 不要因为目录创建失败而停止应用启动
  }

  const app = await NestFactory.create(AppModule);

  // 启用CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('Healthcare AI API')
    .setDescription('Healthcare AI系统API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[STARTUP] Application is running on port ${port}`);
  console.log(`[STARTUP] Swagger docs available at http://localhost:${port}/api-docs`);
}

bootstrap();
