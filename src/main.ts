import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api")
  app.enableCors({
    origin: true,
    credentials: true
  })

  const config = new DocumentBuilder()
    .setTitle("Yurik API Documentation")
    .setDescription("Документация серверной части для Yurik.")
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({skipNullProperties: true, forbidNonWhitelisted: true, whitelist: true}));
  await app.listen(3000);
}
bootstrap();
