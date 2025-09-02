import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Middleware para interceptar /sales e redirecionar para a API
  app.use('/sales', (req, res, next) => {
    // Redireciona para a rota da API
    const newUrl = `/api/v1/sales${req.url === '/' ? '' : req.url}`;
    req.url = newUrl;
    next();
  });

  // Configuração de validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Prefixo global para API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend rodando na porta ${port}`);
  console.log(`📡 API disponível em: http://localhost:${port}/api/v1`);
  console.log(`🔗 Sales (compatibilidade) em: http://localhost:${port}/sales`);
}
bootstrap();
