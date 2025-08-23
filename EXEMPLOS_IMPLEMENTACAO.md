# 🔧 Exemplos de Implementação

## 🎯 Backend - FastAPI

### 1. Estrutura de Arquivos
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── solar.py
│   │   │   │   └── users.py
│   │   │   └── api.py
│   │   └── deps.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── solar.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── solar.py
│   │   └── user.py
│   └── services/
│       ├── __init__.py
│       ├── nasa_api.py
│       └── solar_calculations.py
├── alembic/
├── tests/
├── requirements.txt
└── Dockerfile
```

### 2. Configuração Principal (main.py)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title="Solar Analysis API",
    description="API para análise de dados solares da NASA",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}
```

### 3. Endpoint Moderno (solar.py)
```python
from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional
from app.schemas.solar import (
    ClearSkyDaysResponse,
    SolarIrradiationResponse,
    SolarAvailabilityResponse
)
from app.services.nasa_api import NASAService
from app.services.solar_calculations import SolarCalculations
from app.core.cache import cache

router = APIRouter()

@router.get("/clear-sky-days", response_model=ClearSkyDaysResponse)
@cache(expire=3600)  # Cache por 1 hora
async def get_clear_sky_days(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude"),
    end_date: str = Query(..., regex=r'^\d{8}$', description="Data final (YYYYMMDD)")
) -> ClearSkyDaysResponse:
    """
    Obtém dias com céu limpo para uma localização específica.
    """
    try:
        nasa_service = NASAService()
        solar_calc = SolarCalculations()
        
        # Buscar dados da NASA
        raw_data = await nasa_service.get_clear_sky_days(
            latitude=latitude,
            longitude=longitude,
            end_date=end_date
        )
        
        # Processar dados
        processed_data = solar_calc.process_clear_sky_days(raw_data)
        
        return ClearSkyDaysResponse(
            location=f"{latitude}, {longitude}",
            total_days=len(processed_data),
            clear_days=processed_data,
            period=f"2020-{end_date}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/irradiation", response_model=SolarIrradiationResponse)
@cache(expire=1800)  # Cache por 30 minutos
async def get_solar_irradiation(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    period: str = Query("monthly", regex="^(daily|weekly|monthly|yearly)$")
) -> SolarIrradiationResponse:
    """
    Obtém dados de irradiação solar otimizada.
    """
    try:
        nasa_service = NASAService()
        solar_calc = SolarCalculations()
        
        raw_data = await nasa_service.get_irradiation_data(
            latitude=latitude,
            longitude=longitude
        )
        
        processed_data = solar_calc.calculate_monthly_savings(raw_data)
        
        return SolarIrradiationResponse(
            location=f"{latitude}, {longitude}",
            monthly_data=processed_data,
            total_annual_savings=sum(processed_data.values())
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 4. Schemas Pydantic
```python
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class ClearSkyDaysResponse(BaseModel):
    location: str = Field(..., description="Localização analisada")
    total_days: int = Field(..., description="Total de dias analisados")
    clear_days: List[str] = Field(..., description="Lista de dias com céu limpo")
    period: str = Field(..., description="Período analisado")
    
    class Config:
        json_schema_extra = {
            "example": {
                "location": "-8.05428, -34.8813",
                "total_days": 365,
                "clear_days": ["01/01/2020", "02/01/2020"],
                "period": "2020-20211003"
            }
        }

class SolarIrradiationResponse(BaseModel):
    location: str
    monthly_data: Dict[int, str] = Field(..., description="Dados mensais em reais")
    total_annual_savings: float = Field(..., description="Economia anual total")
    
    class Config:
        json_schema_extra = {
            "example": {
                "location": "-8.05428, -34.8813",
                "monthly_data": {
                    1: "R$ 150.50",
                    2: "R$ 140.30"
                },
                "total_annual_savings": 1800.00
            }
        }
```

### 5. Serviço NASA API
```python
import httpx
from typing import Dict, Any
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class NASAService:
    def __init__(self):
        self.base_url = "https://power.larc.nasa.gov/api"
        self.timeout = 30.0
    
    async def get_clear_sky_days(
        self, 
        latitude: float, 
        longitude: float, 
        end_date: str
    ) -> Dict[str, Any]:
        """
        Busca dados de dias com céu limpo da NASA API.
        """
        url = f"{self.base_url}/temporal/daily/point"
        params = {
            "parameters": "CLRSKY_DAYS",
            "community": "RE",
            "longitude": longitude,
            "latitude": latitude,
            "format": "JSON",
            "start": "2020",
            "end": end_date
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"NASA API error: {e}")
                raise Exception(f"Erro na API da NASA: {e}")
    
    async def get_irradiation_data(
        self, 
        latitude: float, 
        longitude: float
    ) -> Dict[str, Any]:
        """
        Busca dados de irradiação solar da NASA API.
        """
        url = f"{self.base_url}/temporal/climatology/point"
        params = {
            "parameters": "SI_EF_TILTED_SURFACE",
            "community": "RE",
            "longitude": longitude,
            "latitude": latitude,
            "format": "JSON"
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"NASA API error: {e}")
                raise Exception(f"Erro na API da NASA: {e}")
```

## 🎨 Frontend - Next.js 14

### 1. Estrutura de Arquivos
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── solar/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── chart.tsx
│   │   ├── solar/
│   │   │   ├── solar-analysis.tsx
│   │   │   ├── solar-chart.tsx
│   │   │   └── location-picker.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       └── footer.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── hooks/
│   │   ├── use-solar-data.ts
│   │   └── use-location.ts
│   └── types/
│       ├── solar.ts
│       └── api.ts
├── public/
├── tailwind.config.js
├── next.config.js
└── package.json
```

### 2. Página Principal (page.tsx)
```typescript
import { Suspense } from 'react'
import { SolarAnalysis } from '@/components/solar/solar-analysis'
import { SolarChart } from '@/components/solar/solar-chart'
import { LocationPicker } from '@/components/solar/location-picker'
import { Card } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock the Secrets of Sun
          </h1>
          <p className="text-xl text-gray-600">
            Análise avançada de dados solares da NASA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seletor de Localização */}
          <Card className="lg:col-span-1 p-6">
            <LocationPicker />
          </Card>

          {/* Análise Solar */}
          <Card className="lg:col-span-2 p-6">
            <Suspense fallback={<div>Carregando análise...</div>}>
              <SolarAnalysis />
            </Suspense>
          </Card>

          {/* Gráfico Solar */}
          <Card className="lg:col-span-3 p-6">
            <Suspense fallback={<div>Carregando gráfico...</div>}>
              <SolarChart />
            </Suspense>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

### 3. Componente de Análise Solar
```typescript
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSolarData } from '@/hooks/use-solar-data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sun, Cloud, TrendingUp } from 'lucide-react'

interface SolarAnalysisProps {
  latitude?: number
  longitude?: number
}

export function SolarAnalysis({ latitude, longitude }: SolarAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  
  const { data: clearSkyData, isLoading: clearSkyLoading } = useQuery({
    queryKey: ['clear-sky-days', latitude, longitude],
    queryFn: () => fetchClearSkyDays(latitude!, longitude!),
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  const { data: irradiationData, isLoading: irradiationLoading } = useQuery({
    queryKey: ['solar-irradiation', latitude, longitude],
    queryFn: () => fetchSolarIrradiation(latitude!, longitude!),
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
  })

  if (!latitude || !longitude) {
    return (
      <div className="text-center py-8">
        <Sun className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Selecione uma localização para começar</p>
      </div>
    )
  }

  if (clearSkyLoading || irradiationLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Análise Solar
        </h2>
        <div className="flex space-x-2">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dias com Céu Limpo */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Sun className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Dias com Céu Limpo</p>
              <p className="text-2xl font-bold text-gray-900">
                {clearSkyData?.total_days || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Economia Mensal */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Economia Mensal</p>
              <p className="text-2xl font-bold text-gray-900">
                {irradiationData?.monthly_data?.[1] || 'R$ 0,00'}
              </p>
            </div>
          </div>
        </Card>

        {/* Economia Anual */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Economia Anual</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {irradiationData?.total_annual_savings?.toFixed(2) || '0,00'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Dias com Céu Limpo */}
      {clearSkyData?.clear_days && clearSkyData.clear_days.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Dias com Céu Limpo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {clearSkyData.clear_days.slice(0, 12).map((day, index) => (
              <div
                key={index}
                className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded"
              >
                {day}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
```

### 4. Hook Personalizado para Dados Solares
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ClearSkyDaysResponse, SolarIrradiationResponse } from '@/types/solar'

export function useSolarData() {
  const queryClient = useQueryClient()

  const fetchClearSkyDays = async (latitude: number, longitude: number) => {
    const response = await api.get<ClearSkyDaysResponse>('/solar/clear-sky-days', {
      params: { latitude, longitude, end_date: '20231231' }
    })
    return response.data
  }

  const fetchSolarIrradiation = async (latitude: number, longitude: number) => {
    const response = await api.get<SolarIrradiationResponse>('/solar/irradiation', {
      params: { latitude, longitude, period: 'monthly' }
    })
    return response.data
  }

  const clearCache = () => {
    queryClient.invalidateQueries({ queryKey: ['solar'] })
  }

  return {
    fetchClearSkyDays,
    fetchSolarIrradiation,
    clearCache
  }
}
```

### 5. Configuração da API
```typescript
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para logs
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)
```

## 🐳 Docker Configuration

### 1. Dockerfile Frontend
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Dockerfile Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🚀 Deploy Configuration

### 1. Docker Compose
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/solar_db
      - REDIS_URL=redis://redis:6379
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - db
      - redis
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=solar_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 2. Nginx Configuration
```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend/health;
        }
    }
}
```

## 🎯 Próximos Passos

1. **Setup Inicial**: Criar a nova estrutura de diretórios
2. **Backend**: Migrar endpoints Flask para FastAPI
3. **Frontend**: Setup Next.js com TypeScript
4. **Database**: Configurar PostgreSQL e migrations
5. **Testing**: Implementar testes automatizados
6. **Deploy**: Configurar CI/CD e deploy

Esta refatoração transformará completamente o projeto, tornando-o moderno, escalável e pronto para produção! 🚀
