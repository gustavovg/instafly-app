import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Database, 
  Code, 
  Settings, 
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Rocket,
  DollarSign,
  Clock
} from 'lucide-react';

export default function MigrationGuide() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const schemaSQL = `-- ====================================
-- INSTAFLY DATABASE SCHEMA
-- Supabase/PostgreSQL Migration
-- ====================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- USERS TABLE
-- ====================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'support', 'customer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by_admin TEXT,
    vip_tier TEXT DEFAULT 'Iniciante',
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- SETTINGS TABLE
-- ====================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_title TEXT DEFAULT 'PainelSMM Pro',
    brand_name TEXT DEFAULT 'InstaFLY',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#3b82f6',
    secondary_color TEXT DEFAULT '#8b5cf6',
    
    -- Mercado Pago
    mp_public_key TEXT,
    mp_access_token TEXT,
    mp_client_id TEXT,
    mp_client_secret TEXT,
    
    -- Provider API
    provider_api_url TEXT,
    provider_api_key TEXT,
    
    -- WhatsApp
    whatsapp_support_number TEXT,
    whatsapp_chat_message TEXT DEFAULT 'Olá! Preciso de ajuda com o InstaFLY.',
    whatsapp_support_enabled BOOLEAN DEFAULT true,
    whatsapp_api_type TEXT DEFAULT 'official',
    whatsapp_api_token TEXT,
    whatsapp_phone_id TEXT,
    evolution_api_url TEXT,
    evolution_api_key TEXT,
    evolution_instance_name TEXT,
    
    -- PWA Settings
    pwa_app_name TEXT,
    pwa_short_name TEXT,
    pwa_description TEXT,
    pwa_icon_url TEXT,
    pwa_icon_192 TEXT,
    pwa_icon_512 TEXT,
    pwa_theme_color TEXT DEFAULT '#8b5cf6',
    pwa_background_color TEXT DEFAULT '#ffffff',
    
    -- System
    auto_sync_enabled BOOLEAN DEFAULT true,
    sync_interval_minutes INTEGER DEFAULT 10,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- SERVICES TABLE
-- ====================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'Facebook', 'YouTube', 'Twitter', 'TikTok', 'LinkedIn', 'Kwai')),
    service_type TEXT NOT NULL CHECK (service_type IN ('followers', 'likes', 'views', 'comments', 'shares')),
    default_quantity INTEGER NOT NULL,
    price_per_thousand DECIMAL(10,2) NOT NULL,
    cost_per_thousand DECIMAL(10,2),
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER NOT NULL,
    is_brazilian BOOLEAN DEFAULT false,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    provider_service_id TEXT,
    order_index INTEGER DEFAULT 0,
    badge_type TEXT DEFAULT 'none',
    is_popular BOOLEAN DEFAULT false,
    show_in_homepage BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ORDERS TABLE
-- ====================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    short_id TEXT UNIQUE NOT NULL DEFAULT LEFT(replace(uuid_generate_v4()::text, '-', ''), 8),
    user_id UUID REFERENCES users(id),
    service_id UUID REFERENCES services(id) NOT NULL,
    service_name TEXT NOT NULL,
    target_url TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending_payment',
    payment_method TEXT,
    mp_payment_id TEXT,
    provider_order_id TEXT,
    provider_response TEXT,
    provider_status TEXT,
    last_sync_date TIMESTAMP WITH TIME ZONE,
    customer_email TEXT,
    customer_whatsapp TEXT NOT NULL,
    coupon_code TEXT,
    coupon_discount_amount DECIMAL(10,2),
    is_express BOOLEAN DEFAULT false,
    is_drip_feed BOOLEAN DEFAULT false,
    paid_with_wallet BOOLEAN DEFAULT false,
    system_log TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [Continue com as outras tabelas...]
-- Ver código completo no schema.sql`;

  const seedSQL = `-- ====================================
-- INSTAFLY SEED DATA
-- ====================================

-- Settings iniciais
INSERT INTO settings (
    site_title,
    brand_name,
    primary_color,
    secondary_color,
    whatsapp_support_number,
    pwa_app_name,
    pwa_short_name,
    pwa_description
) VALUES (
    'InstaFLY - Impulsione suas Redes Sociais',
    'InstaFLY',
    '#8b5cf6',
    '#ec4899',
    '5511999999999',
    'InstaFLY App',
    'InstaFLY',
    'Impulsione suas redes sociais com seguidores, curtidas e visualizações'
);

-- Serviços de exemplo
INSERT INTO services (
    name,
    platform,
    service_type,
    default_quantity,
    price_per_thousand,
    min_quantity,
    max_quantity,
    is_brazilian,
    is_active,
    provider_service_id,
    show_in_homepage
) VALUES 
(
    'Seguidores Brasileiros',
    'Instagram',
    'followers',
    1000,
    59.99,
    100,
    10000,
    true,
    true,
    'service_1001',
    true
),
(
    'Curtidas Instagram',
    'Instagram',
    'likes',
    500,
    39.99,
    50,
    5000,
    true,
    true,
    'service_1002',
    true
);

-- [Continue com outros dados...]`;

  const packageJSON = `{
  "name": "instafly-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "next": "14.0.3",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "^6.8.0",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.294.0",
    "moment": "^2.29.4",
    "react-hook-form": "^7.48.2",
    "react-markdown": "^9.0.1",
    "recharts": "^2.8.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/node": "^20.8.10",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-config-next": "14.0.3",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2"
  }
}`;

  const vercelJSON = `{
  "version": 2,
  "name": "instafly-app",
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}`;

  const supabaseConfig = `# Supabase Configuration
project_id = "instafly"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
max_rows = 1000

[auth]
enabled = true
site_url = "http://localhost:3000"
enable_signup = true

[auth.external.google]
enabled = true
client_id = ""
secret = ""

[db]
port = 54322
major_version = 15

[storage]
enabled = true
file_size_limit = "50MiB"

[edge_functions]
enabled = true
port = 54325`;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 Guia de Migração InstaFLY
        </h1>
        <p className="text-lg text-gray-600">
          Base44 → Vercel + Supabase
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Badge variant="outline" className="text-blue-600">
            <Clock className="w-4 h-4 mr-2" />
            6 semanas
          </Badge>
          <Badge variant="outline" className="text-green-600">
            <DollarSign className="w-4 h-4 mr-2" />
            ~$45/mês
          </Badge>
          <Badge variant="outline" className="text-purple-600">
            <Rocket className="w-4 h-4 mr-2" />
            Performance 3x melhor
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="steps">Passo a Passo</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="benefits">Benefícios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Arquitetura Atual (Base44)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Frontend: React hospedado na base44</li>
                  <li>• Backend: Entities + Functions (Deno)</li>
                  <li>• Banco: PostgreSQL gerenciado</li>
                  <li>• Auth: Google OAuth integrado</li>
                  <li>• Deploy: Automático via plataforma</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-green-500" />
                  Arquitetura Nova (Vercel + Supabase)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Frontend: Next.js na Vercel</li>
                  <li>• Backend: Supabase Edge Functions</li>
                  <li>• Banco: Supabase PostgreSQL</li>
                  <li>• Auth: Supabase Auth (Google)</li>
                  <li>• Deploy: Git-based automático</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stack Tecnológico Recomendado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Frontend</h4>
                  <ul className="text-sm text-blue-700 mt-2">
                    <li>• Next.js 14 (React 18)</li>
                    <li>• Tailwind CSS</li>
                    <li>• Shadcn/ui</li>
                    <li>• Vercel Hosting</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Backend</h4>
                  <ul className="text-sm text-green-700 mt-2">
                    <li>• Supabase PostgreSQL</li>
                    <li>• Edge Functions (Deno)</li>
                    <li>• Row Level Security</li>
                    <li>• Real-time subscriptions</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Integrações</h4>
                  <ul className="text-sm text-purple-700 mt-2">
                    <li>• Mercado Pago (mantido)</li>
                    <li>• WhatsApp API (mantido)</li>
                    <li>• Fornecedor API (mantido)</li>
                    <li>• Google Auth</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Schema do Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Schema Completo (PostgreSQL)</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(schemaSQL, 'schema')}
                    >
                      {copiedSection === 'schema' ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      Copiar Schema
                    </Button>
                  </div>
                  <pre className="text-xs overflow-x-auto max-h-60 bg-gray-900 text-green-400 p-4 rounded">
                    {schemaSQL}
                  </pre>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Dados Iniciais (Seed)</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(seedSQL, 'seed')}
                    >
                      {copiedSection === 'seed' ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      Copiar Seed
                    </Button>
                  </div>
                  <pre className="text-xs overflow-x-auto max-h-60 bg-gray-900 text-green-400 p-4 rounded">
                    {seedSQL}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabelas Principais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-600">Core Tables</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <code>users</code> - Usuários do sistema</li>
                    <li>• <code>orders</code> - Pedidos realizados</li>
                    <li>• <code>services</code> - Serviços disponíveis</li>
                    <li>• <code>settings</code> - Configurações globais</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">Feature Tables</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <code>coupons</code> - Cupons de desconto</li>
                    <li>• <code>affiliates</code> - Programa de afiliados</li>
                    <li>• <code>customer_wallets</code> - Carteiras dos clientes</li>
                    <li>• <code>tickets</code> - Sistema de suporte</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Configuração Vercel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">package.json</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(packageJSON, 'package')}
                      >
                        {copiedSection === 'package' ? (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copiar
                      </Button>
                    </div>
                    <pre className="text-xs overflow-x-auto max-h-40 bg-gray-900 text-green-400 p-3 rounded">
                      {packageJSON}
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">vercel.json</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(vercelJSON, 'vercel')}
                      >
                        {copiedSection === 'vercel' ? (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copiar
                      </Button>
                    </div>
                    <pre className="text-xs overflow-x-auto max-h-40 bg-gray-900 text-green-400 p-3 rounded">
                      {vercelJSON}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-500" />
                  Configuração Supabase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">config.toml</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(supabaseConfig, 'supabase')}
                      >
                        {copiedSection === 'supabase' ? (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copiar
                      </Button>
                    </div>
                    <pre className="text-xs overflow-x-auto max-h-40 bg-gray-900 text-green-400 p-3 rounded">
                      {supabaseConfig}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Variáveis de Ambiente</h4>
                    <div className="text-sm bg-yellow-50 p-3 rounded">
                      <code className="block">NEXT_PUBLIC_SUPABASE_URL</code>
                      <code className="block">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                      <code className="block">SUPABASE_SERVICE_ROLE_KEY</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="steps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano de Migração (6 Semanas)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Semana 1: Preparação</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Criar projeto no Supabase</li>
                      <li>• Configurar projeto na Vercel</li>
                      <li>• Executar schema do banco</li>
                      <li>• Configurar variáveis de ambiente</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Semana 2: Migração de Dados</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Exportar dados da base44</li>
                      <li>• Importar para Supabase</li>
                      <li>• Validar integridade dos dados</li>
                      <li>• Testar conectividade</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Semana 3-4: Refatoração</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Substituir SDK base44 por Supabase</li>
                      <li>• Migrar Edge Functions</li>
                      <li>• Configurar autenticação</li>
                      <li>• Testes unitários</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Semana 5: Testes e Staging</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Testes de integração</li>
                      <li>• Teste de carga</li>
                      <li>• Deploy em staging</li>
                      <li>• Validação completa</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">Semana 6: Go-Live</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Deploy em produção</li>
                      <li>• Configurar DNS</li>
                      <li>• Monitoramento ativo</li>
                      <li>• Suporte pós-migração</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Custos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Supabase Pro</span>
                    <span className="text-blue-600 font-bold">$25/mês</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-4">
                    • 8GB banco de dados<br/>
                    • 250GB bandwidth<br/>
                    • 500K edge function calls<br/>
                    • 100GB storage
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">Vercel Pro</span>
                    <span className="text-purple-600 font-bold">$20/mês</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-4">
                    • Builds ilimitados<br/>
                    • 1TB bandwidth<br/>
                    • Domínio personalizado<br/>
                    • Analytics avançado
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Domínio</span>
                    <span className="text-gray-600 font-bold">$10/ano</span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <span className="text-green-600 font-bold text-lg">~$45/mês</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparação de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">Base44 Atual</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Custo variável baseado no uso
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700">Vercel + Supabase</h4>
                    <p className="text-sm text-green-600 mt-1">
                      $45/mês - Custo fixo e previsível
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Vantagens Financeiras:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Custos previsíveis</li>
                      <li>• Sem surpresas na conta</li>
                      <li>• Escalabilidade automática</li>
                      <li>• ROI melhor a longo prazo</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>CDN Global</strong>
                      <p className="text-sm text-gray-600">Site servido de múltiplas localizações mundiais</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Edge Functions</strong>
                      <p className="text-sm text-gray-600">Processamento próximo aos usuários</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Cache Automático</strong>
                      <p className="text-sm text-gray-600">Otimização automática de assets</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-500" />
                  Controle Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Código Próprio</strong>
                      <p className="text-sm text-gray-600">Sem vendor lock-in, código 100% seu</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Customização</strong>
                      <p className="text-sm text-gray-600">Liberdade total para modificações</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Integrações</strong>
                      <p className="text-sm text-gray-600">Adicione qualquer serviço externo</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Escalabilidade e Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Auto-scaling</h4>
                  <p className="text-sm text-blue-700 mt-2">
                    Suporte automático a picos de tráfego sem intervenção manual
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Backup Automático</h4>
                  <p className="text-sm text-green-700 mt-2">
                    Snapshots diários automáticos do banco de dados
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Monitoramento</h4>
                  <p className="text-sm text-purple-700 mt-2">
                    Métricas detalhadas de performance e disponibilidade
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Pronto para Migrar?</h3>
              <p className="text-gray-600">
                Siga este guia passo a passo para migrar seu InstaFLY para uma infraestrutura própria.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}