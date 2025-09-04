
import React, { useState, useEffect } from "react";
import { WhatsAppTemplate } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MessageSquare, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminWhatsAppTemplates() {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    message_template: '',
    is_active: true,
    delay_minutes: 0
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await WhatsAppTemplate.list();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      setAlert({ type: 'error', message: 'Erro ao carregar templates.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.trigger || !formData.message_template) {
      setAlert({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    try {
      if (editingTemplate) {
        await WhatsAppTemplate.update(editingTemplate.id, formData);
        setAlert({ type: 'success', message: 'Template atualizado com sucesso!' });
      } else {
        await WhatsAppTemplate.create(formData);
        setAlert({ type: 'success', message: 'Template criado com sucesso!' });
      }
      
      fetchTemplates();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao salvar template.' });
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      trigger: template.trigger,
      message_template: template.message_template,
      is_active: template.is_active,
      delay_minutes: template.delay_minutes || 0
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (templateId) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      try {
        await WhatsAppTemplate.delete(templateId);
        setAlert({ type: 'success', message: 'Template excluído com sucesso!' });
        fetchTemplates();
      } catch (error) {
        setAlert({ type: 'error', message: 'Erro ao excluir template.' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      trigger: '',
      message_template: '',
      is_active: true,
      delay_minutes: 0
    });
    setEditingTemplate(null);
  };

  const getTriggerLabel = (trigger) => {
    const triggers = {
      'order_created': 'Pedido Criado',
      'payment_approved': 'Pagamento Aprovado',
      'processing_started': 'Processamento Iniciado',
      'order_completed': 'Pedido Concluído',
      'pix_generated': 'PIX Gerado',
      'abandoned_cart': 'Carrinho Abandonado',
      'reactivation': 'Reativação de Cliente',
      'vip_promo': 'Promoção VIP',
      'upsell': 'Oferta Pós-Compra',
      'winback': 'Reconquista'
    };
    return triggers[trigger] || trigger;
  };

  const getTriggerDescription = (trigger) => {
    const descriptions = {
      'order_created': 'Enviado logo após o cliente preencher os dados e criar o pedido, antes mesmo do pagamento.',
      'payment_approved': 'Enviado assim que o pagamento do pedido é confirmado com sucesso.',
      'pix_generated': 'Enviado quando um PIX é gerado. A mensagem geralmente contém o código.',
      'processing_started': 'Enviado quando o pedido é aceito pelo fornecedor e entra na fila de processamento.',
      'order_completed': 'Enviado quando o fornecedor marca o pedido como totalmente concluído.',
      'abandoned_cart': 'Enviado após um tempo para clientes que geraram um PIX mas não pagaram.',
      'reactivation': 'Enviado para clientes inativos há algum tempo para incentivá-los a voltar.',
      'vip_promo': 'Enviado periodicamente para clientes VIP com ofertas especiais.',
      'upsell': 'Enviado após uma compra para oferecer um serviço complementar com desconto.',
      'winback': 'Enviado para clientes que não compram há muito tempo, com uma oferta forte de reconquista.'
    };
    return descriptions[trigger] || 'Nenhuma descrição disponível.';
  };

  const defaultTemplates = {
    'order_created': `🎉 *Pedido Criado com Sucesso!*

Olá! Seu pedido foi criado:

📋 *Serviço:* {{service_name}}
🆔 *ID:* {{order_id}}
💰 *Valor:* R$ {{order_value}}

Em breve você receberá o link de pagamento.

✅ *InstaFLY* - Seus resultados, nossa prioridade!`,

    'payment_approved': `✅ *Pagamento Aprovado!*

Parabéns! Seu pagamento foi confirmado:

🆔 *Pedido:* {{order_id}}
📋 *Serviço:* {{service_name}}

🚀 Seu pedido já está sendo processado!

⏱️ *Prazo de entrega:* 24-48 horas

*InstaFLY* - Obrigado pela confiança!`,

    'processing_started': `🚀 *Processamento Iniciado!*

Seu pedido está sendo processado:

🆔 *ID:* {{order_id}}
📋 *Serviço:* {{service_name}}

⏳ A entrega começará em breve!

*InstaFLY* - Acompanhe o progresso!`,

    'order_completed': `🎊 *Pedido Concluído!*

Seu pedido foi entregue com sucesso:

🆔 *ID:* {{order_id}}
📋 *Serviço:* {{service_name}}
✅ *Status:* Concluído

Obrigado por escolher a *InstaFLY*!

⭐ Que tal avaliar nosso serviço?`
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Templates WhatsApp</h1>
          <p className="text-gray-600 mt-2">Configure as mensagens automáticas enviadas aos seus clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
              <DialogDescription>Crie ou edite uma mensagem automática. Use as variáveis para personalizar.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Template *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Confirmação de Pedido"
                  />
                </div>
                
                <div>
                  <Label htmlFor="trigger">Quando Enviar (Gatilho) *</Label>
                  <Select 
                    value={formData.trigger} 
                    onValueChange={(value) => {
                      setFormData({...formData, trigger: value});
                      if (defaultTemplates[value] && !formData.message_template) {
                        setFormData(prev => ({...prev, message_template: defaultTemplates[value]}));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order_created">Pedido Criado</SelectItem>
                      <SelectItem value="payment_approved">Pagamento Aprovado</SelectItem>
                      <SelectItem value="pix_generated">PIX Gerado</SelectItem>
                      <SelectItem value="processing_started">Processamento Iniciado</SelectItem>
                      <SelectItem value="order_completed">Pedido Concluído</SelectItem>
                      <SelectItem value="abandoned_cart">Carrinho Abandonado</SelectItem>
                      <SelectItem value="reactivation">Reativação de Cliente</SelectItem>
                      <SelectItem value="vip_promo">Promoção VIP</SelectItem>
                      <SelectItem value="upsell">Oferta Pós-Compra</SelectItem>
                      <SelectItem value="winback">Reconquista</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* ADICIONADO: Descrição do Gatilho */}
                  {formData.trigger && (
                    <p className="text-xs text-blue-600 bg-blue-50 p-2 mt-2 rounded-md">
                      {getTriggerDescription(formData.trigger)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="delay">Atraso (minutos)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  value={formData.delay_minutes}
                  onChange={(e) => setFormData({...formData, delay_minutes: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Tempo de espera antes de enviar a mensagem</p>
              </div>

              <div>
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  value={formData.message_template}
                  onChange={(e) => setFormData({...formData, message_template: e.target.value})}
                  rows={8}
                  placeholder="Digite sua mensagem aqui..."
                />
                <div className="text-xs text-gray-500 mt-2">
                  <p className="font-medium mb-1">Variáveis disponíveis:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <span>{`{{order_id}}`} - ID do pedido</span>
                    <span>{`{{service_name}}`} - Nome do serviço</span>
                    <span>{`{{order_value}}`} - Valor do pedido</span>
                    <span>{`{{customer_name}}`} - Nome do cliente</span>
                    <span>{`{{tracking_link}}`} - Link de rastreamento</span>
                    <span>{`{{quantity}}`} - Quantidade</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="active">Template Ativo</Label>
                  <p className="text-sm text-gray-600">Se desabilitado, a mensagem não será enviada</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Templates Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Carregando templates...</p>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum template configurado ainda.</p>
              <p className="text-sm text-gray-500">Clique em "Novo Template" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Gatilho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atraso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTriggerLabel(template.trigger)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? "success" : "secondary"}>
                        {template.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.delay_minutes || 0} min</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
