import React, { useState, useEffect } from "react";
import { Coupon } from "@/api/entities";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Percent, DollarSign, Gift, Calendar, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_value: 0,
    max_uses: "",
    valid_from: "",
    valid_until: "",
    applicable_services: [],
    first_purchase_only: false,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [couponsData, servicesData] = await Promise.all([
        Coupon.list("-created_date"),
        Service.list()
      ]);
      setCoupons(couponsData);
      setServices(servicesData);
    } catch (error) {
      console.error("Error loading data:", error);
      setAlert({ type: "error", message: "Erro ao carregar dados." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const couponData = {
        ...formData,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null
      };

      if (editingCoupon) {
        await Coupon.update(editingCoupon.id, couponData);
        setAlert({ type: "success", message: "Cupom atualizado com sucesso!" });
      } else {
        await Coupon.create(couponData);
        setAlert({ type: "success", message: "Cupom criado com sucesso!" });
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);
      setAlert({ type: "error", message: `Erro ao salvar cupom: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      discount_type: "percentage",
      discount_value: 0,
      min_order_value: 0,
      max_uses: "",
      valid_from: "",
      valid_until: "",
      applicable_services: [],
      first_purchase_only: false,
      is_active: true
    });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      name: coupon.name,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value || 0,
      max_uses: coupon.max_uses || "",
      valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 16) : "",
      valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 16) : "",
      applicable_services: coupon.applicable_services || [],
      first_purchase_only: coupon.first_purchase_only || false,
      is_active: coupon.is_active !== false
    });
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este cupom?")) {
      try {
        await Coupon.delete(id);
        loadData();
        setAlert({ type: "success", message: "Cupom excluído com sucesso!" });
      } catch (error) {
        console.error("Erro ao excluir cupom:", error);
        setAlert({ type: "error", message: `Erro ao excluir cupom: ${error.message}` });
      }
    }
  };

  const handleServiceToggle = (serviceId) => {
    const newServices = formData.applicable_services.includes(serviceId)
      ? formData.applicable_services.filter(id => id !== serviceId)
      : [...formData.applicable_services, serviceId];
    
    setFormData({ ...formData, applicable_services: newServices });
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code });
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    } else if (coupon.discount_type === 'fixed_amount') {
      return `R$ ${coupon.discount_value.toFixed(2)}`;
    } else {
      return `+${coupon.discount_value}% qtd`;
    }
  };

  const isExpired = (coupon) => {
    if (!coupon.valid_until) return false;
    return new Date(coupon.valid_until) < new Date();
  };

  const isMaxUsesReached = (coupon) => {
    if (!coupon.max_uses) return false;
    return coupon.used_count >= coupon.max_uses;
  };

  return (
    <div className="p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cupons de Desconto</h1>
          <p className="text-gray-600 mt-2">Gerencie códigos promocionais e ofertas especiais</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7">Carregando cupons...</TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {coupon.discount_type === 'percentage' && <Percent className="w-4 h-4 text-green-600" />}
                        {coupon.discount_type === 'fixed_amount' && <DollarSign className="w-4 h-4 text-blue-600" />}
                        {coupon.discount_type === 'quantity_bonus' && <Gift className="w-4 h-4 text-purple-600" />}
                        <span className="font-medium">{getDiscountDisplay(coupon)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.max_uses ? `${coupon.used_count || 0}/${coupon.max_uses}` : `${coupon.used_count || 0}/∞`}
                    </TableCell>
                    <TableCell>
                      {coupon.valid_until ? (
                        <span className={isExpired(coupon) ? 'text-red-600' : 'text-green-600'}>
                          {new Date(coupon.valid_until).toLocaleDateString()}
                        </span>
                      ) : 'Sem limite'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={coupon.is_active ? "success" : "destructive"}>
                          {coupon.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {isExpired(coupon) && <Badge variant="destructive">Expirado</Badge>}
                        {isMaxUsesReached(coupon) && <Badge variant="secondary">Esgotado</Badge>}
                        {coupon.first_purchase_only && <Badge variant="outline">1ª Compra</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(coupon.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar Cupom */}
      <Dialog open={showModal} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setShowModal(isOpen); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código do Cupom *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="DESCONTO10"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Gerar
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="name">Nome/Descrição *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Desconto de 10%"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Tipo de Desconto *</Label>
                <Select value={formData.discount_type} onValueChange={(value) => setFormData({...formData, discount_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed_amount">Valor Fixo (R$)</SelectItem>
                    <SelectItem value="quantity_bonus">Bônus de Quantidade (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_value">Valor do Desconto *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})}
                  placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_order_value">Valor Mínimo do Pedido</Label>
                <Input
                  id="min_order_value"
                  type="number"
                  step="0.01"
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({...formData, min_order_value: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="max_uses">Máximo de Usos</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                  placeholder="Deixe vazio para ilimitado"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Válido A Partir De</Label>
                <Input
                  id="valid_from"
                  type="datetime-local"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="valid_until">Válido Até</Label>
                <Input
                  id="valid_until"
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Serviços Aplicáveis</Label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                <div className="col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="all-services"
                      checked={formData.applicable_services.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, applicable_services: []});
                        }
                      }}
                    />
                    <Label htmlFor="all-services" className="font-medium">
                      Todos os serviços
                    </Label>
                  </div>
                </div>
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.applicable_services.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label htmlFor={`service-${service.id}`} className="text-sm cursor-pointer">
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="first_purchase_only"
                  checked={formData.first_purchase_only}
                  onCheckedChange={(checked) => setFormData({...formData, first_purchase_only: checked})}
                />
                <Label htmlFor="first_purchase_only">Apenas primeira compra</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Cupom ativo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : (editingCoupon ? "Atualizar" : "Criar Cupom")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}