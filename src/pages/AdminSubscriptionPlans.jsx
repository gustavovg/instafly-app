import React, { useState, useEffect } from "react";
import { SubscriptionPlan } from "@/api/entities";
import { Service } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Star, Zap, Rocket, Crown, Package, X, Loader2 } from "lucide-react";

const planIcons = { Star, Zap, Rocket, Crown };

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    services_included: [],
    icon: "Star",
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansData, servicesData] = await Promise.all([
        SubscriptionPlan.list(),
        Service.list(),
      ]);
      setPlans(plansData);
      setAllServices(servicesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setAlert({ type: "error", message: "Erro ao carregar dados." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        services_included: plan.services_included.map(s => ({...s})), // Create a deep copy
        icon: plan.icon || "Star",
        is_active: plan.is_active,
        is_featured: plan.is_featured,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        services_included: [{ service_id: "", service_name: "", quantity: 1000 }],
        icon: "Star",
        is_active: true,
        is_featured: false,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      const planData = { ...formData, price: parseFloat(formData.price) };
      if (editingPlan) {
        await SubscriptionPlan.update(editingPlan.id, planData);
        setAlert({ type: "success", message: "Plano atualizado com sucesso!" });
      } else {
        await SubscriptionPlan.create(planData);
        setAlert({ type: "success", message: "Plano criado com sucesso!" });
      }
      fetchData();
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save plan:", error);
      setAlert({ type: "error", message: "Erro ao salvar o plano." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Tem certeza que deseja excluir este plano?")) {
      try {
        await SubscriptionPlan.delete(planId);
        setAlert({ type: "success", message: "Plano excluído com sucesso!" });
        fetchData();
      } catch (error) {
        console.error("Failed to delete plan:", error);
        setAlert({ type: "error", message: "Erro ao excluir o plano." });
      }
    }
  };

  const handleServiceChange = (index, serviceId) => {
    const service = allServices.find(s => s.id === serviceId);
    if (!service) return;

    const newServices = [...formData.services_included];
    newServices[index] = { ...newServices[index], service_id: service.id, service_name: service.name };
    setFormData({ ...formData, services_included: newServices });
  };

  const handleQuantityChange = (index, quantity) => {
    const newServices = [...formData.services_included];
    newServices[index].quantity = parseInt(quantity, 10) || 0;
    setFormData({ ...formData, services_included: newServices });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services_included: [...formData.services_included, { service_id: "", service_name: "", quantity: 1000 }]
    });
  };

  const removeService = (index) => {
    setFormData({
      ...formData,
      services_included: formData.services_included.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Planos de Assinatura</h1>
          <p className="text-gray-600 mt-1">Crie e gerencie os planos de assinatura mensal.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {alert && <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6"><AlertDescription>{alert.message}</AlertDescription></Alert>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Preço Mensal</TableHead>
                <TableHead>Serviços Inclusos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="6" className="text-center">Carregando planos...</TableCell></TableRow>
              ) : (
                plans.map(plan => {
                  const PlanIcon = planIcons[plan.icon] || Star;
                  return (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <PlanIcon className="w-5 h-5 text-blue-500" />
                          <span>{plan.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>R$ {plan.price.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-sm">
                          {plan.services_included.map(s => (
                            <li key={s.service_id}>{s.quantity.toLocaleString('pt-BR')} {s.service_name}</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>{plan.is_active ? "Ativo" : "Inativo"}</TableCell>
                      <TableCell>{plan.is_featured ? "Sim" : "Não"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(plan)} className="mr-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar Plano" : "Criar Novo Plano"}</DialogTitle>
            <DialogDescription>Preencha os detalhes do plano de assinatura.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Plano Influencer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço Mensal (R$)</Label>
                <Input id="price" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="Ex: 199.90" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva os benefícios do plano" />
            </div>

            <div className="space-y-4">
              <Label>Serviços Inclusos</Label>
              <div className="space-y-3 p-4 border rounded-md">
                {formData.services_included.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select value={service.service_id} onValueChange={value => handleServiceChange(index, value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger>
                        <SelectContent>
                          {(allServices || []).map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.platform})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Input type="number" value={service.quantity} onChange={e => handleQuantityChange(index, e.target.value)} placeholder="Qtd." />
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeService(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addService}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Serviço
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Ícone do Plano</Label>
                <Select value={formData.icon} onValueChange={value => setFormData({...formData, icon: value})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Star"><div className="flex items-center gap-2"><Star className="w-4 h-4"/> Padrão</div></SelectItem>
                    <SelectItem value="Zap"><div className="flex items-center gap-2"><Zap className="w-4 h-4"/> Rápido</div></SelectItem>
                    <SelectItem value="Rocket"><div className="flex items-center gap-2"><Rocket className="w-4 h-4"/> Crescimento</div></SelectItem>
                    <SelectItem value="Crown"><div className="flex items-center gap-2"><Crown className="w-4 h-4"/> Premium</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c})} />
                <Label htmlFor="is_active">Plano Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={c => setFormData({...formData, is_featured: c})} />
                <Label htmlFor="is_featured">Marcar como Destaque</Label>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Salvando...</> : "Salvar Plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}