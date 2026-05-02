import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://sunshine.agendaclinte.com.br',
        'https://flordelotus.agendaclinte.com.br',
        'https://flor-de-lotus-system.vercel.app',
      ];

  console.log('CORS_ORIGINS carregadas:', corsOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      console.log('Origem recebida no CORS:', origin);

      if (corsOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origem não permitida pelo CORS: ${origin}`),
        false,
      );
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const uploadsPath = join(process.cwd(), 'uploads');

  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend rodando na porta ${port}`);
}

bootstrap();