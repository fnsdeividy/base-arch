import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './shared/presentation/http/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de CORS para permitir requisições do frontend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:4173',
      // Produção - domínios Vercel específicos
      'https://rosy-sales-flow.vercel.app',
      'https://cloro-pdv.vercel.app',
      'https://produtos-limpeza-pdv.vercel.app',
      'https://rosy-sales-flow-git-main.vercel.app',
      // Permitir qualquer subdomínio da Vercel durante desenvolvimento
      /^https:\/\/.*\.vercel\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuração de validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configurar guard JWT global
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Prefixo global para API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend rodando na porta ${port}`);
  console.log(`📡 API disponível em: http://localhost:${port}/api/v1`);
  console.log(`🔗 Sales (compatibilidade) em: http://localhost:${port}/sales`);
}
bootstrap();