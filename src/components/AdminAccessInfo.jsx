import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, Key } from 'lucide-react';

export default function AdminAccessInfo() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-800">Acesso Administrativo</CardTitle>
        </div>
        <CardDescription className="text-blue-600">
          Para desenvolvedores e administradores do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Usuário:</span>
              <code className="bg-white px-2 py-1 rounded text-blue-800">admin</code>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Key className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Senha:</span>
              <code className="bg-white px-2 py-1 rounded text-blue-800">admin123</code>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Link to="/AdminLogin">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Acessar Painel Admin
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-xs text-blue-600">
          <strong>Nota:</strong> Este é um sistema de autenticação temporário para desenvolvimento. 
          Em produção, configure credenciais seguras no Base44 SDK.
        </p>
      </CardContent>
    </Card>
  );
}