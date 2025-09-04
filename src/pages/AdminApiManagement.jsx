
import React, { useState, useEffect } from 'react';
import { ApiKey } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Key, Plus, Eye, EyeOff, Copy, DollarSign, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AdminApiManagement() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [newKey, setNewKey] = useState({
    user_email: '',
    plan_type: 'basic',
    markup_percentage: 20,
    monthly_limit: 1000
  });
  const [showSecrets, setShowSecrets] = useState({});

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await ApiKey.list('-created_date');
      setApiKeys(keys);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar chaves de API' });
    } finally {
      setLoading(false);
    }
  };

  const generateApiCredentials = () => {
    const apiKey = 'ak_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const apiSecret = 'as_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return { apiKey, apiSecret };
  };

  const handleCreateApiKey = async () => {
    try {
      const { apiKey, apiSecret } = generateApiCredentials();
      
      const keyData = {
        ...newKey,
        api_key: apiKey,
        api_secret: apiSecret,
        monthly_limit: newKey.monthly_limit || null
      };

      await ApiKey.create(keyData);
      
      setAlert({ type: 'success', message: 'Chave de API criada com sucesso!' });
      setShowCreateModal(false);
      setNewKey({ user_email: '', plan_type: 'basic', markup_percentage: 20, monthly_limit: 1000 });
      loadApiKeys();
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao criar chave de API' });
    }
  };

  const toggleApiStatus = async (id, currentStatus) => {
    try {
      await ApiKey.update(id, { is_active: !currentStatus });
      setAlert({ type: 'success', message: `API ${!currentStatus ? 'ativada' : 'desativada'} com sucesso` });
      loadApiKeys();
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao atualizar status da API' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setAlert({ type: 'success', message: 'Copiado para a área de transferência!' });
  };

  const toggleShowSecret = (keyId) => {
    setShowSecrets(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getPlanBadgeColor = (plan) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-gold-100 text-gold-800'
    };
    return colors[plan] || colors.basic;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar API para Revendedores</h1>
          <p className="text-gray-600 mt-2">Crie e gerencie chaves de API para seus revendedores</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Chave de API
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
            <CardTitle className="text-sm font-medium text-gray-600">Total de APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">APIs Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {apiKeys.filter(key => key.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {apiKeys.reduce((sum, key) => sum + (key.total_earnings || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Uso Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {apiKeys.reduce((sum, key) => sum + (key.used_this_month || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de APIs */}
      <div className="grid gap-6">
        {apiKeys.map(apiKey => (
          <Card key={apiKey.id} className={`${!apiKey.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    {apiKey.user_email}
                    <Badge className={getPlanBadgeColor(apiKey.plan_type)}>
                      {apiKey.plan_type}
                    </Badge>
                    {!apiKey.is_active && <Badge variant="secondary">Inativa</Badge>}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Markup: {apiKey.markup_percentage}% | 
                    Limite: {apiKey.monthly_limit || 'Ilimitado'} | 
                    Usado: {apiKey.used_this_month || 0}
                  </p>
                </div>
                <Button
                  onClick={() => toggleApiStatus(apiKey.id, apiKey.is_active)}
                  variant={apiKey.is_active ? "destructive" : "default"}
                  size="sm"
                >
                  {apiKey.is_active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">API Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                    {apiKey.api_key}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(apiKey.api_key)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">API Secret</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                    {showSecrets[apiKey.id] ? apiKey.api_secret : '••••••••••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleShowSecret(apiKey.id)}
                  >
                    {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(apiKey.api_secret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    R$ {(apiKey.total_earnings || 0).toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {apiKey.used_this_month || 0} pedidos
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.href = createPageUrl('AdminApiDocumentation')}
                >
                  Ver Documentação
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Criação */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Chave de API</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email do Revendedor</Label>
              <Input
                id="email"
                type="email"
                value={newKey.user_email}
                onChange={(e) => setNewKey({...newKey, user_email: e.target.value})}
                placeholder="revendedor@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="plan">Tipo de Plano</Label>
              <Select value={newKey.plan_type} onValueChange={(value) => setNewKey({...newKey, plan_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico - R$ 50/mês</SelectItem>
                  <SelectItem value="premium">Premium - R$ 150/mês</SelectItem>
                  <SelectItem value="enterprise">Enterprise - R$ 300/mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="markup">Markup (%)</Label>
              <Input
                id="markup"
                type="number"
                value={newKey.markup_percentage}
                onChange={(e) => setNewKey({...newKey, markup_percentage: parseFloat(e.target.value)})}
                placeholder="20"
              />
            </div>

            <div>
              <Label htmlFor="limit">Limite Mensal (deixe vazio para ilimitado)</Label>
              <Input
                id="limit"
                type="number"
                value={newKey.monthly_limit}
                onChange={(e) => setNewKey({...newKey, monthly_limit: e.target.value ? parseInt(e.target.value) : null})}
                placeholder="1000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateApiKey}>
              Criar Chave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
