import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

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

  app.useGlobalPipes(new ValidationPipe({ skipUndefinedProperties: true, forbidNonWhitelisted: true, whitelist: true }));
  await app.listen(3000);
}

bootstrap();
