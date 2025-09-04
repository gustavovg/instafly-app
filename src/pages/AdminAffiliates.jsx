
import React, { useState, useEffect } from "react";
import { Affiliate } from "@/api/entities";
import { AffiliateEarning } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, DollarSign, TrendingUp, CheckCircle, X, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    totalSalesGenerated: 0
  });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [editFormData, setEditFormData] = useState({
    affiliate_code: "",
    commission_percentage: 10,
    pix_key: "",
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [affiliatesData, earningsData] = await Promise.all([
        Affiliate.list("-created_date"),
        AffiliateEarning.list("-created_date")
      ]);

      setAffiliates(affiliatesData);
      setEarnings(earningsData);

      // Calculate stats
      const totalEarnings = affiliatesData.reduce((sum, aff) => sum + (aff.total_earnings || 0), 0);
      const pendingPayments = earningsData
        .filter(e => e.status === 'pending')
        .reduce((sum, earning) => sum + earning.commission_amount, 0);
      const totalSalesGenerated = earningsData.reduce((sum, earning) => sum + earning.order_value, 0);

      setStats({
        totalAffiliates: affiliatesData.length,
        totalEarnings,
        pendingPayments,
        totalSalesGenerated
      });
    } catch (error) {
      console.error("Error loading affiliate data:", error);
      setAlert({ type: "error", message: "Erro ao carregar dados dos afiliados." });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (earningId) => {
    try {
      await AffiliateEarning.update(earningId, { 
        status: 'paid',
        paid_date: new Date().toISOString()
      });
      await loadData(); // Reload all data to ensure consistency
      setAlert({ type: "success", message: "Comissão marcada como paga!" });
    } catch (error) {
      console.error("Error marking as paid:", error);
      setAlert({ type: "error", message: "Erro ao marcar comissão como paga." });
    }
  };

  const handleEditClick = (affiliate) => {
    setEditingAffiliate(affiliate);
    setEditFormData({
        affiliate_code: affiliate.affiliate_code,
        commission_percentage: affiliate.commission_percentage,
        pix_key: affiliate.pix_key || "",
        is_active: affiliate.is_active
    });
    setShowEditModal(true);
  };

  const handleUpdateAffiliate = async (e) => {
    e.preventDefault();
    if (!editingAffiliate) return;
    
    setIsSaving(true);
    setAlert(null);
    try {
      await Affiliate.update(editingAffiliate.id, {
        ...editFormData,
        commission_percentage: Number(editFormData.commission_percentage)
      });
      setShowEditModal(false);
      setEditingAffiliate(null);
      await loadData();
      setAlert({ type: "success", message: "Afiliado atualizado com sucesso!" });
    } catch (error) {
      console.error("Error updating affiliate:", error);
      setAlert({ type: "error", message: "Erro ao atualizar afiliado." });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Afiliados</h1>
          <p className="text-gray-600 mt-2">Gerencie afiliados e comissões</p>
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalAffiliates}
            </p>
            <p className="text-sm text-gray-600">Total Afiliados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalEarnings)}
            </p>
            <p className="text-sm text-gray-600">Total Comissões</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalSalesGenerated)}
            </p>
            <p className="text-sm text-gray-600">Vendas Geradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.pendingPayments)}
            </p>
            <p className="text-sm text-gray-600">Pagamentos Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Affiliates Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Afiliados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Total Ganho</TableHead>
                <TableHead>Indicações</TableHead>
                <TableHead>PIX</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="8" className="text-center">Carregando afiliados...</TableCell>
                </TableRow>
              ) : (
                affiliates.map(affiliate => (
                  <TableRow key={affiliate.id}>
                    <TableCell className="font-medium">{affiliate.user_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{affiliate.affiliate_code}</Badge>
                    </TableCell>
                    <TableCell>{affiliate.commission_percentage}%</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(affiliate.total_earnings)}
                    </TableCell>
                    <TableCell>{affiliate.total_referrals || 0}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {affiliate.pix_key?.substring(0, 20)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={affiliate.is_active ? "success" : "destructive"}>
                        {affiliate.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(affiliate)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliado</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Valor Pedido</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.slice(0, 20).map(earning => {
                const affiliate = affiliates.find(a => a.id === earning.affiliate_id);
                return (
                  <TableRow key={earning.id}>
                    <TableCell>{affiliate?.user_email || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {earning.order_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{formatCurrency(earning.order_value)}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(earning.commission_amount)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(earning.created_date), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        earning.status === 'paid' ? 'success' : 
                        earning.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {earning.status === 'paid' ? 'Pago' : 
                         earning.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {earning.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(earning.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Affiliate Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Afiliado</DialogTitle>
          </DialogHeader>
          {editingAffiliate && (
            <form onSubmit={handleUpdateAffiliate} className="space-y-4">
              <div>
                <Label htmlFor="user_email">Email</Label>
                <Input id="user_email" value={editingAffiliate.user_email} disabled />
              </div>
              <div>
                <Label htmlFor="affiliate_code">Código de Afiliado</Label>
                <Input 
                    id="affiliate_code"
                    value={editFormData.affiliate_code}
                    onChange={(e) => setEditFormData({...editFormData, affiliate_code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="commission_percentage">Comissão (%)</Label>
                <Input 
                    id="commission_percentage"
                    type="number"
                    value={editFormData.commission_percentage}
                    onChange={(e) => setEditFormData({...editFormData, commission_percentage: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input 
                    id="pix_key"
                    value={editFormData.pix_key}
                    onChange={(e) => setEditFormData({...editFormData, pix_key: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                    id="is_active"
                    checked={editFormData.is_active}
                    onCheckedChange={(checked) => setEditFormData({...editFormData, is_active: checked })}
                />
                <Label htmlFor="is_active">Afiliado Ativo</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
