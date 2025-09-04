
import React, { useState, useEffect, useMemo } from "react";
import { Order } from "@/api/entities";
import { Settings } from "@/api/entities"; // New import
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2, Zap, RefreshCw, Rocket, ArrowLeft, ArrowRight, Trash2, FileText, Search, Download, Calendar
} from "lucide-react";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { processOrder } from "@/api/functions";
import { syncOrderStatus } from "@/api/functions";
import { deleteOrder } from "@/api/functions";
import { exportOrders } from "@/api/functions";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [filters, setFilters] = useState({
    searchQuery: '',
    status: 'all',
    is_express: 'all',
    dateRange: { from: null, to: null }
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(20);

  const [selectedOrderLogs, setSelectedOrderLogs] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  // Existing new features
  // const [autoRefresh, setAutoRefresh] = useState(true); // Removed, replaced by autoSync
  const [showCompactView, setShowCompactView] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    today: false,
    thisWeek: false,
    highValue: false,
    problems: false
  });
  const [sortConfig, setSortConfig] = useState({ key: 'created_date', direction: 'desc' });

  // Novo estado para sincronização automática
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [autoSyncInterval, setAutoSyncInterval] = useState(null);
  const [lastAutoSync, setLastAutoSync] = useState(null);
  const [autoSyncStatus, setAutoSyncStatus] = useState('idle'); // idle, running, success, error

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let allOrders = await Order.list("-created_date", 500);
      setOrders(allOrders.filter(order => order.service_id !== 'wallet_deposit'));
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setAlert({ type: "error", title: "Erro", message: "Erro ao buscar pedidos: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(); // Initial fetch on component mount
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case "pending_payment": return "💳 Aguardando Pagamento";
      case "processing": return "⚡ Em Processamento";
      case "completed": return "✅ Concluído";
      case "cancelled": return "❌ Cancelado";
      case "refunded": return "↩️ Reembolsado";
      case "partial": return "🔄 Parcial";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-700 bg-green-100";
      case "processing": return "text-blue-700 bg-blue-100";
      case "pending_payment": return "text-yellow-700 bg-yellow-100";
      case "cancelled": return "text-red-700 bg-red-100";
      case "partial": return "text-orange-700 bg-orange-100";
      case "refunded": return "text-gray-700 bg-gray-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const handleProcessOrder = async (orderId) => {
    setUpdating(orderId);
    try {
      const { data, status } = await processOrder({ orderId });
      if (status === 200) {
        await fetchOrders();
        if (data.success) {
          console.log(`Pedido ${orderId.slice(0, 8)} processado com sucesso`);
        }
      }
    } catch (err) {
      console.error("Erro ao processar pedido:", err);
      setAlert({ type: "error", title: "Erro", message: "Erro ao processar pedido: " + err.message });
    } finally {
      setUpdating(null);
    }
  };

  const handleShowLogs = (order) => {
    setSelectedOrderLogs(order.system_log || ['Nenhum log registrado.']);
    setIsLogModalOpen(true);
  };

  const handleDeleteOrder = async (orderId) => {
    setUpdating(orderId);
    try {
      await deleteOrder({ orderId });
      fetchOrders();
      setAlert({ type: "success", title: "Sucesso", message: "Pedido excluído com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
      setAlert({ type: "error", title: "Erro", message: "Erro ao excluir pedido: " + error.message });
    } finally {
      setUpdating(null);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const { data, status } = await syncOrderStatus({});
      if (status === 200 && data.success) {
        await fetchOrders();
        setAlert({ type: "success", title: "Sincronizado", message: "Status dos pedidos sincronizado com sucesso." });
      } else {
        setAlert({ type: "error", title: "Erro", message: "Falha na sincronização." });
      }
    } catch (err) {
      console.error("Erro na sincronização:", err);
      setAlert({ type: "error", title: "Erro", message: "Erro na sincronização: " + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const { data } = await exportOrders({ filters });
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setAlert({ type: "success", title: "Sucesso", message: "Pedidos exportados com sucesso." });
    } catch (error) {
        console.error("Erro na exportação:", error);
        setAlert({ type: "error", title: "Erro", message: "Erro na exportação: " + error.message });
    } finally {
        setIsExporting(false);
    }
  };

  const handleBulkProcess = async () => {
    if (selectedRows.length === 0) return;
    setIsBulkProcessing(true);
    try {
        await processOrder({ orderIds: selectedRows });
        setSelectedRows([]);
        fetchOrders();
        setAlert({ type: "success", title: "Sucesso", message: `${selectedRows.length} pedido(s) processado(s) com sucesso.` });
    } catch (error) {
        console.error("Erro em lote:", error);
        setAlert({ type: "error", title: "Erro", message: "Erro ao processar pedidos em lote: " + error.message });
    } finally {
        setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    setIsBulkProcessing(true);
    try {
        await deleteOrder({ orderIds: selectedRows });
        setSelectedRows([]);
        fetchOrders();
        setAlert({ type: "success", title: "Sucesso", message: `${selectedRows.length} pedido(s) excluído(s) com sucesso.` });
    } catch (error) {
        console.error("Erro em lote:", error);
        setAlert({ type: "error", title: "Erro", message: "Erro ao excluir pedidos em lote: " + error.message });
    } finally {
        setIsBulkProcessing(false);
    }
  };

  // Nova função para sincronização automática silenciosa
  const runAutoSync = async () => {
    if (autoSyncStatus === 'running') return; // Evita execuções sobrepostas
    
    setAutoSyncStatus('running');
    try {
      const { data, status } = await syncOrderStatus({});
      if (status === 200 && data.success) {
        if (data.updated > 0) {
          await fetchOrders(); // Só recarrega se houve atualizações
          console.log(`[AutoSync] ${data.updated} pedidos atualizados automaticamente`);
        }
        setAutoSyncStatus('success');
        setLastAutoSync(new Date());
      } else {
        setAutoSyncStatus('error');
      }
    } catch (error) {
      console.error('[AutoSync] Erro na sincronização automática:', error);
      setAutoSyncStatus('error');
    }
  };

  // Carregar configurações de sincronização automática
  useEffect(() => {
    const loadSyncSettings = async () => {
      try {
        const settings = await Settings.list();
        if (settings.length > 0) {
          const config = settings[0];
          setAutoSyncEnabled(config.auto_sync_enabled !== false);
          setAutoSyncInterval(config.sync_interval_minutes || 15);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de sync:', error);
      }
    };
    loadSyncSettings();
  }, []);

  // Configurar intervalo de sincronização automática
  useEffect(() => {
    let intervalId;
    
    if (autoSyncEnabled && autoSyncInterval) {
      console.log(`[AutoSync] Iniciando sincronização automática a cada ${autoSyncInterval} minutos`);
      
      // Primeira execução após 30 segundos
      const firstRunTimeout = setTimeout(() => {
        runAutoSync();
      }, 30000);
      
      // Depois executa no intervalo configurado
      intervalId = setInterval(() => {
        runAutoSync();
      }, autoSyncInterval * 60 * 1000);

      return () => {
        clearTimeout(firstRunTimeout);
        clearInterval(intervalId);
      };
    } else if (autoSyncEnabled === false) {
      console.log('[AutoSync] Sincronização automática desabilitada');
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoSyncEnabled, autoSyncInterval]);

  // Nova função para filtros rápidos
  const handleQuickFilter = (filterType) => {
    const newQuickFilters = { ...quickFilters, [filterType]: !quickFilters[filterType] };
    setQuickFilters(newQuickFilters);
    setCurrentPage(1);
    // Clear date range if a quick filter is applied
    if (newQuickFilters[filterType]) {
      setFilters(prev => ({ ...prev, dateRange: { from: null, to: null } }));
    }
  };

  // Nova função para ordenação
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtros melhorados
  const filteredOrders = useMemo(() => {
    let currentFiltered = orders;

    // Filtros existentes
    if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        currentFiltered = currentFiltered.filter(order =>
            order.id.toLowerCase().includes(query) ||
            (order.short_id && order.short_id.toLowerCase().includes(query)) ||
            (order.customer_email && order.customer_email.toLowerCase().includes(query)) ||
            (order.service_name && order.service_name.toLowerCase().includes(query)) ||
            (order.target_url && order.target_url.toLowerCase().includes(query)) ||
            (order.provider_order_id && String(order.provider_order_id).toLowerCase().includes(query))
        );
    }

    if (filters.status !== 'all') {
        currentFiltered = currentFiltered.filter(order => order.status === filters.status);
    }

    if (filters.is_express !== 'all') {
        currentFiltered = currentFiltered.filter(order => order.is_express === (filters.is_express === 'true'));
    }

    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0,0,0,0);
      currentFiltered = currentFiltered.filter(order => new Date(order.created_date) >= fromDate);
    }

    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      toDate.setHours(23,59,59,999);
      currentFiltered = currentFiltered.filter(order => new Date(order.created_date) <= toDate);
    }

    // Novos filtros rápidos
    if (quickFilters.today) {
      const today = new Date();
      today.setHours(0,0,0,0);
      currentFiltered = currentFiltered.filter(order => new Date(order.created_date) >= today);
    }

    if (quickFilters.thisWeek) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      oneWeekAgo.setHours(0,0,0,0); // Start of the day
      currentFiltered = currentFiltered.filter(order => new Date(order.created_date) >= oneWeekAgo);
    }

    if (quickFilters.highValue) {
      currentFiltered = currentFiltered.filter(order => (order.total_price || 0) >= 100);
    }

    if (quickFilters.problems) {
      currentFiltered = currentFiltered.filter(order =>
        order.status === 'cancelled' || order.status === 'refunded' ||
        (order.status === 'processing' && new Date(order.created_date) < new Date(Date.now() - 24*60*60*1000))
      );
    }

    // Ordenação
    currentFiltered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'created_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig.key === 'total_price' || sortConfig.key === 'quantity') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return currentFiltered;
  }, [orders, filters, quickFilters, sortConfig]);

  const currentOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    // Clear quick filters if a regular filter is applied
    setQuickFilters({ today: false, thisWeek: false, highValue: false, problems: false });
  };

  const handleSelectRow = (id, checked) => {
    setSelectedRows(prev =>
        checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? currentOrders.map(o => o.id) : []);
  };

  return (
    <>
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Logs do Sistema</DialogTitle></DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto bg-gray-900 text-white font-mono text-xs rounded-md p-4">
            {selectedOrderLogs.map((log, index) => <p key={index} className="border-b border-gray-700 py-1">{log}</p>)}
          </div>
          <DialogFooter><Button onClick={() => setIsLogModalOpen(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header melhorado com status de auto-sync */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Pedidos</h1>
            <div className="flex items-center gap-4 mt-2">
              {autoSyncEnabled && (
                <div className="flex items-center gap-2 text-sm">
                  {autoSyncStatus === 'running' && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sincronizando...</span>
                    </div>
                  )}
                  {autoSyncStatus === 'success' && lastAutoSync && (
                    <div className="flex items-center gap-1 text-green-600">
                      <RefreshCw className="w-4 h-4" />
                      <span>Última sync: {format(lastAutoSync, 'HH:mm')}</span>
                    </div>
                  )}
                  {autoSyncStatus === 'error' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <RefreshCw className="w-4 h-4" />
                      <span>Erro na sincronização</span>
                    </div>
                  )}
                  {autoSyncStatus === 'idle' && autoSyncInterval && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <RefreshCw className="w-4 h-4" />
                      <span>Auto-sync ativo (a cada {autoSyncInterval}min)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleForceSync}
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sincronizar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exportar CSV
            </Button>
            <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border">
              📊 <span className="font-semibold">{filteredOrders.length}</span> de {orders.length} pedidos
            </div>
          </div>
        </div>

        {alert && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Alertas de configuração */}
        {!autoSyncEnabled && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Sincronização Automática Desabilitada</AlertTitle>
            <AlertDescription className="text-blue-700">
              Para ativar a sincronização automática de pedidos, vá em <strong>Configurações → Serviços & API</strong> e habilite a opção.
              Isso eliminará a necessidade de clicar em "Sincronizar" manualmente.
            </AlertDescription>
          </Alert>
        )}

        {/* Filtros rápidos */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Filtros rápidos:</span>
            <Button
              variant={quickFilters.today ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('today')}
              className="h-8"
            >
              📅 Hoje ({orders.filter(o => new Date(o.created_date).toDateString() === new Date().toDateString()).length})
            </Button>
            <Button
              variant={quickFilters.thisWeek ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('thisWeek')}
              className="h-8"
            >
              📆 Esta semana
            </Button>
            <Button
              variant={quickFilters.highValue ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('highValue')}
              className="h-8"
            >
              💰 Alto valor (R$100+)
            </Button>
            <Button
              variant={quickFilters.problems ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickFilter('problems')}
              className="h-8"
            >
              ⚠️ Problemas ({orders.filter(o => o.status === 'cancelled' || o.status === 'refunded').length})
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-gray-600 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCompactView}
                  onChange={(e) => setShowCompactView(e.target.checked)}
                  className="rounded"
                />
                Vista compacta
              </label>
            </div>
          </div>
        </div>

        {/* Filtros existentes melhorados */}
        <div className="p-4 bg-white rounded-lg shadow-sm mb-6 border">
          {selectedRows.length > 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{selectedRows.length} pedido(s) selecionado(s)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkProcess} disabled={isBulkProcessing} className="gap-2">
                  {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  Processar Selecionados
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isBulkProcessing} className="gap-2">
                      <Trash2 className="w-4 h-4" /> Excluir Selecionados
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>⚠️ Confirmar Exclusão em Lote</DialogTitle></DialogHeader>
                    <div className="py-4">
                      <p>Tem certeza que deseja excluir <span className="font-bold text-red-600">{selectedRows.length}</span> pedido(s)?</p>
                      <p className="text-red-700 text-sm font-medium mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">⚠️ Esta ação não pode ser desfeita.</p>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary">Cancelar</Button>
                      <Button variant="destructive" onClick={handleBulkDelete}>🗑️ Excluir Definitivamente</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ID, email, serviço..."
                  className="pl-9"
                  value={filters.searchQuery}
                  onChange={e => handleFilterChange('searchQuery', e.target.value)}
                />
              </div>
              <Select value={filters.status} onValueChange={value => handleFilterChange('status', value)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="completed">✅ Concluído</SelectItem>
                  <SelectItem value="processing">⚡ Processando</SelectItem>
                  <SelectItem value="pending_payment">💳 Aguardando Pag.</SelectItem>
                  <SelectItem value="cancelled">❌ Cancelado</SelectItem>
                  <SelectItem value="partial">🔄 Parcial</SelectItem>
                  <SelectItem value="refunded">↩️ Reembolsado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.is_express} onValueChange={value => handleFilterChange('is_express', value)}>
                <SelectTrigger><SelectValue placeholder="Express" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">⚡ Express</SelectItem>
                  <SelectItem value="false">🐌 Normal</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ?
                        `${format(filters.dateRange.from, "dd/MM")} - ${format(filters.dateRange.to, "dd/MM")}` :
                        format(filters.dateRange.from, "dd/MM/yyyy")
                    ) : (
                      <span>Filtrar por data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={filters.dateRange}
                    onSelect={(range) => handleFilterChange('dateRange', range || { from: null, to: null })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Tabela com melhorias */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      onCheckedChange={handleSelectAll}
                      checked={selectedRows.length === currentOrders.length && currentOrders.length > 0}
                      disabled={currentOrders.length === 0}
                    />
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('created_date')}
                  >
                    📋 ID Pedido {sortConfig.key === 'created_date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('created_date')}
                  >
                    📅 Data {sortConfig.key === 'created_date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="font-semibold">🛍️ Serviço</TableHead>
                  <TableHead className="font-semibold">🔗 Link</TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('quantity')}
                  >
                    📊 Qtd {sortConfig.key === 'quantity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total_price')}
                  >
                    💰 Valor {sortConfig.key === 'total_price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead className="font-semibold">📈 Status</TableHead>
                  <TableHead className="font-semibold">🏷️ ID Fornecedor</TableHead>
                  <TableHead className="text-right font-semibold">⚡ Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center p-8">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        <span>Carregando...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center p-8 text-gray-500">
                      Nenhum pedido encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        order.is_express ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400' : ''
                      } ${showCompactView ? 'text-sm' : ''}`}
                    >
                      <TableCell>
                        <Checkbox
                          onCheckedChange={(checked) => handleSelectRow(order.id, checked)}
                          checked={selectedRows.includes(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded text-sm">
                            {order.short_id || order.id.slice(0, 8)}
                          </div>
                          {order.is_express && (
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs">
                              <Zap className="w-3 h-3 mr-1" />Express
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{format(new Date(order.created_date), 'dd/MM/yy')}</span>
                          <span className="text-xs text-gray-500">{format(new Date(order.created_date), 'HH:mm')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate font-medium">{order.service_name}</div>
                        {order.coupon_code && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            🏷️ {order.coupon_code}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <a
                          href={order.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-xs block"
                          title={order.target_url}
                        >
                          🔗 {order.target_url?.replace('https://', '').substring(0, 25)}...
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded text-sm">
                          {order.quantity?.toLocaleString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                          R$ {(order.total_price || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} border-0 font-medium`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono text-sm ${
                          order.provider_order_id ?
                          'text-green-700 bg-green-50 px-2 py-1 rounded' :
                          'text-gray-400'
                        }`}>
                          {order.provider_order_id || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleShowLogs(order)}
                            title="Ver Logs"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                          </Button>
                          {(order.status === 'cancelled' || order.status === 'processing' || order.status === 'pending_payment') && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleProcessOrder(order.id)}
                              disabled={updating === order.id}
                              title="Reprocessar"
                            >
                              {updating === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                              ) : (
                                <Rocket className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" title="Excluir">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>⚠️ Confirmar Exclusão</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Tem certeza que deseja excluir o pedido <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">{order.short_id || order.id.slice(0, 8)}</span>?</p>
                                <p className="text-red-700 text-sm font-medium mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">⚠️ Esta ação não pode ser desfeita.</p>
                              </div>
                              <DialogFooter>
                                <Button variant="secondary">Cancelar</Button>
                                <Button variant="destructive" onClick={() => handleDeleteOrder(order.id)}>
                                  🗑️ Excluir Definitivamente
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Paginação melhorada */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center gap-4 mt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * ordersPerPage) + 1} - {Math.min(currentPage * ordersPerPage, filteredOrders.length)} de {filteredOrders.length}
              </span>
              <Select value={ordersPerPage.toString()} onValueChange={(value) => {
                setOrdersPerPage(parseInt(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Itens por página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="20">20 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                  <SelectItem value="100">100 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                ⏮️ Primeira
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
              </Button>
              <span className="text-sm self-center px-4 py-2 bg-gray-100 rounded">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                ⏭️ Última
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
