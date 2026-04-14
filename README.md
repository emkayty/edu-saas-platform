# EduSaaS - Multi-Tenant University & Polytechnic Portal Platform

A comprehensive SaaS platform serving both universities and polytechnics with full customization capabilities.

## 🌟 Features

### Multi-Tenancy
- **Database per Tenant**: Complete data isolation for security
- **Custom Branding**: Logo, colors, fonts per institution
- **Module Toggling**: Enable/disable features per tenant
- **Custom Domains**: White-label support

### Institution Types
- **Universities**: Traditional 4-5 year programs, postgraduate, research
- **Polytechnics**: HND, ND, Industrial Training (SIWES), practical focus

### Core Modules
- Student Information System (SIS)
- Learning Management System (LMS)
- Finance & Fees Management
- Library Management
- Hostel Management
- Examination & Results
- Human Resources
- AI-Powered Analytics

### AI/ML Features
- Predictive Dropout Detection
- Smart Timetabling
- AI Chatbot for Student Support
- Personalized Learning Paths
- Anomaly Detection

### Nigerian Integrations
- JAMB CAPS Integration
- Remita Payment Gateway
- NUC/NBTE Reporting
- NYSC Mobilization
- Local Bank Payments

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, PostgreSQL |
| Cache | Redis |
| Search | Elasticsearch |
| AI/ML | Python (FastAPI), PyTorch, LangChain |
| Queue | RabbitMQ, Apache Kafka |
| Container | Docker, Kubernetes |
| Cloud | AWS/GCP/Azure Ready |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/edu-saas-platform.git
cd edu-saas-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start with Docker
cd ..
docker-compose up -d
```

### Environment Setup

```bash
# Backend .env
DATABASE_URL=postgresql://user:pass@localhost:5432/edusaas
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
REMITA_MERCHANT_ID=your-merchant-id
REMITA_API_KEY=your-api-key

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 📚 Documentation

- [Architecture Documentation](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Tenant Configuration Guide](./docs/tenant-config.md)
- [Deployment Guide](./docs/deployment.md)

## 🎨 Theme System

The platform includes a powerful theme engine that allows each institution to customize:

- Primary and accent colors
- Logo and favicon
- Font families
- UI component styles
- Login page branding

### Available Themes

**Universities:**
- Traditional Blue
- Science Green
- Heritage Maroon
- Prestige Gold

**Polytechnics:**
- Industrial Orange
- Technical Blue
- Engineering Red
- Modern Teal

### Custom Theme Creation

```typescript
// Create custom theme via API
POST /api/tenants/{id}/theme
{
  "primaryColor": "#0066cc",
  "secondaryColor": "#f4a100",
  "accentColor": "#28a745",
  "logo": "https://example.com/logo.png",
  "fontFamily": "Inter"
}
```

## 🔐 Security

- NDPR/GDPR Compliance
- Role-Based Access Control (RBAC)
- Multi-Factor Authentication
- JWT with Refresh Tokens
- Rate Limiting & IP Blocking
- SQL Injection Prevention
- XSS Protection

## 📊 Scalability

- Horizontal Scaling Ready
- Load Balancing Support
- CDN Integration
- Database Read Replicas
- Redis Caching Layer

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE for details

---

Built with ❤️ for Nigerian Education