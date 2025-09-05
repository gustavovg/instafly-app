
import React, { useState, useEffect, useCallback } from "react";
import { Service } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Star, Lock, ThumbsUp, Shield, Clock, MessageSquare, CheckCircle, Zap, GripVertical, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getServiceCost } from "@/api/functions";

const featureIcons = {
  Star, Lock, ThumbsUp, Shield, Clock, MessageSquare, CheckCircle, Zap
};

const defaultFeatures = [
  { icon: "Star", text: "Alta qualidade" },
  { icon: "ThumbsUp", text: "Alta retenção" },
  { icon: "Zap", text: "Monetizável" },
  { icon: "Lock", text: "Não precisa da senha" },
  { icon: "ThumbsUp", text: "Garantia contra quedas" },
  { icon: "Shield", text: "Seguro e Fácil" },
  { icon: "Clock", text: "Entrega Rápida" },
  { icon: "MessageSquare", text: "Suporte 24 horas" },
  { icon: "CheckCircle", text: "Pagamentos Seguros" },
];

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isOrderSaving, setIsOrderSaving] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [fetchingCost, setFetchingCost] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    service_type: "",
    default_quantity: 1000,
    price_per_thousand: 0,
    cost_per_thousand: 0,
    min_quantity: 100,
    max_quantity: 10000,
    is_brazilian: false,
    features: [],
    is_active: true,
    provider_service_id: "",
    badge_type: "none",
    is_popular: false,
    show_in_homepage: false // Novo campo
  });

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Service.list("order_index"); // Fetch services sorted by order_index
      setServices(data);
    }
    catch (error) {
      console.error("Error loading services:", error);
      setAlert({ type: "error", message: "Erro ao carregar serviços." });
    } finally {
      setLoading(false);
      setOrderChanged(false); // Reset orderChanged on fresh load
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Function to normalize service data to match the new entity structure
  const normalizeServiceData = (service) => {
    return {
      name: service.name || "",
      platform: service.platform || "",
      service_type: service.service_type || service.category || "",
      default_quantity: service.default_quantity || 1000,
      price_per_thousand: service.price_per_thousand || service.price_per_1000 || 0,
      cost_per_thousand: service.cost_per_thousand || 0,
      min_quantity: service.min_quantity || 100,
      max_quantity: service.max_quantity || 10000,
      is_brazilian: service.is_brazilian || false,
      features: Array.isArray(service.features) 
        ? service.features.map(feature => 
            typeof feature === 'string' 
              ? { icon: "Star", text: feature }
              : feature
          )
        : [],
      is_active: service.is_active !== false,
      provider_service_id: service.provider_service_id || "",
      order_index: service.order_index || 0,
      badge_type: service.badge_type || "none",
      is_popular: service.is_popular || false,
      show_in_homepage: service.show_in_homepage || false // Novo
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      if (editingService) {
        await Service.update(editingService.id, formData);
        setAlert({ type: "success", message: "Serviço atualizado com sucesso!" });
      } else {
        // When creating a new service, assign a new order_index
        const newOrderIndex = (services || []).length > 0 ? Math.max(...(services || []).map(s => s.order_index || 0)) + 1 : 0;
        await Service.create({ ...formData, order_index: newOrderIndex });
        setAlert({ type: "success", message: "Serviço criado com sucesso!" });
      }
      
      setShowModal(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      setAlert({ type: "error", message: `Erro ao salvar serviço: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      platform: "",
      service_type: "",
      default_quantity: 1000,
      price_per_thousand: 0,
      cost_per_thousand: 0,
      min_quantity: 100,
      max_quantity: 10000,
      is_brazilian: false,
      features: [],
      is_active: true,
      provider_service_id: "",
      badge_type: "none",
      is_popular: false,
      show_in_homepage: false // Novo
    });
    setEditingService(null);
  };

  const handleEdit = (service) => {
    const normalizedService = normalizeServiceData(service);
    setFormData(normalizedService);
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await Service.delete(id);
        loadServices();
        setAlert({ type: "success", message: "Serviço excluído com sucesso!" });
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
        setAlert({ type: "error", message: `Erro ao excluir serviço: ${error.message}` });
      }
    }
  };

  const handleFeatureToggle = (feature) => {
    const exists = formData.features.some(f => f.icon === feature.icon && f.text === feature.text);
    if (exists) {
      setFormData({
        ...formData,
        features: formData.features.filter(f => !(f.icon === feature.icon && f.text === feature.text))
      });
    } else {
      setFormData({
        ...formData,
        features: [...formData.features, feature]
      });
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setServices(items);
    setOrderChanged(true);
  };
  
  const handleSaveOrder = async () => {
    setIsOrderSaving(true);
    setAlert(null);
    try {
      // Update each service with its new order_index and normalized data
      const updatePromises = (services || []).map((service, index) => {
        const normalizedData = normalizeServiceData(service);
        return Service.update(service.id, { ...normalizedData, order_index: index });
      });
      
      await Promise.all(updatePromises);
      setAlert({ type: "success", message: "Ordem dos serviços salva com sucesso!" });
      setOrderChanged(false);
      await loadServices(); // Reload to get updated data
    } catch (error) {
      console.error("Erro ao salvar a ordem dos serviços:", error);
      setAlert({ type: "error", message: "Não foi possível salvar a nova ordem." });
    } finally {
      setIsOrderSaving(false);
    }
  };

  const handleProviderServiceIdChange = async (e) => {
    const serviceId = e.target.value;
    setFormData({...formData, provider_service_id: serviceId});
    setAlert(null); // Clear previous alerts

    if (serviceId && serviceId.length > 0) {
      setFetchingCost(true);
      try {
        const { data, status } = await getServiceCost({ serviceId });
        
        if (status >= 200 && status < 300) {
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            cost_per_thousand: data.rate || prev.cost_per_thousand,
            min_quantity: data.min || prev.min_quantity,
            max_quantity: data.max || prev.max_quantity
          }));
          setAlert({ type: "success", message: "✅ Dados do serviço carregados automaticamente!" });
        } else {
            setAlert({ type: "error", message: `Erro: ${data.error || 'Não foi possível carregar os dados.'}` });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do serviço:", err);
        
        // Check if it's a 404 error (service not found)
        if (err?.response?.status === 404 || err?.response?.data?.error?.toLowerCase().includes('não encontrado')) {
          setAlert({ 
            type: "warning", 
            message: `⚠️ ID "${serviceId}" não encontrado. Verifique o ID do serviço diretamente no painel do seu fornecedor. Se o ID estiver correto e o erro persistir, pode ser um problema com a API do fornecedor.` 
          });
        } else {
          // Other types of errors
          const errorMessage = err?.response?.data?.error || "Erro de conexão com a API do fornecedor. Verifique as configurações.";
          setAlert({ type: "error", message: `❌ ${errorMessage}` });
        }
      } finally {
        setFetchingCost(false);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Serviços</h1>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : (alert.type === 'warning' ? 'warning' : 'default')} className="mb-6">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {orderChanged && (
        <Alert className="mb-6 border-blue-500 text-blue-800">
           <AlertTitle className="flex items-center gap-2">Ordem Modificada</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            Você alterou a ordem dos serviços. Clique em salvar para aplicar as mudanças.
             <Button onClick={handleSaveOrder} disabled={isOrderSaving}>
                {isOrderSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                Salvar Ordem
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead> {/* For drag handle */}
                  <TableHead>Nome</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Preço/1k</TableHead>
                  <TableHead>Custo/1k</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="7">Carregando serviços...</TableCell>
                  </TableRow>
                ) : (
                  <Droppable droppableId="services">
                    {(provided) => (
                      <>
                        {(services || []).map((service, index) => (
                          <Draggable key={service.id} draggableId={service.id} index={index}>
                            {(provided) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <TableCell {...provided.dragHandleProps}>
                                  <GripVertical className="text-gray-400 cursor-grab" />
                                </TableCell>
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell>{service.platform}</TableCell>
                                <TableCell>R$ {(service.price_per_thousand || service.price_per_1000 || 0).toFixed(2)}</TableCell>
                                <TableCell>R$ {(service.cost_per_thousand || 0).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge variant={service.is_active !== false ? "success" : "destructive"}>
                                    {service.is_active !== false ? "Ativo" : "Inativo"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        ))}
                        <tr style={{ display: 'none' }} ref={provided.innerRef} {...provided.droppableProps}>
                          {provided.placeholder}
                        </tr>
                      </>
                    )}
                  </Droppable>
                )}
              </TableBody>
            </Table>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar Serviço */}
      <Dialog open={showModal} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setShowModal(isOpen); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Seguidores Brasileiros"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="platform">Plataforma *</Label>
                <Select required value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Kwai">Kwai</SelectItem> {/* Adicionado */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_type">Tipo de Serviço *</Label>
                <Select required value={formData.service_type} onValueChange={(value) => setFormData({...formData, service_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="followers">Seguidores</SelectItem>
                    <SelectItem value="likes">Curtidas</SelectItem>
                    <SelectItem value="views">Visualizações</SelectItem>
                    <SelectItem value="comments">Comentários</SelectItem>
                    <SelectItem value="shares">Compartilhamentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="default_quantity">Quantidade Padrão *</Label>
                <Input
                  id="default_quantity"
                  type="number"
                  value={formData.default_quantity}
                  onChange={(e) => setFormData({...formData, default_quantity: parseInt(e.target.value) || 0})}
                  placeholder="1000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <Label htmlFor="price_per_thousand">Preço de Venda (por 1000) *</Label>
                <Input
                  id="price_per_thousand"
                  type="number"
                  step="0.01"
                  value={formData.price_per_thousand}
                  onChange={(e) => setFormData({...formData, price_per_thousand: parseFloat(e.target.value) || 0})}
                  placeholder="59.99"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost_per_thousand">Custo do Serviço (por 1000)</Label>
                <Input
                  id="cost_per_thousand"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_thousand}
                  onChange={(e) => setFormData({...formData, cost_per_thousand: parseFloat(e.target.value) || 0})}
                  placeholder="29.99"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_quantity">Quantidade Mínima *</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({...formData, min_quantity: parseInt(e.target.value) || 0})}
                  placeholder="100"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="max_quantity">Quantidade Máxima *</Label>
                <Input
                  id="max_quantity"
                  type="number"
                  value={formData.max_quantity}
                  onChange={(e) => setFormData({...formData, max_quantity: parseInt(e.target.value) || 0})}
                  placeholder="10000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="provider_service_id">ID do Serviço no Provedor</Label>
              <div className="relative">
                <Input
                  id="provider_service_id"
                  value={formData.provider_service_id}
                  onChange={handleProviderServiceIdChange}
                  placeholder="Ex: 123, 456, 789..."
                />
                {fetchingCost && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  💡 Os dados do serviço serão carregados automaticamente quando você inserir um ID válido
                </p>
                <p className="text-xs text-gray-400">
                  Se o ID não for encontrado, você pode preencher os dados manualmente
                </p>
              </div>
            </div>

            {/* Combined Switches */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_brazilian"
                  checked={formData.is_brazilian}
                  onCheckedChange={(checked) => setFormData({...formData, is_brazilian: checked})}
                />
                <Label htmlFor="is_brazilian">Serviço Brasileiro</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Serviço Ativo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({...formData, is_popular: checked})}
                />
                <Label htmlFor="is_popular">Serviço Popular</Label>
              </div>

              {/* Novo: Switch para mostrar na Homepage */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="show_in_homepage"
                  checked={formData.show_in_homepage}
                  onCheckedChange={(checked) => setFormData({...formData, show_in_homepage: checked})}
                />
                <Label htmlFor="show_in_homepage">🏠 Mostrar na Homepage</Label>
              </div>
            </div>

            {/* Seleção de Badge */}
            <div>
              <Label htmlFor="badge_type">Badge do Serviço</Label>
              <Select value={formData.badge_type} onValueChange={(value) => setFormData({...formData, badge_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o badge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum Badge</SelectItem>
                  <SelectItem value="popular">🔥 Mais Vendido</SelectItem>
                  <SelectItem value="brazilian">🇧🇷 Brasileiros</SelectItem>
                  <SelectItem value="fast">⚡ Entrega Rápida</SelectItem>
                  <SelectItem value="quality">✅ Alta Qualidade</SelectItem>
                  <SelectItem value="monetizable">📈 Monetizável</SelectItem>
                  <SelectItem value="safe">🛡️ Seguro</SelectItem>
                  <SelectItem value="guaranteed">💯 Garantido</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Escolha qual badge aparecerá no card deste serviço (substitui as configurações automáticas)
              </p>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Características do Serviço</Label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                {defaultFeatures.map((feature, index) => {
                  const IconComponent = featureIcons[feature.icon];
                  const isSelected = formData.features.some(f => f.icon === feature.icon && f.text === feature.text);
                  
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${index}`}
                        checked={isSelected}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={`feature-${index}`} className="flex items-center gap-2 cursor-pointer">
                        {IconComponent && <IconComponent className="w-4 h-4 text-green-600" />}
                        <span className="text-sm">{feature.text}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : (editingService ? "Atualizar" : "Criar Serviço")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
