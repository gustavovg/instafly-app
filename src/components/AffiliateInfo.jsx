import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, DollarSign, Users, Gift } from 'lucide-react';

export default function AffiliateInfo() {
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Gift className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-purple-800">Programa de Afiliados</CardTitle>
        </div>
        <CardDescription className="text-purple-600">
          Ganhe dinheiro compartilhando nossos serviços
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Share2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Compartilhe</h4>
            <p className="text-xs text-purple-600">Seu link único</p>
          </div>
          <div className="text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Ganhe 10%</h4>
            <p className="text-xs text-purple-600">Por cada venda</p>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Receba via PIX</h4>
            <p className="text-xs text-purple-600">Rápido e seguro</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link to="/AffiliateLogin">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              Tornar-se Afiliado
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-purple-600 text-center">
          <strong>Sem custos:</strong> Cadastre-se gratuitamente e comece a ganhar hoje mesmo!
        </p>
      </CardContent>
    </Card>
  );
}