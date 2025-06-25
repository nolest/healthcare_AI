import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:6886',
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // API前缀
  app.setGlobalPrefix('api');

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('远程医疗系统 API')
    .setDescription('远程医疗系统后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 7723;
  await app.listen(port);
  
  console.log(`🚀 应用启动成功！`);
  console.log(`📱 API地址: http://localhost:${port}/api`);
  console.log(`📚 API文档: http://localhost:${port}/api-docs`);
}

bootstrap();
