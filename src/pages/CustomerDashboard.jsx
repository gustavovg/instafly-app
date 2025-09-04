
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { Settings } from "@/api/entities";
import { CustomerWallet } from "@/api/entities";
import { WalletTransaction } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  Plus,
  ShoppingCart,
  History,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  Repeat,
  Eye,
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Zap,
  MessageCircle,
  Copy,
  Sparkles,
  LifeBuoy,
  Gem, // New import
  Package, // New import
  BarChart, // New import
  ChevronRight // New import
} from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from "@/utils";
import { createPayment } from "@/api/functions";
import { Progress } from "@/components/ui/progress"; // New import

const VipCard = ({ user, wallet, settings }) => {
  if (!settings?.enable_vip_program) return null;

  const tiers = (settings.vip_tiers || []).sort((a,b) => a.min_spent - b.min_spent);
  const currentTierName = user.vip_tier || "Iniciante"; // Assuming vip_tier is on user object
  const totalSpent = wallet?.total_spent || 0; // Using wallet's total_spent

  let currentTier = tiers.find(t => t.name === currentTierName);
  let nextTier = null;
  let progress = 0;

  if (currentTier) {
      const currentTierIndex = tiers.findIndex(t => t.name === currentTierName);
      nextTier = tiers[currentTierIndex + 1];
  } else {
      // If currentTier is null (e.g., "Iniciante"), the next tier is the first tier in the sorted list.
      // Only set nextTier if there are tiers available.
      nextTier = tiers.length > 0 ? tiers[0] : null;
  }

  if (nextTier) {
      const startOfTier = currentTier ? currentTier.min_spent : 0;
      progress = Math.min(100, ((totalSpent - startOfTier) / (nextTier.min_spent - startOfTier)) * 100);
      if (progress < 0) progress = 0; // Prevent negative progress if totalSpent is less than startOfTier
  } else {
      progress = 100; // If no next tier, user is at max level
  }

  const tierColor = currentTier ? currentTier.color : '#6b7280'; // Default gray for 'Iniciante'

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Gem className="w-6 h-6" style={{ color: tierColor }}/>
                    Programa VIP
                </CardTitle>
                <Badge style={{ backgroundColor: tierColor, color: '#000' }} className="font-bold">
                  {currentTierName}
                </Badge>
            </div>
            <CardDescription className="text-gray-400">
                {currentTier
                    ? `Você tem ${currentTier.discount_percentage}% de desconto em todos os pedidos!`
                    : "Comece a comprar para receber descontos exclusivos."}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {nextTier ? (
                <div>
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-300">Progresso para {nextTier.name}</span>
                        <span className="font-bold" style={{color: nextTier.color}}>{nextTier.discount_percentage}% OFF</span>
                    </div>
                    <Progress value={progress} className="w-full h-3 [&>*]:bg-purple-400" />
                    <p className="text-xs text-gray-500 mt-2 text-right">
                        Faltam {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.max(0, nextTier.min_spent - totalSpent))} para o próximo nível.
                    </p>
                </div>
            ) : (
                <div className="text-center">
                    <p className="font-bold text-lg" style={{ color: tierColor }}>Você alcançou o nível máximo!</p>
                    <p className="text-sm text-gray-300">Aproveite seus benefícios exclusivos.</p>
                </div>
            )}
        </CardContent>
    </Card>
  );
};


export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositWhatsapp, setDepositWhatsapp] = useState("");
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      await loadCustomerData(userData.email);
    } catch (error) {
      console.error("Auth error:", error);
      // Redirecionar para login se não estiver autenticado
      await User.loginWithRedirect(`${window.location.origin}${createPageUrl("CustomerDashboard")}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerData = async (userEmail) => {
    try {
      // Carregar carteira, pedidos, transações e configurações simultaneamente
      const [wallets, customerOrders, walletTransactions, settingsData] = await Promise.all([
        CustomerWallet.filter({ user_email: userEmail }),
        Order.filter({ customer_email: userEmail }, "-created_date"),
        WalletTransaction.filter({ user_email: userEmail }, "-created_date"),
        Settings.list()
      ]);

      if (wallets.length > 0) {
        setWallet(wallets[0]);
      } else {
        // Criar carteira se não existir
        const newWallet = await CustomerWallet.create({
          user_email: userEmail,
          balance: 0
        });
        setWallet(newWallet);
      }

      setOrders(customerOrders);
      setTransactions(walletTransactions);
      
      if (settingsData.length > 0) {
        setSettings(settingsData[0]); // Assuming there's usually one settings object
      }

      // Pre-fill WhatsApp number from last order
      const recentOrderWithWhatsapp = customerOrders.find(o => o.customer_whatsapp);
      if (recentOrderWithWhatsapp) {
        setDepositWhatsapp(recentOrderWithWhatsapp.customer_whatsapp);
      }

    } catch (error) {
      console.error("Error loading customer data:", error);
      setAlert({ type: "error", message: "Erro ao carregar dados do cliente." });
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 10) {
      setAlert({ type: "error", message: "Valor mínimo para depósito é R$ 10,00" });
      return;
    }

    if (!depositWhatsapp) {
      setAlert({ type: "error", message: "Por favor, informe seu número de WhatsApp." });
      return;
    }

    setProcessingDeposit(true);
    setAlert(null);

    try {
      // Criar pedido especial para depósito na carteira
      const depositOrder = await Order.create({
        service_id: "wallet_deposit",
        service_name: "Depósito na Carteira",
        target_url: "wallet",
        quantity: 1,
        total_price: amount,
        customer_email: user.email,
        customer_whatsapp: depositWhatsapp,
        status: "pending_payment"
      });

      // Criar pagamento via PIX
      const { data, status } = await createPayment({
        orderId: depositOrder.id,
        paymentMethod: "pix",
        orderTotal: amount,
        customerEmail: user.email,
        customerWhatsapp: depositWhatsapp
      });

      if (data && data.success) {
        // Store PIX data and open PIX modal instead of redirecting immediately
        setPixData({
          ...data,
          orderId: depositOrder.id,
          amount: amount
        });
        setDepositModalOpen(false);
        setPixModalOpen(true);
        setDepositAmount("");

        setAlert({
          type: "success",
          message: "PIX gerado com sucesso! Escaneie o QR Code para finalizar o depósito."
        });
      } else {
        setAlert({ type: "error", message: data?.message || "Erro ao processar depósito. Tente novamente." });
      }
    } catch (error) {
      console.error("Error creating deposit:", error);
      setAlert({ type: "error", message: "Erro ao processar depósito. Tente novamente." });
    } finally {
      setProcessingDeposit(false);
    }
  };

  const handleReorder = async (order) => {
    if (!wallet || wallet.balance < order.total_price) {
      setAlert({
        type: "error",
        message: `Saldo insuficiente. Você precisa de R$ ${order.total_price.toFixed(2).replace('.', ',')} mas tem apenas R$ ${wallet.balance.toFixed(2).replace('.', ',')}.`
      });
      return;
    }

    try {
      // Criar novo pedido idêntico
      const newOrder = await Order.create({
        service_id: order.service_id,
        service_name: order.service_name,
        target_url: order.target_url,
        quantity: order.quantity,
        total_price: order.total_price,
        customer_email: user.email,
        customer_whatsapp: order.customer_whatsapp,
        status: "processing", // Já pago via carteira
        payment_method: "wallet"
      });

      // Debitar da carteira
      const newBalance = wallet.balance - order.total_price;
      await CustomerWallet.update(wallet.id, {
        balance: newBalance,
        total_spent: wallet.total_spent + order.total_price
      });

      // Registrar transação
      await WalletTransaction.create({
        user_email: user.email,
        transaction_type: "purchase",
        amount: order.total_price,
        description: `Compra: ${order.service_name}`,
        order_id: newOrder.id,
        balance_before: wallet.balance,
        balance_after: newBalance
      });

      setAlert({ type: "success", message: "Pedido realizado com sucesso usando saldo da carteira!" });
      await loadCustomerData(user.email); // Recarregar dados

    } catch (error) {
      console.error("Error reordering:", error);
      setAlert({ type: "error", message: "Erro ao refazer pedido. Tente novamente." });
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
      default: return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Navegação */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {user?.full_name?.split(' ')[0] || 'Cliente'}! 👋
              </h1>
              <p className="text-gray-600">Seu painel pessoal de pedidos e carteira</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = createPageUrl("Home")}
              >
                Fazer Pedido
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = createPageUrl("OrderTracking")}
              >
                <Eye className="w-4 h-4 mr-2" />
                Rastrear
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {alert && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* NEW: Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left/Main Column - lg:col-span-2 */}
          <div className="lg:col-span-2 space-y-6">
            {/* VIP Card */}
            <VipCard user={user} wallet={wallet} settings={settings} />

            {/* Carteira Digital (adapted to new grid structure) */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    Saldo Disponível
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    R$ {wallet?.balance?.toFixed(2)?.replace('.', ',') || "0,00"}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => setDepositModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Saldo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                    Total Investido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {wallet?.total_spent?.toFixed(2)?.replace('.', ',') || "0,00"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {orders.filter(o => o.status === 'completed').length} pedidos concluídos
                  </p>
                </CardContent>
              </Card>

              {/* The original 3rd column placeholder for Quick Actions is now handled in a separate block */}
              {/* This column is left empty or can be filled with a third relevant card if desired */}
              <div />
            </div>

            {/* Quick Actions and Need Help */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 text-purple-500" />
                        Ações Rápidas
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.location.href = createPageUrl("Home")}
                        >
                        Fazer Novo Pedido
                        </Button>
                        <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setDepositModalOpen(true)}
                        >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Saldo
                        </Button>
                    </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LifeBuoy className="w-6 h-6 text-blue-500" />
                            Precisa de Ajuda?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className="w-full bg-white"
                                onClick={() => window.location.href = createPageUrl("Faq")}
                            >
                                Ver FAQ
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full bg-white"
                                 onClick={() => window.location.href = createPageUrl("CustomerTickets")}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Abrir Ticket
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Benefícios da Carteira */}
            {wallet?.balance === 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    💡 Por que usar a Carteira Digital?
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Compras Instantâneas</p>
                        <p className="text-gray-600">Sem esperar PIX</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Repeat className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Recompra Fácil</p>
                        <p className="text-gray-600">1 clique para repetir</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <History className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Histórico Completo</p>
                        <p className="text-gray-600">Acompanhe tudo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meus Pedidos Recentes - Summary Card (as per outline) */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600"/>
                      Meus Pedidos Recentes
                    </CardTitle>
                    <CardDescription>Acompanhe o status dos seus últimos pedidos.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('tabs-orders-trigger')?.click()}>Ver Todos</Button>
                </div>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Nenhum pedido recente. <Button variant="link" onClick={() => window.location.href = createPageUrl("Home")}>Faça seu primeiro pedido!</Button></p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => ( // Show only top 3 recent orders
                      <div key={order.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-sm">{order.service_name}</p>
                          <p className="text-xs text-gray-500">{format(new Date(order.created_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-600">R$ {order.total_price?.toFixed(2)?.replace('.', ',')}</span>
                          {getStatusBadge(order.status)}
                          <Button size="icon" variant="ghost" onClick={() => window.location.href = createPageUrl(`OrderTracking?orderId=${order.id}`)}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column - lg:col-span-1 */}
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-indigo-500" />
                        Visão Geral
                    </CardTitle>
                    <CardDescription>Resumo rápido do seu progresso e atividades.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">Nível VIP Atual:</h4>
                        <p className="text-lg text-gray-800">{user?.vip_tier || "Iniciante"}</p>
                        {settings?.enable_vip_program && settings.vip_tiers && user?.vip_tier && (
                            <p className="text-sm text-gray-600">Desconto: {settings.vip_tiers.find(t => t.name === user.vip_tier)?.discount_percentage || 0}%</p>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold">Pedidos Concluídos:</h4>
                        <p className="text-lg text-gray-800">{orders.filter(o => o.status === 'completed').length}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">Total Gasto:</h4>
                        <p className="text-lg text-gray-800">R$ {wallet?.total_spent?.toFixed(2)?.replace('.', ',') || "0,00"}</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6" id="dashboard-tabs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" id="tabs-orders-trigger">Meus Pedidos ({orders.length})</TabsTrigger>
            <TabsTrigger value="transactions">Extrato da Carteira</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido ainda</h3>
                    <p className="text-gray-600 mb-6">Que tal fazer seu primeiro pedido?</p>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => window.location.href = createPageUrl("Home")}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Fazer Primeiro Pedido
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{order.service_name}</h3>
                            <p className="text-sm text-gray-600">
                              ID: {order.id.slice(0, 8)} • {format(new Date(order.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Quantidade:</span>
                            <p className="font-medium">{order.quantity?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Valor:</span>
                            <p className="font-medium text-green-600">
                              R$ {order.total_price?.toFixed(2)?.replace('.', ',')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Link:</span>
                            <p className="font-medium truncate">{order.target_url}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = createPageUrl(`OrderTracking?orderId=${order.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Rastrear
                          </Button>
                          {order.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(order)}
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                              <Repeat className="w-4 h-4 mr-2" />
                              Pedir Novamente
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Extrato da Carteira</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação</h3>
                    <p className="text-gray-600 mb-6">Adicione saldo para começar a usar a carteira</p>
                    <Button
                      onClick={() => setDepositModalOpen(true)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Saldo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.transaction_type)}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(transaction.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.transaction_type === 'deposit' || transaction.transaction_type === 'refund'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'refund' ? '+' : '-'}
                              R$ {transaction.amount?.toFixed(2)?.replace('.', ',')}
                            </p>
                            <p className="text-sm text-gray-500">
                              Saldo: R$ {transaction.balance_after?.toFixed(2)?.replace('.', ',')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Depósito */}
        <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>💰 Adicionar Saldo à Carteira</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Bonus Alert */}
              {settings?.enable_wallet_bonus && settings.bonus_rules?.length > 0 && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <AlertDescription>
                    <p className="font-bold text-yellow-800">Ganhe Bônus!</p>
                    <ul className="text-sm text-yellow-700 list-disc pl-5 mt-1">
                      {settings.bonus_rules
                        .sort((a,b) => a.deposit_amount - b.deposit_amount)
                        .map(rule => (
                          <li key={rule.deposit_amount}>
                            Deposite a partir de <strong>R$ {rule.deposit_amount.toFixed(2).replace('.', ',')}</strong> e ganhe <strong>{rule.bonus_percentage}% de bônus</strong>.
                          </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label className="block text-sm font-medium mb-2">Valor do Depósito</Label>
                <Input
                  type="number"
                  placeholder="10.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="10"
                  step="0.01"
                />
                <p className="text-sm text-gray-500 mt-1">Valor mínimo: R$ 10,00</p>
              </div>

              <div>
                <Label htmlFor="whatsapp-deposit" className="block text-sm font-medium mb-2">Seu WhatsApp</Label>
                 <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="whatsapp-deposit"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={depositWhatsapp}
                      onChange={(e) => setDepositWhatsapp(e.target.value)}
                      className="pl-9"
                    />
                </div>
                <p className="text-sm text-gray-500 mt-1">Para receber notificações sobre o depósito.</p>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Valores Rápidos</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 100, 200].map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount(value.toString())}
                      className="h-12"
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">✨ Vantagens da Carteira:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Compras instantâneas sem esperar PIX</li>
                  <li>• Recompra fácil com 1 clique</li>
                  <li>• Histórico completo de transações</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDepositModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleDeposit}
                disabled={processingDeposit}
                className="bg-green-500 hover:bg-green-600"
              >
                {processingDeposit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Gerar PIX
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal do PIX */}
        <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                💰 PIX - Depósito na Carteira
              </DialogTitle>
              <CardDescription className="text-center">
                Valor: R$ {pixData?.amount?.toFixed(2)?.replace('.', ',')}
              </CardDescription>
            </DialogHeader>
            <div className="py-4">
              {alert && <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4"><AlertDescription>{alert.message}</AlertDescription></Alert>}

              {pixData && (
                <div className="flex flex-col items-center gap-4">
                  {pixData.qr_code_base64 && (
                    <img
                      src={`data:image/png;base64,${pixData.qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 border rounded-lg p-2"
                    />
                  )}
                  <p className="text-sm text-center text-gray-600">
                    Escaneie o QR Code com seu banco ou copie o código PIX abaixo:
                  </p>
                  {pixData.qr_code && (
                    <div className="w-full p-3 bg-gray-100 rounded-md text-xs font-mono break-all relative">
                      {pixData.qr_code}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 h-7 w-7"
                        onClick={() => navigator.clipboard.writeText(pixData.qr_code)}
                      >
                        <Copy className="w-4 h-4"/>
                      </Button>
                    </div>
                  )}
                  <Alert className="w-full">
                    <AlertDescription className="text-center">
                      ⏱️ O pagamento será confirmado automaticamente.
                      Você receberá uma notificação assim que for aprovado e o saldo será adicionado à sua carteira.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => window.location.href = createPageUrl(`OrderTracking?orderId=${pixData?.orderId}`)}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Acompanhar Pagamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
