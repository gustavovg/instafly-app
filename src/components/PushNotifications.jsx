import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle } from 'lucide-react';

export default function PushNotifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Notificações de Vendas
        </CardTitle>
        <CardDescription>
          Receba alertas por email sempre que uma nova venda for aprovada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Notificações por email estão ativas.</span>
        </div>
        
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong>
            <br />
            • Toda vez que uma venda for aprovada no Mercado Pago, você receberá um email automático
            <br />
            • O email contém todos os detalhes da venda: valor, serviço, cliente, etc.
            <br />
            • As notificações são enviadas instantaneamente após a confirmação do pagamento
          </AlertDescription>
        </Alert>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>💡 Dica:</strong> Para receber as notificações, certifique-se de que o email da sua conta admin está correto e verifique também a pasta de spam.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}