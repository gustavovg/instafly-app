
import React, { useState, useEffect } from "react";
import { Settings } from "@/api/entities";
import { Coupon } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2, Sparkles, Settings as SettingsIcon, CreditCard, Link as LinkIcon, Puzzle, MessageSquare, Target, Clock, Gift, Users, TrendingUp, Heart, Zap, RefreshCw, Mail, Palette, Upload, BarChart3, Gem } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [bonusRules, setBonusRules] = useState([]);
  const [vipTiers, setVipTiers] = useState([]); // Add state for VIP tiers
  const [testingEvolution, setTestingEvolution] = useState(false);
  const [testingSync, setTestingSync] = useState(false); // New state for auto-sync test
  const [activeTab, setActiveTab] = useState("general");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsData, couponsData] = await Promise.all([
        Settings.list(),
        Coupon.list()
      ]);

      if (settingsData.length > 0) {
        setSettings(settingsData[0]);
        setBonusRules(settingsData[0].bonus_rules || []);
        // Initialize VIP Tiers from settings or with defaults
        setVipTiers(settingsData[0].vip_tiers || [
          { name: 'Bronze', min_spent: 100, discount_percentage: 2, icon: 'Gem', color: '#cd7f32' },
          { name: 'Prata', min_spent: 500, discount_percentage: 5, icon: 'Gem', color: '#c0c0c0' },
          { name: 'Ouro', min_spent: 1000, discount_percentage: 8, icon: 'Gem', color: '#ffd700' },
          { name: 'Diamante', min_spent: 2500, discount_percentage: 12, icon: 'Gem', color: '#b9f2ff' },
        ]);
      } else {
        const newSettings = await Settings.create({});
        setSettings(newSettings);
        setBonusRules([]);
        // Initialize VIP Tiers with defaults for new settings
        setVipTiers([
          { name: 'Bronze', min_spent: 100, discount_percentage: 2, icon: 'Gem', color: '#cd7f32' },
          { name: 'Prata', min_spent: 500, discount_percentage: 5, icon: 'Gem', color: '#c0c0c0' },
          { name: 'Ouro', min_spent: 1000, discount_percentage: 8, icon: 'Gem', color: '#ffd700' },
          { name: 'Diamante', min_spent: 2500, discount_percentage: 12, icon: 'Gem', color: '#b9f2ff' },
        ]);
      }

      setCoupons(couponsData.filter(c => c.is_active));
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao carregar configurações." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSettings({ ...settings, [id]: value });
  };

  const handleSwitchChange = (id, checked) => {
    setSettings({ ...settings, [id]: checked });
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    if (type === 'logo') setUploadingLogo(true);
    if (type === 'favicon') setUploadingFavicon(true);
    
    try {
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({ ...prev, [`${type}_url`]: file_url }));
      setAlert({ type: 'success', message: `${type === 'logo' ? 'Logo' : 'Favicon'} enviado com sucesso!` });
    } catch (error) {
      console.error("Upload error:", error);
      setAlert({ type: 'error', message: 'Erro ao fazer upload do arquivo. Por favor, tente usar o campo de URL.' });
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'favicon') setUploadingFavicon(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      // Include vip_tiers in the settings to save
      const settingsToSave = { ...settings, bonus_rules: bonusRules, vip_tiers: vipTiers };
      await Settings.update(settings.id, settingsToSave);
      setAlert({ type: "success", message: "Configurações salvas com sucesso!" });
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao salvar configurações." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRule = () => {
    setBonusRules([...bonusRules, { deposit_amount: 0, bonus_percentage: 0 }]);
  };

  const handleRemoveRule = (index) => {
    setBonusRules(bonusRules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...bonusRules];
    newRules[index][field] = parseFloat(value) || 0;
    setBonusRules(newRules);
  };

  const handleAddVipTier = () => {
    setVipTiers([...vipTiers, { name: '', min_spent: 0, discount_percentage: 0, icon: 'Gem', color: '#ffffff' }]);
  };

  const handleRemoveVipTier = (index) => {
    setVipTiers(vipTiers.filter((_, i) => i !== index));
  };

  const handleVipTierChange = (index, field, value) => {
    const newTiers = [...vipTiers];
    // Parse number fields to actual numbers
    if (field === 'min_spent' || field === 'discount_percentage') {
      newTiers[index][field] = parseFloat(value) || 0;
    } else {
      newTiers[index][field] = value;
    }
    setVipTiers(newTiers);
  };

  const handleTestEvolution = async () => {
    if (!settings.evolution_api_url || !settings.evolution_api_key || !settings.evolution_instance_name) {
      setAlert({ type: "error", message: "Por favor, preencha todos os campos da Evolution API antes de testar." });
      return;
    }

    if (!settings.whatsapp_support_number) {
        setAlert({ type: "error", message: "Por favor, preencha o campo 'Número de Suporte' na aba de Notificações antes de testar." });
        return;
    }

    setTestingEvolution(true);
    setAlert(null);

    try {
      const testMessage = "🎉 Teste da Evolution API realizado com sucesso! Sua integração está funcionando perfeitamente.";
      const testNumber = settings.whatsapp_support_number;

      const response = await fetch(`${settings.evolution_api_url}/message/sendText/${settings.evolution_instance_name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.evolution_api_key
        },
        body: JSON.stringify({
          number: testNumber,
          textMessage: { text: testMessage }
        })
      });

      if (response.ok) {
        setAlert({
          type: "success",
          message: `✅ Teste bem-sucedido! Mensagem enviada para ${testNumber}. Verifique seu WhatsApp.`
        });
      } else {
        const errorData = await response.json();
        console.error("Evolution API Error Data:", errorData);
        let detailedErrorMessage = `Erro HTTP ${response.status}`;
        if (typeof errorData === 'object' && errorData !== null) {
            detailedErrorMessage = errorData.message ||
                                 (errorData.data && errorData.data.message) ||
                                 (errorData.error && errorData.error.message) ||
                                 errorData.error ||
                                 JSON.stringify(errorData);
        }
        setAlert({
          type: "error",
          message: `❌ Falha no teste: ${detailedErrorMessage}. Verifique os dados, a URL e o status da sua instância.`
        });
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setAlert({
        type: "error",
        message: `❌ Erro de conexão: ${error.message}. Verifique se a URL está correta (use ngrok se local) e a API está rodando.`
      });
    } finally {
      setTestingEvolution(false);
    }
  };

  const testAutoSync = async () => {
    setTestingSync(true);
    setAlert(null);
    try {
      // Usar um ID fixo ou buscar dinamicamente
      const appId = '685953d58621f8559b1080f2'; // ID fixo da sua aplicação
      
      const { data, error } = await supabase.functions.invoke('auto-sync-orders', {
        body: { source: 'manual_test' }
      });
      
      // Simulate response format for compatibility
      const response = {
        ok: !error,
        status: error ? 500 : 200,
        json: async () => data || { message: error?.message }
      };

      if (response.ok) {
        const data = await response.json();
        console.log("Auto Sync Test Success Data:", data);
        setAlert({
          type: "success",
          message: `✅ Teste bem-sucedido! ${data.checked || 0} pedidos verificados, ${data.updated || 0} atualizados.`
        });
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText, status: response.status };
        }
        
        console.error("Auto Sync Test Error Data:", errorData);
        
        let detailedErrorMessage = `Erro HTTP ${response.status}`;
        if (errorData && typeof errorData === 'object') {
          if (errorData.message) {
            detailedErrorMessage = errorData.message;
          } else if (errorData.error) {
            detailedErrorMessage = errorData.error;
          } else if (errorData.details) {
            detailedErrorMessage = errorData.details;
          } else {
            detailedErrorMessage = JSON.stringify(errorData);
          }
        }
        
        setAlert({
          type: "error",
          message: `❌ Falha no teste: ${detailedErrorMessage}. Verifique os dados da API do provedor.`
        });
      }
    } catch (error) {
      console.error("Auto Sync Test Connection Error:", error);
      setAlert({
        type: "error",
        message: `❌ Erro de conexão: ${error.message || 'Erro desconhecido'}. Verifique sua conexão e as configurações.`
      });
    } finally {
      setTestingSync(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  // Define a special string value for "Nenhum cupom" to avoid issues with null in Select component
  const NULL_COUPON_VALUE = "_null_coupon_";

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Configurações Gerais</h1>
      <p className="text-gray-600 mb-8">Gerencie as configurações globais da sua plataforma.</p>

      {alert && (
        <Alert variant={alert.type === "error" ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-9 mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2"><SettingsIcon className="w-4 h-4"/> Geral</TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2"><CreditCard className="w-4 h-4"/> Pagamentos</TabsTrigger>
          <TabsTrigger value="provider" className="flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Fornecedor</TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> WhatsApp</TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/> E-mail</TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2"><Puzzle className="w-4 h-4"/> Recursos</TabsTrigger>
          <TabsTrigger value="vip" className="flex items-center gap-2"><Gem className="w-4 h-4"/> VIP</TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2"><Sparkles className="w-4 h-4"/> Badges</TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2"><Palette className="w-4 h-4"/> Tema</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Otimização para Buscadores (SEO)</CardTitle>
                <CardDescription>Configure como seu site aparece no Google e em outras buscas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="meta_title">Título do Site (Meta Title)</Label>
                  <Input id="meta_title" value={settings.meta_title || ""} onChange={handleInputChange} placeholder="InstaFLY - Compre Seguidores e Curtidas"/>
                  <p className="text-xs text-gray-500 mt-1">Ideal: 50-60 caracteres. Aparece na aba do navegador e nos resultados do Google.</p>
                </div>
                <div>
                  <Label htmlFor="meta_description">Descrição do Site (Meta Description)</Label>
                  <Textarea id="meta_description" value={settings.meta_description || ""} onChange={handleInputChange} placeholder="Aumente sua presença no Instagram com seguidores brasileiros e curtidas de alta qualidade. Entrega rápida e segura."/>
                   <p className="text-xs text-gray-500 mt-1">Ideal: 150-160 caracteres. Resumo que aparece abaixo do título no Google.</p>
                </div>
                <div>
                  <Label htmlFor="meta_keywords">Palavras-chave (Meta Keywords)</Label>
                  <Input id="meta_keywords" value={settings.meta_keywords || ""} onChange={handleInputChange} placeholder="comprar seguidores, seguidores instagram, curtidas instagram"/>
                   <p className="text-xs text-gray-500 mt-1">Separadas por vírgula. Ajuda a definir o foco do seu site.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comunicação e Suporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="whatsapp_chat_message">Mensagem Padrão do WhatsApp</Label>
                    <Input id="whatsapp_chat_message" value={settings.whatsapp_chat_message || ""} onChange={handleInputChange} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment">
           <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mercado Pago</CardTitle>
                <CardDescription>Configure suas chaves para processar pagamentos.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="mp_public_key">Public Key</Label>
                  <Input id="mp_public_key" value={settings.mp_public_key || ""} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="mp_access_token">Access Token (Chave de Produção)</Label>
                  <Input id="mp_access_token" type="password" value={settings.mp_access_token || ""} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="mp_client_id">Client ID</Label>
                  <Input id="mp_client_id" value={settings.mp_client_id || ""} onChange={handleInputChange} placeholder="Opcional, usado para validação avançada"/>
                </div>
                <div>
                  <Label htmlFor="mp_client_secret">Client Secret</Label>
                  <Input id="mp_client_secret" type="password" value={settings.mp_client_secret || ""} onChange={handleInputChange} placeholder="Essencial para segurança do webhook"/>
                   <p className="text-xs text-gray-500 mt-1">Copie do seu painel de desenvolvedor do Mercado Pago.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Bônus por Depósito na Carteira
                </CardTitle>
                <CardDescription>Incentive seus clientes a adicionar mais saldo oferecendo bônus.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_wallet_bonus"
                    checked={settings.enable_wallet_bonus || false}
                    onCheckedChange={(checked) => handleSwitchChange("enable_wallet_bonus", checked)}
                  />
                  <Label htmlFor="enable_wallet_bonus">Habilitar sistema de bônus</Label>
                </div>

                {settings.enable_wallet_bonus && (
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <Label>Regras de Bônus</Label>
                    {bonusRules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-4 p-2 border rounded-md">
                        <span className="text-sm font-medium">Se depositar pelo menos</span>
                        <Input
                          type="number"
                          value={rule.deposit_amount}
                          onChange={(e) => handleRuleChange(index, "deposit_amount", e.target.value)}
                          className="w-32"
                          placeholder="R$ 100"
                        />
                        <span className="text-sm font-medium">ganha</span>
                        <Input
                          type="number"
                          value={rule.bonus_percentage}
                          onChange={(e) => handleRuleChange(index, "bonus_percentage", e.target.value)}
                          className="w-24"
                          placeholder="10"
                        />
                        <span className="text-sm font-medium">% de bônus.</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRule(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddRule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Regra
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
           </div>
        </TabsContent>

        <TabsContent value="provider">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fornecedor de Serviços</CardTitle>
                <CardDescription>Configure a integração com sua API de serviços SMM.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="provider_api_url">URL da API</Label>
                  <Input id="provider_api_url" value={settings.provider_api_url || ""} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="provider_api_key">Chave da API</Label>
                  <Input id="provider_api_key" type="password" value={settings.provider_api_key || ""} onChange={handleInputChange} />
                </div>
              </CardContent>
            </Card>

            {/* Sincronização Automática */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sincronização Automática
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_sync_enabled">Sincronização Automática</Label>
                    <p className="text-sm text-gray-600">
                      Sincroniza automaticamente o status dos pedidos com o provedor
                    </p>
                  </div>
                  <Switch
                    id="auto_sync_enabled"
                    checked={settings.auto_sync_enabled || false}
                    onCheckedChange={(checked) => handleSwitchChange("auto_sync_enabled", checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="sync_interval_minutes">Intervalo de Sincronização (minutos)</Label>
                  <Input
                    id="sync_interval_minutes"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.sync_interval_minutes || 10} // Default to 10 if not set
                    onChange={(e) => setSettings({...settings, sync_interval_minutes: parseInt(e.target.value) || 10})}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Recomendado: 10 minutos (não use menos que 5 minutos para evitar sobrecarga)
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Como Configurar o Cron Job</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Para a sincronização automática funcionar, você precisa configurar um Cron Job que chame esta URL:
                  </p>
                  <div className="bg-blue-100 p-2 rounded font-mono text-sm break-all">
                    {import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-sync-orders
                  </div>
                  <p className="text-sm text-blue-800 mt-2">
                    <strong>Método:</strong> POST<br />
                    <strong>Frequência:</strong> A cada {settings?.sync_interval_minutes || 10} minutos<br />
                    <strong>Exemplo cron:</strong> <code>*/{settings?.sync_interval_minutes || 10} * * * *</code>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 <strong>Dica:</strong> Use serviços como cron-job.org, EasyCron ou configure no seu servidor/hosting.
                  </p>
                </div>

                <Button 
                  onClick={testAutoSync}
                  disabled={testingSync}
                  className="w-full"
                >
                  {testingSync ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testando Sincronização...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Testar Sincronização Agora
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp">
          <div className="space-y-6">
            {/* Toggle para Habilitar Botão Flutuante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Botão Flutuante do WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure se o botão flutuante do WhatsApp deve aparecer no site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="whatsapp_support_enabled"
                    checked={settings.whatsapp_support_enabled !== false}
                    onCheckedChange={(checked) => handleSwitchChange("whatsapp_support_enabled", checked)}
                  />
                  <Label htmlFor="whatsapp_support_enabled">Mostrar botão flutuante do WhatsApp no site</Label>
                </div>
                <p className="text-sm text-gray-600">
                  O botão flutuante permite que os visitantes entrem em contato diretamente via WhatsApp. 
                  Desabilite se você não quer que apareçam dois botões de suporte.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Configuração do WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure qual API do WhatsApp usar para enviar notificações automáticas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="whatsapp_api_type">Tipo de API do WhatsApp</Label>
                  <Select value={settings.whatsapp_api_type || 'official'} onValueChange={(value) => setSettings({...settings, whatsapp_api_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de API" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">API Oficial do WhatsApp Business</SelectItem>
                      <SelectItem value="evolution">Evolution API (Gratuita)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.whatsapp_api_type === 'evolution' ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <h4 className="font-semibold text-blue-800">Configurações da Evolution API</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="evolution_api_url">URL da Evolution API</Label>
                        <Input
                          id="evolution_api_url"
                          value={settings.evolution_api_url || ""}
                          onChange={handleInputChange}
                          placeholder="http://192.168.0.1:8080"
                        />
                      </div>
                      <div>
                        <Label htmlFor="evolution_api_key">Chave da API</Label>
                        <Input
                          id="evolution_api_key"
                          type="password"
                          value={settings.evolution_api_key || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="evolution_instance_name">Nome da Instância</Label>
                      <Input
                        id="evolution_instance_name"
                        value={settings.evolution_instance_name || ""}
                        onChange={handleInputChange}
                        placeholder="minha-instancia"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-blue-600">
                        <p><strong>Vantagens:</strong> Gratuita, não precisa aprovação do Meta, funciona via WhatsApp Web</p>
                        <p><strong>Desvantagem:</strong> Menos estável que a API oficial</p>
                      </div>
                      <Button
                        onClick={handleTestEvolution}
                        disabled={testingEvolution}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {testingEvolution ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Testar API
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
                    <h4 className="font-semibold text-green-800">Configurações da API Oficial</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="whatsapp_phone_id">ID do Número de Telefone</Label>
                        <Input
                          id="whatsapp_phone_id"
                          value={settings.whatsapp_phone_id || ""}
                          onChange={handleInputChange}
                          placeholder="102030405060708"
                        />
                      </div>
                      <div>
                        <Label htmlFor="whatsapp_api_token">Token de Acesso</Label>
                        <Input
                          id="whatsapp_api_token"
                          type="password"
                          value={settings.whatsapp_api_token || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-green-600">
                      <p><strong>Vantagens:</strong> Oficial, mais estável, melhor entregabilidade</p>
                      <p><strong>Desvantagem:</strong> Requer aprovação do Meta e verificação de negócio</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="whatsapp_support_number">Número de Suporte (Mesmo para ambas APIs)</Label>
                  <Input
                    id="whatsapp_support_number"
                    value={settings.whatsapp_support_number || ""}
                    onChange={handleInputChange}
                    placeholder="5511999999999"
                  />
                  <p className="text-xs text-gray-500 mt-1">Formato: código do país + DDD + número (sem espaços)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Sistema de Notificações Inteligentes (Remarketing)
                </CardTitle>
                <CardDescription>
                  Automatize campanhas de marketing para aumentar vendas e reativar clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="intelligent_notifications_enabled"
                    checked={settings.intelligent_notifications_enabled || false}
                    onCheckedChange={(checked) => handleSwitchChange("intelligent_notifications_enabled", checked)}
                  />
                  <Label htmlFor="intelligent_notifications_enabled" className="font-medium">
                    Habilitar todas as notificações inteligentes
                  </Label>
                </div>

                {settings.intelligent_notifications_enabled && (
                  <div className="space-y-8">

                    <div className="p-6 border rounded-lg bg-orange-50 border-orange-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-orange-800">Recuperação de Carrinho Abandonado</h4>
                          <p className="text-sm text-orange-600">
                            <strong>Estratégia:</strong> Quando um cliente gera um PIX mas não paga, enviamos um lembrete com desconto especial.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="abandoned_cart_enabled"
                            checked={settings.abandoned_cart_enabled !== false}
                            onCheckedChange={(checked) => handleSwitchChange("abandoned_cart_enabled", checked)}
                          />
                          <Label htmlFor="abandoned_cart_enabled">Ativar recuperação de carrinho abandonado</Label>
                        </div>

                        {settings.abandoned_cart_enabled !== false && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="abandoned_cart_delay_hours">Enviar após (horas)</Label>
                              <Input
                                id="abandoned_cart_delay_hours"
                                type="number"
                                min="1"
                                max="48"
                                value={settings.abandoned_cart_delay_hours || 1}
                                onChange={handleInputChange}
                              />
                              <p className="text-xs text-orange-600 mt-1">
                                Tempo para enviar o lembrete após o PIX ser gerado
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="abandoned_cart_coupon_code">Cupom oferecido</Label>
                              <Select 
                                value={settings.abandoned_cart_coupon_code === null ? NULL_COUPON_VALUE : settings.abandoned_cart_coupon_code || ""} 
                                onValueChange={(val) => setSettings({...settings, abandoned_cart_coupon_code: val === NULL_COUPON_VALUE ? null : val})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cupom" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NULL_COUPON_VALUE}>Nenhum cupom</SelectItem>
                                  {coupons.map(coupon => (
                                    <SelectItem key={coupon.id} value={coupon.code}>
                                      {coupon.code} - {coupon.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-800">Reativação de Clientes Inativos</h4>
                          <p className="text-sm text-blue-600">
                            <strong>Estratégia:</strong> Identifica clientes que não compram há tempo e oferece incentivos para retornarem.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="reactivation_enabled"
                            checked={settings.reactivation_enabled !== false}
                            onCheckedChange={(checked) => handleSwitchChange("reactivation_enabled", checked)}
                          />
                          <Label htmlFor="reactivation_enabled">Ativar reativação de clientes</Label>
                        </div>

                        {settings.reactivation_enabled !== false && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="reactivation_delay_days">Cliente inativo após (dias)</Label>
                              <Input
                                id="reactivation_delay_days"
                                type="number"
                                min="7"
                                max="365"
                                value={settings.reactivation_delay_days || 30}
                                onChange={handleInputChange}
                              />
                              <p className="text-xs text-blue-600 mt-1">
                                Tempo sem compras para ser considerado inativo
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="reactivation_coupon_code">Cupom de reativação</Label>
                              <Select 
                                value={settings.reactivation_coupon_code === null ? NULL_COUPON_VALUE : settings.reactivation_coupon_code || ""} 
                                onValueChange={(val) => setSettings({...settings, reactivation_coupon_code: val === NULL_COUPON_VALUE ? null : val})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cupom" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NULL_COUPON_VALUE}>Nenhum cupom</SelectItem>
                                  {coupons.map(coupon => (
                                    <SelectItem key={coupon.id} value={coupon.code}>
                                      {coupon.code} - {coupon.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-purple-50 border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-purple-800">Promoções para Clientes VIP</h4>
                          <p className="text-sm text-purple-600">
                            <strong>Estratégia:</strong> Identifica seus melhores clientes e oferece promoções exclusivas periodicamente.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="vip_promo_enabled"
                            checked={settings.vip_promo_enabled !== false}
                            onCheckedChange={(checked) => handleSwitchChange("vip_promo_enabled", checked)}
                          />
                          <Label htmlFor="vip_promo_enabled">Ativar promoções VIP</Label>
                        </div>

                        {settings.vip_promo_enabled !== false && (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="vip_promo_min_orders">Mín. de pedidos para VIP</Label>
                                <Input
                                  id="vip_promo_min_orders"
                                  type="number"
                                  min="1"
                                  value={settings.vip_promo_min_orders || 3}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <Label htmlFor="vip_promo_min_spent">Valor mín. gasto (R$)</Label>
                                <Input
                                  id="vip_promo_min_spent"
                                  type="number"
                                  min="100"
                                  value={settings.vip_promo_min_spent || 300}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <Label htmlFor="vip_promo_frequency_days">Frequência (dias)</Label>
                                <Input
                                  id="vip_promo_frequency_days"
                                  type="number"
                                  min="1"
                                  max="30"
                                  value={settings.vip_promo_frequency_days || 7}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="vip_promo_coupon_code">Cupom VIP</Label>
                              <Select 
                                value={settings.vip_promo_coupon_code === null ? NULL_COUPON_VALUE : settings.vip_promo_coupon_code || ""} 
                                onValueChange={(val) => setSettings({...settings, vip_promo_coupon_code: val === NULL_COUPON_VALUE ? null : val})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cupom" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NULL_COUPON_VALUE}>Nenhum cupom</SelectItem>
                                  {coupons.map(coupon => (
                                    <SelectItem key={coupon.id} value={coupon.code}>
                                      {coupon.code} - {coupon.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-green-800">Ofertas de Upsell Pós-Compra</h4>
                          <p className="text-sm text-green-600">
                            <strong>Estratégia:</strong> Após uma compra bem-sucedida, oferece serviços complementares com desconto.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="upsell_enabled"
                            checked={settings.upsell_enabled !== false}
                            onCheckedChange={(checked) => handleSwitchChange("upsell_enabled", checked)}
                          />
                          <Label htmlFor="upsell_enabled">Ativar ofertas de upsell</Label>
                        </div>

                        {settings.upsell_enabled !== false && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="upsell_delay_hours">Enviar após (horas)</Label>
                              <Input
                                id="upsell_delay_hours"
                                type="number"
                                min="1"
                                max="168"
                                value={settings.upsell_delay_hours || 24}
                                onChange={handleInputChange}
                              />
                              <p className="text-xs text-green-600 mt-1">
                                Tempo após a compra para enviar a oferta
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="upsell_coupon_code">Cupom de upsell</Label>
                              <Select 
                                value={settings.upsell_coupon_code === null ? NULL_COUPON_VALUE : settings.upsell_coupon_code || ""} 
                                onValueChange={(val) => setSettings({...settings, upsell_coupon_code: val === NULL_COUPON_VALUE ? null : val})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cupom" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NULL_COUPON_VALUE}>Nenhum cupom</SelectItem>
                                  {coupons.map(coupon => (
                                    <SelectItem key={coupon.id} value={coupon.code}>
                                      {coupon.code} - {coupon.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-red-800">Reconquista de Clientes Perdidos</h4>
                          <p className="text-sm text-red-600">
                            <strong>Estratégia:</strong> Para clientes que não compram há muito tempo, oferece promoções irresistíveis.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="winback_enabled"
                            checked={settings.winback_enabled !== false}
                            onCheckedChange={(checked) => handleSwitchChange("winback_enabled", checked)}
                          />
                          <Label htmlFor="winback_enabled">Ativar reconquista de clientes</Label>
                        </div>

                        {settings.winback_enabled !== false && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="winback_delay_days">Cliente perdido após (dias)</Label>
                              <Input
                                id="winback_delay_days"
                                type="number"
                                min="30"
                                max="365"
                                value={settings.winback_delay_days || 60}
                                onChange={handleInputChange}
                              />
                              <p className="text-xs text-red-600 mt-1">
                                Tempo sem compras para tentar reconquistar
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="winback_coupon_code">Cupom de reconquista</Label>
                              <Select 
                                value={settings.winback_coupon_code === null ? NULL_COUPON_VALUE : settings.winback_coupon_code || ""} 
                                onValueChange={(val) => setSettings({...settings, winback_coupon_code: val === NULL_COUPON_VALUE ? null : val})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cupom" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NULL_COUPON_VALUE}>Nenhum cupom</SelectItem>
                                  {coupons.map(coupon => (
                                    <SelectItem key={coupon.id} value={coupon.code}>
                                      {coupon.code} - {coupon.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-yellow-800">Promoções de Aniversário</h4>
                          <p className="text-sm text-yellow-600">
                            <strong>Estratégia:</strong> Envia ofertas especiais no aniversário do cliente (se coletarmos a data).
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="birthday_promo_enabled"
                            checked={settings.birthday_promo_enabled || false}
                            onCheckedChange={(checked) => handleSwitchChange("birthday_promo_enabled", checked)}
                          />
                          <Label htmlFor="birthday_promo_enabled">Ativar promoções de aniversário</Label>
                        </div>

                        {settings.birthday_promo_enabled && (
                          <div>
                            <Label htmlFor="birthday_promo_coupon_code">Cupom de aniversário</Label>
                            <Select 
                              value={settings.birthday_promo_coupon_code === null ? NULL_COUPON_VALUE : settings.birthday_promo_coupon_code || ""} 
                              onValueChange={(val) => setSettings({...settings, birthday_promo_coupon_code: val === NULL_COUPON_VALUE ? null : val})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um cupom" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NULL_COUPON_VALUE}>Nenhum cupom</SelectItem>
                                {coupons.map(coupon => (
                                  <SelectItem key={coupon.id} value={coupon.code}>
                                    {coupon.code} - {coupon.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Configurações de E-mail
                </CardTitle>
                <CardDescription>Configure as notificações por e-mail para seus clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <Label htmlFor="enable_email_notifications" className="font-bold">
                      Enviar E-mails de Confirmação
                    </Label>
                    <p className="text-sm text-blue-700 mt-1">
                      Ativa o envio automático de e-mails quando pedidos são criados
                    </p>
                  </div>
                  <Switch
                    id="enable_email_notifications"
                    checked={settings.enable_email_notifications || false}
                    onCheckedChange={(checked) => setSettings({...settings, enable_email_notifications: checked})}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                {settings.enable_email_notifications && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-800">Templates de E-mail</h4>
                    
                    <div>
                      <Label htmlFor="email_subject_template">Assunto do E-mail</Label>
                      <Input
                        id="email_subject_template"
                        value={settings.email_subject_template || ""}
                        onChange={handleInputChange}
                        placeholder="Pedido #{{order_id}} - InstaFLY"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Use <code>{`{{order_id}}`}</code> para incluir o ID do pedido
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="email_body_template">Corpo do E-mail</Label>
                      <textarea
                        id="email_body_template"
                        value={settings.email_body_template || ""}
                        onChange={handleInputChange}
                        rows={8}
                        className="w-full p-3 border border-gray-300 rounded-md"
                        placeholder={`Olá!

Seu pedido foi criado com sucesso:

🆔 ID do Pedido: {{order_id}}
📋 Serviço: {{service_name}}

🔗 Acompanhe seu pedido: {{tracking_link}}

Atenciosamente,
Equipe InstaFLY`}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Variáveis disponíveis: <code>{`{{order_id}}`}</code>, <code>{`{{service_name}}`}</code>, <code>{`{{tracking_link}}`}</code>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Módulos Extras</CardTitle>
              <CardDescription>Habilite ou desabilite funcionalidades adicionais da plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="enable_coupons">Habilitar cupons de desconto</Label>
                <Switch
                  id="enable_coupons"
                  checked={settings.enable_coupons || false}
                  onCheckedChange={(checked) => handleSwitchChange("enable_coupons", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="enable_affiliates">Habilitar sistema de afiliados</Label>
                  <Switch
                    id="enable_affiliates"
                    checked={settings.enable_affiliates || false}
                    onCheckedChange={(checked) => handleSwitchChange("enable_affiliates", checked)}
                  />
              </div>

              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_express_priority">Habilitar prioridade express</Label>
                  <Switch
                    id="enable_express_priority"
                    checked={settings.enable_express_priority || false}
                    onCheckedChange={(checked) => handleSwitchChange("enable_express_priority", checked)}
                  />
                </div>
                {settings.enable_express_priority && (
                  <div className="pt-4 border-t">
                    <Label htmlFor="express_priority_fee_percentage">Taxa Prioridade Express (%)</Label>
                    <Input
                      id="express_priority_fee_percentage"
                      type="number"
                      value={settings.express_priority_fee_percentage || 30}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gem className="w-5 h-5 text-purple-500" />
                        Programa de Fidelidade VIP
                    </CardTitle>
                    <CardDescription>
                        Crie níveis de fidelidade para recompensar seus melhores clientes com descontos progressivos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="enable_vip_program"
                            // If settings.enable_vip_program is undefined, default to true (enabled)
                            checked={settings.enable_vip_program !== false}
                            onCheckedChange={(checked) => handleSwitchChange("enable_vip_program", checked)}
                        />
                        <Label htmlFor="enable_vip_program">Habilitar programa VIP</Label>
                    </div>

                    {settings.enable_vip_program !== false && (
                        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                            <Label>Níveis VIP</Label>
                            {vipTiers.sort((a,b) => a.min_spent - b.min_spent).map((tier, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-6 items-center gap-4 p-3 border rounded-md bg-white">
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Gem className="w-5 h-5" style={{ color: tier.color }} />
                                        <Input
                                            value={tier.name}
                                            onChange={(e) => handleVipTierChange(index, "name", e.target.value)}
                                            placeholder="Nome do Nível (Ex: Bronze)"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Gasto Mínimo (R$)</Label>
                                        <Input
                                            type="number"
                                            value={tier.min_spent}
                                            onChange={(e) => handleVipTierChange(index, "min_spent", e.target.value)}
                                            placeholder="100"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Desconto (%)</Label>
                                        <Input
                                            type="number"
                                            value={tier.discount_percentage}
                                            onChange={(e) => handleVipTierChange(index, "discount_percentage", e.target.value)}
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                      <div>
                                        <Label className="text-xs">Cor</Label>
                                        <Input
                                            type="color"
                                            value={tier.color}
                                            onChange={(e) => handleVipTierChange(index, "color", e.target.value)}
                                            className="p-1 h-10"
                                        />
                                      </div>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveVipTier(index)}
                                          className="text-red-500 hover:text-red-700"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={handleAddVipTier}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Nível VIP
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Badges Personalizados
              </CardTitle>
              <CardDescription>
                Defina os textos dos badges que aparecerão nos serviços para destacar características.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="custom_badge_popular">Badge - Serviços Populares</Label>
                <Input
                  id="custom_badge_popular"
                  value={settings.custom_badge_popular || ""}
                  onChange={handleInputChange}
                  placeholder="🔥 MAIS VENDIDO"
                />
                <p className="text-xs text-gray-500 mt-1">Badge exibido em serviços marcados como populares</p>
              </div>

              <div>
                <Label htmlFor="custom_badge_brazilian">Badge - Serviços Brasileiros</Label>
                <Input
                  id="custom_badge_brazilian"
                  value={settings.custom_badge_brazilian || ""}
                  onChange={handleInputChange}
                  placeholder="🇧🇷 BRASILEIROS"
                />
                <p className="text-xs text-gray-500 mt-1">Badge exibido em serviços brasileiros</p>
              </div>

              <div>
                <Label htmlFor="custom_badge_instagram">Badge - Instagram</Label>
                <Input
                  id="custom_badge_instagram"
                  value={settings.custom_badge_instagram || ""}
                  onChange={handleInputChange}
                  placeholder="⚡ ENTREGA 30MIN"
                />
                <p className="text-xs text-gray-500 mt-1">Badge específico para serviços do Instagram</p>
              </div>

              <div>
                <Label htmlFor="custom_badge_youtube">Badge - YouTube</Label>
                <Input
                  id="custom_badge_youtube"
                  value={settings.custom_badge_youtube || ""}
                  onChange={handleInputChange}
                  placeholder="📈 MONETIZÁVEL"
                />
                <p className="text-xs text-gray-500 mt-1">Badge específico para serviços do YouTube</p>
              </div>

              <div>
                <Label htmlFor="custom_badge_default">Badge - Padrão</Label>
                <Input
                  id="custom_badge_default"
                  value={settings.custom_badge_default || ""}
                  onChange={handleInputChange}
                  placeholder="✅ ALTA QUALIDADE"
                />
                <p className="text-xs text-gray-500 mt-1">Badge padrão para outros serviços (aparece se nenhum específico for configurado ou aplicável)</p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Dicas para Badges Eficazes</AlertTitle>
            <AlertDescription>
              • Use emojis para chamar atenção: 🔥 ⚡ 🇧🇷 📈<br />
              • Mantenha textos curtos (máx. 20 caracteres)<br />
              • Destaque benefícios únicos: velocidade, qualidade, origem<br />
              • Teste diferentes versões para ver qual converte melhor
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="theme">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Identidade Visual
                </CardTitle>
                <CardDescription>Personalize a aparência da sua plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="brand_name">Nome da Marca</Label>
                  <Input 
                    id="brand_name" 
                    value={settings.brand_name || ""} 
                    onChange={handleInputChange} 
                    placeholder="InstaFLY"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* UPLOAD DE LOGO */}
                  <div>
                    <Label htmlFor="logo_url_input">Logo da Marca</Label>
                    <div className="flex items-center gap-4 mt-2">
                      {settings.logo_url && (
                        <img src={settings.logo_url} alt="Logo" className="h-12 w-auto bg-gray-100 rounded-md p-1 object-contain" />
                      )}
                      <div className="flex-1 space-y-2">
                         <Input
                          id="logo_url_input"
                          value={settings.logo_url || ""}
                          onChange={(e) => setSettings({...settings, logo_url: e.target.value})}
                          placeholder="Cole a URL da imagem aqui"
                        />
                        <div className="flex items-center gap-2">
                          <label htmlFor="file_upload_logo" className="flex-1">
                            <Button
                              asChild
                              variant="outline"
                              className="w-full cursor-pointer"
                              disabled={uploadingLogo}
                            >
                              <span>
                                {uploadingLogo ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Enviar Imagem
                                  </>
                                )}
                              </span>
                            </Button>
                          </label>
                          <input
                            id="file_upload_logo"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                            disabled={uploadingLogo}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Cole a URL de uma imagem já hospedada ou envie um arquivo.</p>
                  </div>
                  
                  {/* UPLOAD DE FAVICON */}
                  <div>
                    <Label htmlFor="favicon_url_input">Ícone do Site (Favicon)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      {settings.favicon_url && (
                        <img src={settings.favicon_url} alt="Favicon" className="h-12 w-12 bg-gray-100 rounded-md p-1 object-contain" />
                      )}
                       <div className="flex-1 space-y-2">
                         <Input
                          id="favicon_url_input"
                          value={settings.favicon_url || ""}
                          onChange={(e) => setSettings({...settings, favicon_url: e.target.value})}
                          placeholder="Cole a URL do ícone aqui"
                        />
                        <div className="flex items-center gap-2">
                          <label htmlFor="file_upload_favicon" className="flex-1">
                            <Button
                              asChild
                              variant="outline"
                              className="w-full cursor-pointer"
                              disabled={uploadingFavicon}
                            >
                              <span>
                                {uploadingFavicon ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Enviar Imagem
                                  </>
                                )}
                              </span>
                            </Button>
                          </label>
                          <input
                            id="file_upload_favicon"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], 'favicon')}
                            disabled={uploadingFavicon}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Recomendado: 32x32 pixels para favicon, 192x192 ou 512x512 para PWA. Cole a URL ou envie um arquivo.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="primary_color" 
                        type="color"
                        value={settings.primary_color || "#3b82f6"} 
                        onChange={handleInputChange} 
                        className="w-16 h-10"
                      />
                      <Input 
                        value={settings.primary_color || "#3b82f6"} 
                        onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="secondary_color" 
                        type="color"
                        value={settings.secondary_color || "#8b5cf6"} 
                        onChange={handleInputChange} 
                        className="w-16 h-10"
                      />
                      <Input 
                        value={settings.secondary_color || "#8b5cf6"} 
                        onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                        placeholder="#8b5cf6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
                <CardDescription>Veja como ficará sua marca</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-lg">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="h-12 object-contain" />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
                      style={{ background: `linear-gradient(to right, ${settings.primary_color || '#3b82f6'}, ${settings.secondary_color || '#8b5cf6'})` }}
                    >
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <span 
                    className="text-2xl font-bold bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(to right, ${settings.primary_color || '#3b82f6'}, ${settings.secondary_color || '#8b5cf6'})` }}
                  >
                    {settings.brand_name || 'InstaFLY'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" /> : null}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
