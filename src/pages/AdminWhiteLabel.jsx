
import React, { useState, useEffect } from 'react';
import { WhiteLabelSite } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, ExternalLink, Palette, DollarSign, Edit } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AdminWhiteLabel() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [alert, setAlert] = useState(null);
  
  const [formData, setFormData] = useState({
    user_email: '',
    site_domain: '',
    brand_name: '',
    plan_type: 'starter',
    monthly_fee: 297,
    commission_percentage: 30,
    whatsapp_number: ''
  });

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const sitesList = await WhiteLabelSite.list('-created_date');
      setSites(sitesList);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar sites white-label' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenModal = (site = null) => {
    if (site) {
      setEditingSite(site);
      setFormData({
        user_email: site.user_email,
        site_domain: site.site_domain,
        brand_name: site.brand_name,
        plan_type: site.plan_type,
        monthly_fee: site.monthly_fee,
        commission_percentage: site.commission_percentage,
        whatsapp_number: site.whatsapp_number
      });
    } else {
      setEditingSite(null);
      setFormData({
        user_email: '',
        site_domain: '',
        brand_name: '',
        plan_type: 'starter',
        monthly_fee: 297,
        commission_percentage: 30,
        whatsapp_number: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveSite = async () => {
    try {
      if (editingSite) {
        await WhiteLabelSite.update(editingSite.id, formData);
        setAlert({ type: 'success', message: 'Site atualizado com sucesso!' });
      } else {
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        const siteData = { ...formData, next_billing_date: nextBilling.toISOString() };
        await WhiteLabelSite.create(siteData);
        setAlert({ type: 'success', message: 'Site white-label criado com sucesso!' });
      }
      
      setShowModal(false);
      loadSites();
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao salvar site' });
    }
  };

  const toggleSiteStatus = async (id, currentStatus) => {
    try {
      await WhiteLabelSite.update(id, { is_active: !currentStatus });
      setAlert({ type: 'success', message: `Site ${!currentStatus ? 'ativado' : 'desativado'} com sucesso` });
      loadSites();
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao atualizar status do site' });
    }
  };

  const getPlanInfo = (plan) => {
    const plans = {
      starter: { name: 'Starter (Subdomínio)', fee: 297, color: 'bg-blue-100 text-blue-800', description: 'cliente.seusite.com' },
      professional: { name: 'Professional (Domínio Próprio)', fee: 597, color: 'bg-purple-100 text-purple-800', description: 'paineldocliente.com' },
      enterprise: { name: 'Enterprise (Domínio + Extras)', fee: 997, color: 'bg-gold-100 text-gold-800', description: 'paineldocliente.com + extras' }
    };
    return plans[plan] || plans.starter;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sites White-Label</h1>
          <p className="text-gray-600 mt-2">Gerencie sites personalizados para seus clientes</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Site White-Label
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sites Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sites.filter(site => site.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {sites.reduce((sum, site) => sum + (site.monthly_fee || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Comissão Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {sites.length > 0 ? (sites.reduce((sum, site) => sum + (site.commission_percentage || 0), 0) / sites.length).toFixed(0) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Sites */}
      <div className="grid gap-6">
        {sites.map(site => {
          const planInfo = getPlanInfo(site.plan_type);
          return (
            <Card key={site.id} className={`${!site.is_active ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      {site.brand_name}
                      <Badge className={planInfo.color}>
                        {planInfo.name}
                      </Badge>
                      {!site.is_active && <Badge variant="secondary">Inativo</Badge>}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {site.site_domain} | {site.user_email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenModal(site)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://${site.site_domain}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => toggleSiteStatus(site.id, site.is_active)}
                      variant={site.is_active ? "destructive" : "default"}
                      size="sm"
                    >
                      {site.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Configurações</Label>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div>Taxa Mensal: R$ {site.monthly_fee?.toFixed(2)}</div>
                      <div>Comissão: {site.commission_percentage}%</div>
                      <div>WhatsApp: {site.whatsapp_number || 'Não configurado'}</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Personalização</Label>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: site.primary_color }}
                        ></div>
                        Cor Primária
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: site.secondary_color }}
                        ></div>
                        Cor Secundária
                      </div>
                      {site.logo_url && <div>Logo personalizado ✓</div>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-gray-600">
                    Próxima cobrança: {site.next_billing_date ? new Date(site.next_billing_date).toLocaleDateString('pt-BR') : 'Não definida'}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.location.href = createPageUrl(`AdminWhiteLabelPersonalize?id=${site.id}`)}
                    >
                      <Palette className="w-4 h-4 mr-1" />
                      Personalizar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.location.href = createPageUrl(`AdminWhiteLabelBilling?id=${site.id}`)}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Faturamento
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Criação/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSite ? 'Editar Site White-Label' : 'Criar Novo Site White-Label'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes abaixo para configurar o site do seu cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email do Cliente</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData({...formData, user_email: e.target.value})}
                  placeholder="cliente@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="domain">Domínio do Site</Label>
                <Input
                  id="domain"
                  value={formData.site_domain}
                  onChange={(e) => setFormData({...formData, site_domain: e.target.value})}
                  placeholder="cliente.seusite.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use subdomínio (plano Starter) ou domínio próprio (plano Pro).
                </p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="brand">Nome da Marca</Label>
              <Input
                id="brand"
                value={formData.brand_name}
                onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                placeholder="MeuPainel SMM"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan">Tipo de Plano</Label>
                <Select value={formData.plan_type} onValueChange={(value) => {
                  const fees = { starter: 297, professional: 597, enterprise: 997 };
                  setFormData({...formData, plan_type: value, monthly_fee: fees[value]});
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">
                      <div>
                        <div className="font-medium">Starter - R$ 297/mês</div>
                        <div className="text-xs text-gray-500">Subdomínio: cliente.seusite.com</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="professional">
                      <div>
                        <div className="font-medium">Professional - R$ 597/mês</div>
                        <div className="text-xs text-gray-500">Domínio próprio: paineldocliente.com</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <div>
                        <div className="font-medium">Enterprise - R$ 997/mês</div>
                        <div className="text-xs text-gray-500">Domínio próprio + funcionalidades extras</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="commission">Sua Comissão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={formData.commission_percentage}
                  onChange={(e) => setFormData({...formData, commission_percentage: parseFloat(e.target.value)})}
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp de Suporte (Cliente)</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                placeholder="5511999999999"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSite}>
              {editingSite ? 'Salvar Alterações' : 'Criar Site'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
