
import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { CustomerWallet } from "@/api/entities";
import { WalletTransaction } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, CreditCard, Plus, ArrowUpCircle, ArrowDownCircle, Search, Filter } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminWalletPayments() {
  const [walletDeposits, setWalletDeposits] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [customerWallets, setCustomerWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Buscar pedidos de depósito na carteira
      const deposits = await Order.filter({ service_id: "wallet_deposit" }, "-created_date");
      setWalletDeposits(deposits);

      // Buscar todas as transações da carteira
      const transactions = await WalletTransaction.list("-created_date");
      setWalletTransactions(transactions);

      // Buscar todas as carteiras de clientes
      const wallets = await CustomerWallet.list("-created_date");
      setCustomerWallets(wallets);

    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setAlert({ type: "error", message: "Erro ao carregar dados da carteira." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    const intervalId = setInterval(fetchWalletData, 60000); // Atualiza a cada minuto
    return () => clearInterval(intervalId);
  }, []);

  const handleManualAdjustment = async () => {
    if (!selectedCustomer || !adjustmentAmount || !adjustmentReason) {
      setAlert({ type: "error", message: "Preencha todos os campos." });
      return;
    }

    try {
      const amount = parseFloat(adjustmentAmount);
      const wallet = customerWallets.find(w => w.user_email === selectedCustomer.user_email);
      
      if (!wallet) {
        setAlert({ type: "error", message: "Carteira não encontrada." });
        return;
      }

      const newBalance = wallet.balance + amount;
      
      // Atualizar saldo da carteira
      await CustomerWallet.update(wallet.id, { 
        balance: newBalance,
        total_added: amount > 0 ? wallet.total_added + amount : wallet.total_added
      });

      // Registrar transação
      await WalletTransaction.create({
        user_email: selectedCustomer.user_email,
        transaction_type: amount > 0 ? "deposit" : "purchase",
        amount: Math.abs(amount),
        description: `Ajuste manual: ${adjustmentReason}`,
        balance_before: wallet.balance,
        balance_after: newBalance,
        status: "completed"
      });

      setAlert({ type: "success", message: "Ajuste realizado com sucesso!" });
      setModalOpen(false);
      setAdjustmentAmount("");
      setAdjustmentReason("");
      setSelectedCustomer(null);
      fetchWalletData();

    } catch (error) {
      console.error("Error making manual adjustment:", error);
      setAlert({ type: "error", message: "Erro ao realizar ajuste." });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending_payment: { color: "yellow", text: "Aguardando Pagamento" },
      processing: { color: "blue", text: "Processando" },
      completed: { color: "green", text: "Concluído" },
      cancelled: { color: "red", text: "Cancelado" }
    };
    const statusInfo = statusMap[status] || { color: "gray", text: status };
    return <Badge variant={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit": return <ArrowUpCircle className="w-4 h-4 text-green-500" />;
      case "purchase": return <ArrowDownCircle className="w-4 h-4 text-red-500" />;
      case "refund": return <ArrowUpCircle className="w-4 h-4 text-blue-500" />;
      default: return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredWallets = customerWallets.filter(wallet => 
    wallet.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = walletTransactions.filter(transaction => 
    transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Carteiras</h1>
          <p className="text-gray-600 mt-1">Controle total sobre depósitos, transações e saldos dos clientes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total em Carteiras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {customerWallets.reduce((sum, w) => sum + (w.balance || 0), 0).toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Depósitos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {walletDeposits.filter(d => d.status === 'pending_payment').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes com Carteira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {customerWallets.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transações (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {walletTransactions.filter(t => {
                const transactionDate = new Date(t.created_date);
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return transactionDate > yesterday;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NOVO: Tabela de Depósitos na Carteira */}
      <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Depósitos na Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ID Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center">Carregando...</TableCell>
                  </TableRow>
                ) : walletDeposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center">Nenhum depósito encontrado</TableCell>
                  </TableRow>
                ) : (
                  walletDeposits.map(deposit => (
                    <TableRow key={deposit.id}>
                      <TableCell className="text-sm">
                        {format(new Date(deposit.created_date), 'dd/MM/yy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{deposit.customer_email}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        R$ {(deposit.total_price || 0).toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                      <TableCell className="font-mono text-xs">{deposit.mp_payment_id || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      {/* Tabs para diferentes visualizações */}
      <div className="space-y-6">
        {/* Carteiras dos Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Carteiras dos Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead>Total Adicionado</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center">Carregando...</TableCell>
                  </TableRow>
                ) : filteredWallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center">Nenhuma carteira encontrada</TableCell>
                  </TableRow>
                ) : (
                  filteredWallets.map(wallet => (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-medium">{wallet.user_email}</TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">
                          R$ {(wallet.balance || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </TableCell>
                      <TableCell>R$ {(wallet.total_added || 0).toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>R$ {(wallet.total_spent || 0).toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(wallet.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCustomer(wallet);
                            setModalOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajustar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Saldo Resultante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 20).map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {format(new Date(transaction.created_date), 'dd/MM/yy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.user_email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transaction_type)}
                        <span className="capitalize">{transaction.transaction_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${
                        transaction.transaction_type === 'deposit' || transaction.transaction_type === 'refund' 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'refund' ? '+' : '-'}
                        R$ {(transaction.amount || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </TableCell>
                    <TableCell>
                      R$ {(transaction.balance_after || 0).toFixed(2).replace('.', ',')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Ajuste Manual */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuste Manual de Saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCustomer && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">Cliente: {selectedCustomer.user_email}</p>
                <p className="text-sm text-gray-600">
                  Saldo atual: R$ {(selectedCustomer.balance || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="adjustment-amount">Valor do Ajuste</Label>
              <Input
                id="adjustment-amount"
                type="number"
                step="0.01"
                placeholder="Use valores negativos para debitar"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Valores positivos adicionam saldo, negativos removem
              </p>
            </div>
            
            <div>
              <Label htmlFor="adjustment-reason">Motivo do Ajuste</Label>
              <Input
                id="adjustment-reason"
                placeholder="Ex: Reembolso por problema técnico"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleManualAdjustment}>
              Aplicar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
