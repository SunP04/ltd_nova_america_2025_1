import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const corsOrigins = configService.get<string[]>('app.corsOrigins') ?? [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Authentication Service')
    .setDescription(
      'JWT authentication API with password reset, e-mail verification, and Google Authenticator two-factor support.'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true }
  });

  await app.listen(configService.get<number>('app.port', 3000));
}

bootstrap();
