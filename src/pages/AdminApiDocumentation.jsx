import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal } from 'lucide-react';

const CodeBlock = ({ children }) => (
  <pre className="bg-gray-800 text-white p-4 rounded-md mt-2 text-sm overflow-x-auto">
    <code>{children}</code>
  </pre>
);

export default function AdminApiDocumentation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentação da API para Revendedores</h1>
        <p className="text-gray-600 mt-2">Guia completo para integrar e utilizar nossa API.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Todas as requisições à API devem incluir sua chave e seu segredo nos cabeçalhos (headers) da requisição, como no exemplo abaixo:</p>
          <CodeBlock>
            X-API-KEY: sua_api_key_aqui{'\n'}
            X-API-SECRET: seu_api_secret_aqui
          </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" /> Endpoints da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Endpoint Listar Serviços */}
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Badge>GET</Badge> /api/services
            </h3>
            <p className="text-sm text-gray-600 mt-1">Retorna uma lista de todos os serviços disponíveis.</p>
            <h4 className="font-medium text-sm mt-2">Exemplo de Resposta:</h4>
            <CodeBlock>
{`[
  {
    "id": "service_id_1",
    "name": "Seguidores Brasileiros",
    "platform": "Instagram",
    "price_per_thousand": 59.99,
    "min_quantity": 100,
    "max_quantity": 10000
  },
  ...
]`}
            </CodeBlock>
          </div>

          {/* Endpoint Criar Pedido */}
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Badge variant="secondary">POST</Badge> /api/order
            </h3>
            <p className="text-sm text-gray-600 mt-1">Cria um novo pedido.</p>
            <h4 className="font-medium text-sm mt-2">Corpo da Requisição (JSON):</h4>
            <CodeBlock>
{`{
  "service_id": "service_id_1",
  "target_url": "https://instagram.com/usuario",
  "quantity": 1000
}`}
            </CodeBlock>
             <h4 className="font-medium text-sm mt-2">Exemplo de Resposta:</h4>
            <CodeBlock>
{`{
  "success": true,
  "order_id": "order_id_gerado",
  "status": "pending_payment"
}`}
            </CodeBlock>
          </div>

          {/* Endpoint Status do Pedido */}
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Badge>GET</Badge> /api/order/:order_id
            </h3>
            <p className="text-sm text-gray-600 mt-1">Verifica o status de um pedido específico.</p>
             <h4 className="font-medium text-sm mt-2">Exemplo de Resposta:</h4>
            <CodeBlock>
{`{
  "order_id": "order_id_consultado",
  "status": "processing",
  "quantity": 1000,
  "delivered_quantity": 500
}`}
            </CodeBlock>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}