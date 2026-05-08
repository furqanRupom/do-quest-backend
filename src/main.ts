import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,   });

  app.setGlobalPrefix('api/v1');

  app.use(cookieParser());

  app.use(
    '/api/v1/stripe/webhook',
    express.raw({ type: 'application/json' }),
  );

  app.use((req, res, next) => {
    if (req.path === '/api/v1/stripe/webhook') return next();
    express.json()(req, res, next);
  });

  const allowedOrigins = [
    'http://localhost:3000',
    'https://do-quest.vercel.app',
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  const config = new DocumentBuilder()
    .setTitle('Do Quest API')
    .setDescription('API for managing quests and tasks')
    .setVersion('1.0.0')
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      in: 'cookie',
      description: 'JWT access token stored in httpOnly cookie',
    })
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, documentFactory, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
    ],
    jsonDocumentUrl: 'api/v1/docs-json',
    swaggerOptions: { tagsSorter: 'alpha' },
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
