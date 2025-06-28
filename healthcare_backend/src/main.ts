import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 启用CORS
  app.enableCors({
    origin: appConfig.frontendUrl,
    credentials: true,
  });

  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
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

  await app.listen(appConfig.port);
  
  console.log(`🚀 应用启动成功！`);
  console.log(`🌍 环境: ${appConfig.environment}`);
  console.log(`📱 API地址: ${appConfig.apiUrl}/api`);
  console.log(`📚 API文档: ${appConfig.apiUrl}/api-docs`);
  console.log(`📷 图片访问: ${appConfig.staticUrl}/uploads/`);
  console.log(`🖥️  前端地址: ${appConfig.frontendUrl}`);
}

bootstrap();
