
import React, { useState, useEffect } from "react";
import { ChatbotFlow } from "@/api/entities";
import { ChatbotSettings } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Eye,
  Bot,
  ArrowRight,
  Settings,
  Palette,
  MessageCircle,
  Zap,
  ShoppingCart
} from "lucide-react";

export default function AdminChatbot() {
  const [flows, setFlows] = useState([]);
  const [chatbotSettings, setChatbotSettings] = useState(null);
  const [editingFlow, setEditingFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState("settings"); // New state for active tab

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flowsData, settingsData] = await Promise.all([
        ChatbotFlow.list("order_index"),
        ChatbotSettings.list()
      ]);
      
      setFlows(flowsData);
      if (settingsData.length > 0) {
        setChatbotSettings(settingsData[0]);
      } else {
        // Criar configurações padrão se não existir
        const defaultSettings = {
          is_enabled: true,
          widget_title: "Assistente de Vendas",
          widget_subtitle: "Vou te ajudar a encontrar o serviço perfeito!",
          welcome_message: "Olá! 👋 Sou o assistente do InstaFLY.\nComo posso te ajudar hoje?",
          bot_name: "Assistente InstaFLY",
          bot_avatar_color: "#3b82f6",
          primary_color: "#3b82f6",
          secondary_color: "#8b5cf6",
          quick_actions: [
            {
              text: "🛍️ Ver Serviços",
              icon: "ShoppingCart", // icon is placeholder, not directly used in current preview
              action_type: "redirect",
              action_value: "#services",
              is_primary: true
            },
            {
              text: "💬 Suporte WhatsApp",
              icon: "MessageSquare", // icon is placeholder, not directly used in current preview
              action_type: "contact",
              action_value: "", // WhatsApp number or link if needed, but 'contact' type assumes internal handling
              is_primary: false
            }
          ],
          auto_open_delay: 5,
          show_on_pages: ["Home", "instagram", "youtube", "tiktok", "facebook", "kwai"], // Example, not used in this admin page
          typing_speed: 25,
          show_powered_by: true
        };
        const created = await ChatbotSettings.create(defaultSettings);
        setChatbotSettings(created);
      }
    } catch (error) {
      console.error("Failed to fetch chatbot data:", error);
      setAlert({ type: "error", message: "Erro ao carregar dados do chatbot." });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setAlert(null);
    
    try {
      if (chatbotSettings.id) {
        await ChatbotSettings.update(chatbotSettings.id, chatbotSettings);
      } else {
        const created = await ChatbotSettings.create(chatbotSettings);
        setChatbotSettings(created);
      }
      setAlert({ type: "success", message: "Configurações do chatbot salvas com sucesso!" });
    } catch (error) {
      console.error("Failed to save chatbot settings:", error);
      setAlert({ type: "error", message: "Erro ao salvar configurações." });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFlow = async (flowData) => {
    setSaving(true);
    setAlert(null);
    
    try {
      if (editingFlow?.id) {
        await ChatbotFlow.update(editingFlow.id, flowData);
        setAlert({ type: "success", message: "Fluxo atualizado com sucesso!" });
      } else {
        await ChatbotFlow.create(flowData);
        setAlert({ type: "success", message: "Fluxo criado com sucesso!" });
      }
      
      setEditingFlow(null);
      fetchData(); // Fetch all data again to ensure both flows and settings are up-to-date
    } catch (error) {
      console.error("Failed to save flow:", error);
      setAlert({ type: "error", message: "Erro ao salvar fluxo." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFlow = async (flowId) => {
    if (!confirm("Tem certeza que deseja excluir este fluxo?")) return;
    
    try {
      await ChatbotFlow.delete(flowId);
      setAlert({ type: "success", message: "Fluxo excluído com sucesso!" });
      fetchData(); // Fetch all data again
    } catch (error) {
      console.error("Failed to delete flow:", error);
      setAlert({ type: "error", message: "Erro ao excluir fluxo." });
    }
  };

  const handleCreateDefaultFlows = async () => {
    const defaultFlows = [
      {
        step_name: 'welcome',
        message_text: 'Olá! 👋 Como posso te ajudar hoje?',
        options: [
          { text: '📈 Seguidores', value: 'followers', next_step: 'select_platform_followers' },
          { text: '❤️ Curtidas', value: 'likes', next_step: 'select_platform_likes' },
          { text: '👀 Visualizações', value: 'views', next_step: 'select_platform_views' },
          { text: '💬 Falar com Humano', value: 'human', next_step: 'contact_human' }
        ],
        order_index: 1,
        is_active: true,
        is_final_step: false,
        show_services: false
      },
      {
        step_name: 'select_platform_followers',
        message_text: 'Perfeito! Para qual plataforma você precisa de seguidores?',
        options: [
          { text: '📷 Instagram', value: 'Instagram', next_step: 'show_instagram_followers' },
          { text: '🎥 YouTube', value: 'YouTube', next_step: 'show_youtube_followers' },
          { text: '🎵 TikTok', value: 'TikTok', next_step: 'show_tiktok_followers' },
          { text: '👥 Facebook', value: 'Facebook', next_step: 'show_facebook_followers' }
        ],
        order_index: 2,
        is_active: true,
        is_final_step: false,
        show_services: false
      },
      {
        step_name: 'show_instagram_followers',
        message_text: 'Ótima escolha! Aqui estão nossos serviços de seguidores para Instagram:',
        show_services: true,
        service_filters: { platform: 'Instagram', service_type: 'followers' },
        options: [],
        order_index: 3,
        is_active: true,
        is_final_step: true // This might be a final step, or lead to more options/details
      }
    ];

    try {
      for (const flow of defaultFlows) {
        await ChatbotFlow.create(flow);
      }
      setAlert({ type: "success", message: "Fluxos padrão criados com sucesso!" });
      fetchData();
    } catch (error) {
      console.error("Failed to create default flows:", error);
      setAlert({ type: "error", message: "Erro ao criar fluxos padrão." });
    }
  };

  const updateQuickAction = (index, field, value) => {
    const newActions = [...chatbotSettings.quick_actions];
    newActions[index][field] = value;
    setChatbotSettings({ ...chatbotSettings, quick_actions: newActions });
  };

  const addQuickAction = () => {
    const newActions = [...(chatbotSettings.quick_actions || []), {
      text: "Novo Botão",
      icon: "MessageSquare",
      action_type: "redirect",
      action_value: "",
      is_primary: false
    }];
    setChatbotSettings({ ...chatbotSettings, quick_actions: newActions });
  };

  const removeQuickAction = (index) => {
    const newActions = chatbotSettings.quick_actions.filter((_, i) => i !== index);
    setChatbotSettings({ ...chatbotSettings, quick_actions: newActions });
  };

  const FlowEditor = ({ flow, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      step_name: flow?.step_name || '',
      message_text: flow?.message_text || '',
      options: flow?.options || [{ text: '', value: '', next_step: '' }],
      is_final_step: flow?.is_final_step || false,
      show_services: flow?.show_services || false,
      service_filters: flow?.service_filters || {},
      order_index: flow?.order_index || 0,
      is_active: flow?.is_active !== false // Default to true if undefined
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    const addOption = () => {
      setFormData({
        ...formData,
        options: [...formData.options, { text: '', value: '', next_step: '' }]
      });
    };

    const removeOption = (index) => {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    };

    const updateOption = (index, field, value) => {
      const newOptions = [...formData.options];
      newOptions[index][field] = value;
      setFormData({ ...formData, options: newOptions });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{flow ? 'Editar Fluxo' : 'Novo Fluxo'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="step_name">Nome do Passo</Label>
                <Input
                  id="step_name"
                  value={formData.step_name}
                  onChange={(e) => setFormData({ ...formData, step_name: e.target.value })}
                  placeholder="ex: welcome, select_service"
                  required
                />
              </div>
              <div>
                <Label htmlFor="order_index">Ordem</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message_text">Mensagem do Bot</Label>
              <Textarea
                id="message_text"
                value={formData.message_text}
                onChange={(e) => setFormData({ ...formData, message_text: e.target.value })}
                placeholder="Digite a mensagem que o bot enviará..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Opções de Resposta</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <Label className="text-xs">Texto do Botão</Label>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder="Ex: Ver Serviços"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Valor</Label>
                    <Input
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      placeholder="Ex: services"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Próximo Passo</Label>
                    <Input
                      value={option.next_step}
                      onChange={(e) => updateOption(index, 'next_step', e.target.value)}
                      placeholder="Ex: show_services"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOption} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show_services"
                  checked={formData.show_services}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_services: checked })}
                />
                <Label htmlFor="show_services">Mostrar Serviços</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_final_step"
                  checked={formData.is_final_step}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_final_step: checked })}
                />
                <Label htmlFor="is_final_step">Passo Final</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
            </div>

            {formData.show_services && (
              <Card className="p-4 bg-gray-50">
                <CardTitle className="text-md mb-2">Filtros de Serviço</CardTitle>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="service_filter_platform">Plataforma</Label>
                    <Input
                      id="service_filter_platform"
                      value={formData.service_filters?.platform || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        service_filters: { ...formData.service_filters, platform: e.target.value } 
                      })}
                      placeholder="Ex: Instagram"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_filter_type">Tipo de Serviço</Label>
                    <Input
                      id="service_filter_type"
                      value={formData.service_filters?.service_type || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        service_filters: { ...formData.service_filters, service_type: e.target.value } 
                      })}
                      placeholder="Ex: followers"
                    />
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Save className="w-4 h-4 mr-2 animate-spin" /> : null}
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center">Carregando configurações do chatbot...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Configuração do Chatbot</h1>
            <p className="text-gray-600">Configure o assistente de vendas do seu site</p>
          </div>
        </div>
        <div className="flex gap-2">
          {flows.length === 0 && (
            <Button onClick={handleCreateDefaultFlows} variant="outline">
              Criar Fluxos Padrão
            </Button>
          )}
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? <Save className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Configurações
          </Button>
        </div>
      </div>

      {alert && (
        <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Configurações Gerais
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="flows">
            <MessageCircle className="w-4 h-4 mr-2" />
            Fluxos de Conversa
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Visualização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Básicas</CardTitle>
                <CardDescription>
                  Configure os textos e comportamento principal do chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_enabled"
                    checked={chatbotSettings?.is_enabled}
                    onCheckedChange={(checked) => setChatbotSettings({...chatbotSettings, is_enabled: checked})}
                  />
                  <Label htmlFor="is_enabled">Habilitar chatbot no site</Label>
                </div>

                <div>
                  <Label htmlFor="widget_title">Título do Widget</Label>
                  <Input
                    id="widget_title"
                    value={chatbotSettings?.widget_title || ''}
                    onChange={(e) => setChatbotSettings({...chatbotSettings, widget_title: e.target.value})}
                    placeholder="Ex: Assistente de Vendas"
                  />
                  <p className="text-xs text-gray-500 mt-1">Aparece no cabeçalho do chatbot</p>
                </div>

                <div>
                  <Label htmlFor="widget_subtitle">Subtítulo do Widget</Label>
                  <Input
                    id="widget_subtitle"
                    value={chatbotSettings?.widget_subtitle || ''}
                    onChange={(e) => setChatbotSettings({...chatbotSettings, widget_subtitle: e.target.value})}
                    placeholder="Ex: Vou te ajudar a encontrar o serviço perfeito!"
                  />
                  <p className="text-xs text-gray-500 mt-1">Descrição que aparece abaixo do título</p>
                </div>

                <div>
                  <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="welcome_message"
                    value={chatbotSettings?.welcome_message || ''}
                    onChange={(e) => setChatbotSettings({...chatbotSettings, welcome_message: e.target.value})}
                    rows={3}
                    placeholder="Olá! 👋 Sou o assistente do InstaFLY. Como posso te ajudar hoje?"
                  />
                  <p className="text-xs text-gray-500 mt-1">Primeira mensagem que o bot envia</p>
                </div>

                <div>
                  <Label htmlFor="bot_name">Nome do Bot</Label>
                  <Input
                    id="bot_name"
                    value={chatbotSettings?.bot_name || ''}
                    onChange={(e) => setChatbotSettings({...chatbotSettings, bot_name: e.target.value})}
                    placeholder="Ex: Assistente InstaFLY"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nome que aparece nas mensagens do bot</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auto_open_delay">Abertura Automática (segundos)</Label>
                    <Input
                      id="auto_open_delay"
                      type="number"
                      min="0"
                      value={chatbotSettings?.auto_open_delay || 0}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, auto_open_delay: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = nunca abrir automaticamente</p>
                  </div>

                  <div>
                    <Label htmlFor="typing_speed">Velocidade de Digitação (ms)</Label>
                    <Input
                      id="typing_speed"
                      type="number"
                      min="10"
                      max="100"
                      value={chatbotSettings?.typing_speed || 25}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, typing_speed: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Menor = mais rápido (10-100)</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show_powered_by"
                    checked={chatbotSettings?.show_powered_by}
                    onCheckedChange={(checked) => setChatbotSettings({...chatbotSettings, show_powered_by: checked})}
                  />
                  <Label htmlFor="show_powered_by">Mostrar "Powered by InstaFLY"</Label>
                  <p className="text-xs text-gray-500">(Desabilite para white-label)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Botões de Ação Rápida</CardTitle>
                <CardDescription>
                  Configure os botões que aparecem na mensagem de boas-vindas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chatbotSettings?.quick_actions?.map((action, index) => (
                  <div key={index} className="grid grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                    <div>
                      <Label className="text-xs">Texto do Botão</Label>
                      <Input
                        value={action.text}
                        onChange={(e) => updateQuickAction(index, 'text', e.target.value)}
                        placeholder="Ex: Ver Serviços"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Tipo de Ação</Label>
                      <Select value={action.action_type} onValueChange={(value) => updateQuickAction(index, 'action_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="redirect">Redirecionar para URL/Seletor</SelectItem>
                          <SelectItem value="contact">Contato WhatsApp</SelectItem>
                          <SelectItem value="start_flow">Iniciar Fluxo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">
                        {action.action_type === 'redirect' ? 'URL/Seletor' : action.action_type === 'contact' ? 'Número WhatsApp (opcional)' : 'Nome do Passo'}
                      </Label>
                      <Input
                        value={action.action_value}
                        onChange={(e) => updateQuickAction(index, 'action_value', e.target.value)}
                        placeholder={action.action_type === 'redirect' ? '#services ou /servicos' : action.action_type === 'contact' ? 'Opcional: 5511999999999' : 'welcome'}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={action.is_primary}
                        onCheckedChange={(checked) => updateQuickAction(index, 'is_primary', checked)}
                      />
                      <Label className="text-xs">Principal</Label>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeQuickAction(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addQuickAction} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Botão
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Personalização Visual</CardTitle>
              <CardDescription>
                Configure as cores e aparência do chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Cor Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={chatbotSettings?.primary_color || '#3b82f6'}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, primary_color: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={chatbotSettings?.primary_color || '#3b82f6'}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, primary_color: e.target.value})}
                      placeholder="#3b82f6"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cor dos botões e cabeçalho</p>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={chatbotSettings?.secondary_color || '#8b5cf6'}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, secondary_color: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={chatbotSettings?.secondary_color || '#8b5cf6'}
                      onChange={(e) => setChatbotSettings({...chatbotSettings, secondary_color: e.target.value})}
                      placeholder="#8b5cf6"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cor para gradientes e destaques</p>
                </div>
              </div>

              <div>
                <Label htmlFor="bot_avatar_color">Cor do Avatar do Bot</Label>
                <div className="flex gap-2">
                  <Input
                    id="bot_avatar_color"
                    type="color"
                    value={chatbotSettings?.bot_avatar_color || '#3b82f6'}
                    onChange={(e) => setChatbotSettings({...chatbotSettings, bot_avatar_color: e.target.value})}
                    className="w-16 h-10"
                  />
                  <Input
                    value={chatbotSettings?.bot_avatar_color || '#3b82f6'}
                    onChange={(e) => setChatbotSettings({...chatbotSettings, bot_avatar_color: e.target.value})}
                    placeholder="#3b82f6"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Cor de fundo do avatar do bot</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows">
          {editingFlow ? (
            <FlowEditor
              flow={editingFlow.id ? editingFlow : null}
              onSave={handleSaveFlow}
              onCancel={() => setEditingFlow(null)}
            />
          ) : (
            <div className="space-y-4">
              <Button onClick={() => setEditingFlow({})} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Novo Fluxo de Conversa
              </Button>
              {flows.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fluxo configurado</h3>
                    <p className="text-gray-600 mb-4">
                      Configure fluxos de conversa para guiar seus clientes até o serviço ideal.
                    </p>
                    <Button onClick={handleCreateDefaultFlows}>
                      Criar Fluxos Padrão
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                flows.map((flow) => (
                  <Card key={flow.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={flow.is_active ? "default" : "secondary"}>
                              {flow.step_name}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Ordem: {flow.order_index}
                            </span>
                            {flow.show_services && (
                              <Badge variant="outline">Mostra Serviços</Badge>
                            )}
                            {flow.is_final_step && (
                              <Badge variant="outline">Passo Final</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {flow.message_text.substring(0, 100)}
                            {flow.message_text.length > 100 ? '...' : ''}
                          </p>
                          {flow.options && flow.options.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {flow.options.map((opt, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {opt.text}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingFlow(flow)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteFlow(flow.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Chatbot</CardTitle>
              <CardDescription>
                Prévia de como o chatbot aparecerá para seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg border overflow-hidden">
                {/* Header */}
                <div 
                  className="p-4 text-white text-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${chatbotSettings?.primary_color || '#3b82f6'}, ${chatbotSettings?.secondary_color || '#8b5cf6'})` 
                  }}
                >
                  <h3 className="font-bold text-lg">{chatbotSettings?.widget_title || 'Assistente de Vendas'}</h3>
                  <p className="text-sm opacity-90">{chatbotSettings?.widget_subtitle || 'Vou te ajudar a encontrar o serviço perfeito!'}</p>
                </div>

                {/* Messages */}
                <div className="p-4 space-y-3 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
                  <div className="flex items-end gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                      style={{ backgroundColor: chatbotSettings?.bot_avatar_color || '#3b82f6' }}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white rounded-lg rounded-bl-none p-3 shadow-sm max-w-[80%]">
                      <p className="text-sm whitespace-pre-wrap">
                        {chatbotSettings?.welcome_message || 'Olá! 👋 Sou o assistente do InstaFLY.\nComo posso te ajudar hoje?'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {chatbotSettings?.quick_actions?.map((action, index) => (
                          <button
                            key={index}
                            className={`text-xs py-2 px-3 rounded-full border transition-colors ${
                              action.is_primary 
                                ? 'text-white' 
                                : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300'
                            }`}
                            style={action.is_primary ? { 
                              background: `linear-gradient(135deg, ${chatbotSettings?.primary_color || '#3b82f6'}, ${chatbotSettings?.secondary_color || '#8b5cf6'})`,
                              border: 'none'
                            } : {}}
                          >
                            {action.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                 {/* Input Area (dummy) */}
                <div className="p-3 border-t bg-white flex items-center gap-2">
                  <Input placeholder="Escreva sua mensagem..." disabled />
                  <Button size="icon" disabled><Zap className="w-4 h-4" /></Button>
                </div>
                {chatbotSettings?.show_powered_by && (
                  <div className="text-center text-xs text-gray-500 py-1 border-t">
                    Powered by InstaFLY
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Esta é uma prévia estática. As interações e transições de fluxo não são funcionais aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
