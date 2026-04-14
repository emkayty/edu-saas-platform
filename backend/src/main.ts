import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LogLevel } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn', 'log'] 
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // Enable CORS with proper configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  // Global validation pipe with security features
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Disable for production performance
      stopAtFirstError: process.env.NODE_ENV !== 'production',
    }),
  );
  
  // Swagger documentation with extended info
  const config = new DocumentBuilder()
    .setTitle('EduSaaS Platform API')
    .setDescription(`
## Multi-Tenant University & Polytechnic Portal

### Features
- 🔐 JWT Authentication with refresh tokens
- 👥 Role-based access control (RBAC)
- 🏛️ Multi-tenant architecture
- 🇳🇬 Nigerian integrations (JAMB, Remita, NUC)
- 🤖 AI-powered analytics & chatbot
- 📱 Mobile-first design

### Authentication
Use Bearer token in Authorization header:
\`Authorization: Bearer <access_token>\`
    `)
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication - Login, Register, Refresh Token')
    .addTag('tenants', 'Tenant Management')
    .addTag('users', 'User Management')
    .addTag('academics', 'Academic Management')
    .addTag('students', 'Student Management')
    .addTag('finance', 'Finance & Payments')
    .addTag('examination', 'Exams & Grading')
    .addTag('lms', 'Learning Management')
    .addTag('library', 'Library Management')
    .addTag('hostel', 'Hostel Management')
    .addTag('hr', 'Human Resources')
    .addTag('ai', 'AI & Analytics')
    .addTag('grading', 'Grading System')
    .addTag('health', 'Health Check')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Get port from environment
  const port = process.env.PORT || 3001;
  
  await app.listen(port);
  
  // Display useful info
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           🎓 EduSaaS Platform - API Server                ║
╠═══════════════════════════════════════════════════════════╣
║  Environment:     ${process.env.NODE_ENV || 'development'.padEnd(27)}║
║  Port:           ${port.toString().padEnd(37)}║
║  API Prefix:      /api/v1${' '.repeat(28)}║
║  Swagger Docs:   http://localhost:${port}/api/docs${' '.padEnd(13)}║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();