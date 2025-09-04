import React, { useState, useEffect } from 'react';
import { WhiteLabelSite } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminWhiteLabelBilling() {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const siteId = urlParams.get('id');

  useEffect(() => {
    if (siteId) {
      loadSite();
    }
  }, [siteId]);

  const loadSite = async () => {
    try {
      const sites = await WhiteLabelSite.list();
      const foundSite = sites.find(s => s.id === siteId);
      setSite(foundSite);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar dados do site' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSite(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await WhiteLabelSite.update(siteId, site);
      setAlert({ type: 'success', message: 'Configurações de faturamento salvas com sucesso!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const getPlanDetails = (planType) => {
    const plans = {
      starter: { name: 'Starter', basePrice: 297, features: ['Subdomínio', 'Suporte básico', 'Personalização limitada'] },
      professional: { name: 'Professional', basePrice: 597, features: ['Domínio próprio', 'Suporte prioritário', 'Personalização completa'] },
      enterprise: { name: 'Enterprise', basePrice: 997, features: ['Domínio próprio', 'Suporte VIP', 'Funcionalidades extras', 'Analytics avançado'] }
    };
    return plans[planType] || plans.starter;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!site) {
    return <div className="text-center p-8">Site não encontrado</div>;
  }

  const planDetails = getPlanDetails(site.plan_type);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = createPageUrl('AdminWhiteLabel')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Faturamento do Site White-Label</h1>
          <p className="text-gray-600">{site.brand_name} - {site.site_domain}</p>
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Configurações de Cobrança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Plano Atual</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{planDetails.name}</Badge>
                  <span className="text-sm text-gray-600">R$ {planDetails.basePrice}/mês</span>
                </div>
              </div>

              <div>
                <Label htmlFor="monthly_fee">Taxa Mensal Personalizada (R$)</Label>
                <Input
                  id="monthly_fee"
                  type="number"
                  step="0.01"
                  value={site.monthly_fee || planDetails.basePrice}
                  onChange={(e) => handleInputChange('monthly_fee', parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor padrão: R$ {planDetails.basePrice}. Você pode personalizar para este cliente.
                </p>
              </div>

              <div>
                <Label htmlFor="commission_percentage">Sua Comissão sobre Vendas (%)</Label>
                <Input
                  id="commission_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={site.commission_percentage || 30}
                  onChange={(e) => handleInputChange('commission_percentage', parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Porcentagem que você receberá sobre cada venda que este cliente fizer.
                </p>
              </div>

              <div>
                <Label htmlFor="next_billing_date">Próxima Data de Cobrança</Label>
                <Input
                  id="next_billing_date"
                  type="date"
                  value={site.next_billing_date ? site.next_billing_date.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('next_billing_date', e.target.value + 'T00:00:00.000Z')}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Resumo do Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plano:</span>
                  <Badge>{planDetails.name}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa Mensal:</span>
                  <span className="font-semibold">R$ {(site.monthly_fee || planDetails.basePrice).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sua Comissão:</span>
                  <span className="font-semibold text-green-600">{site.commission_percentage || 30}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Próxima Cobrança:</span>
                  <span className="font-semibold">
                    {site.next_billing_date 
                      ? format(new Date(site.next_billing_date), 'dd/MM/yyyy', { locale: ptBR })
                      : 'Não definida'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Funcionalidades Inclutas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projeção de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {((site.monthly_fee || planDetails.basePrice) * 12).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Receita anual projetada apenas com a taxa mensal</p>
                <p className="text-xs text-gray-500 mt-2">
                  + Comissões sobre vendas do cliente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}