import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { Service } from "@/api/entities";
import { User } from "@/api/entities";
import { Affiliate } from "@/api/entities";
import { AffiliateEarning } from "@/api/entities";
import { CustomerSubscription } from "@/api/entities";
import { CustomerWallet } from "@/api/entities";
import { WalletTransaction } from "@/api/entities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, BarChart as BarChartIcon, Users, Clock, Target, Percent, Activity, AlertTriangle, CheckCircle2, Zap, Star, Calendar, Trophy, Eye, Wallet, UserCheck, Repeat } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format, subDays, startOfDay, endOfDay, isToday, isYesterday, subHours, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    revenue: 0, 
    totalCost: 0,
    profit: 0, 
    margin: 0, 
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    todayOrders: 0,
    yesterdayOrders: 0,
    averageOrderValue: 0,
    topService: null,
    conversionRate: 0,
    totalUsers: 0,
    recentOrders: [],
    monthlyGrowth: 0,
    weeklyRevenue: 0,
    hourlyData: [],
    // Novas métricas
    totalAffiliates: 0,
    affiliateRevenue: 0,
    totalSubscriptions: 0,
    subscriptionRevenue: 0,
    walletBalance: 0,
    walletDeposits: 0,
    expressOrders: 0,
    cancelledOrders: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [revenueByPlatform, setRevenueByPlatform] = useState([]);
  const [profitabilityData, setProfitabilityData] = useState([]);
  const [affiliateStats, setAffiliateStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d'); // 7d, 30d, 3M

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const [orders, services, users, affiliates, affiliateEarnings, subscriptions, wallets, walletTransactions] = await Promise.all([
          Order.list("-created_date"),
          Service.list(),
          User.list(),
          Affiliate.list(),
          AffiliateEarning.list(),
          CustomerSubscription.list(),
          CustomerWallet.list(),
          WalletTransaction.list()
        ]);
        
        // Criar mapas para facilitar consultas
        const servicesMap = services.reduce((acc, s) => {
          acc[s.id] = s;
          return acc;
        }, {});
        
        // Inicializar contadores e dados
        let totalRevenue = 0;
        let totalCost = 0;
        let completedOrders = 0;
        let pendingOrders = 0;
        let cancelledOrders = 0;
        let expressOrders = 0;
        let todayRevenue = 0;
        let yesterdayRevenue = 0;
        let todayOrders = 0;
        let yesterdayOrders = 0;
        let weeklyRevenue = 0;

        const dailyDataMap = new Map();
        const monthlyDataMap = new Map();
        const serviceCountMap = new Map();
        const serviceRevenueMap = new Map();
        const serviceProfitMap = new Map();
        const statusCountMap = new Map();
        const platformRevenueMap = new Map();
        const hourlyDataMap = new Map();
        const recentOrders = [];

        const today = new Date();
        const yesterday = subDays(today, 1);
        const sevenDaysAgo = subDays(today, 6);
        const weekAgo = subDays(today, 7);
        const monthAgo = subMonths(today, 1);

        // Inicializar dados horários (últimas 24h)
        for (let i = 23; i >= 0; i--) {
          const hour = subHours(today, i);
          const hourKey = format(hour, 'HH:00');
          hourlyDataMap.set(hourKey, { revenue: 0, orders: 0 });
        }

        orders.forEach(order => {
          const orderDate = new Date(order.created_date);
          const service = servicesMap[order.service_id];
          
          // Contagem de status geral
          statusCountMap.set(order.status, (statusCountMap.get(order.status) || 0) + 1);
          
          // Contagem de pedidos express
          if (order.is_express) {
            expressOrders++;
          }

          // Contagem de pedidos cancelados
          if (order.status === 'cancelled' || order.status === 'refunded') {
            cancelledOrders++;
          }
          
          // Contagem e receita por serviço
          if (order.service_name) {
            serviceCountMap.set(order.service_name, (serviceCountMap.get(order.service_name) || 0) + 1);
            if (order.status === 'completed') {
              serviceRevenueMap.set(order.service_name, (serviceRevenueMap.get(order.service_name) || 0) + order.total_price);
              
              // Calcular lucro por serviço
              if (service && service.cost_per_thousand && order.quantity) {
                const orderCost = (order.quantity / 1000) * service.cost_per_thousand;
                const orderProfit = order.total_price - orderCost;
                serviceProfitMap.set(order.service_name, (serviceProfitMap.get(order.service_name) || 0) + orderProfit);
              }
            }
          }

          // Pedidos recentes (últimos 15)
          if (recentOrders.length < 15) {
            recentOrders.push({
              id: order.id,
              service_name: order.service_name,
              total_price: order.total_price,
              status: order.status,
              created_date: order.created_date,
              is_express: order.is_express,
              customer_email: order.customer_email
            });
          }

          // Dados por período
          if (isToday(orderDate)) {
            todayOrders++;
            if (order.status === 'completed') {
              todayRevenue += order.total_price || 0;
            }
          }

          if (isYesterday(orderDate)) {
            yesterdayOrders++;
            if (order.status === 'completed') {
              yesterdayRevenue += order.total_price || 0;
            }
          }

          // Receita semanal
          if (orderDate >= weekAgo) {
            if (order.status === 'completed') {
              weeklyRevenue += order.total_price || 0;
            }
          }

          // Dados horários (últimas 24h)
          if (orderDate >= subHours(today, 24)) {
            const hourKey = format(orderDate, 'HH:00');
            const hourData = hourlyDataMap.get(hourKey) || { revenue: 0, orders: 0 };
            hourData.orders += 1;
            if (order.status === 'completed') {
              hourData.revenue += order.total_price || 0;
            }
            hourlyDataMap.set(hourKey, hourData);
          }

          if (order.status === 'completed') {
            totalRevenue += order.total_price || 0;
            completedOrders++;
            
            // Calcular custo
            let orderCost = 0;
            if (service && service.cost_per_thousand && order.quantity) {
              orderCost = (order.quantity / 1000) * service.cost_per_thousand;
              totalCost += orderCost;
            }

            // Receita por plataforma
            if (service) {
              const platform = service.platform;
              platformRevenueMap.set(platform, (platformRevenueMap.get(platform) || 0) + order.total_price);
            }

            // Dados diários para gráficos
            const orderDay = startOfDay(orderDate);
            if (orderDay >= startOfDay(sevenDaysAgo)) {
              const formattedDateKey = format(orderDay, 'yyyy-MM-dd');
              const existingData = dailyDataMap.get(formattedDateKey) || { revenue: 0, cost: 0, orders: 0, profit: 0 };
              existingData.revenue += order.total_price || 0;
              existingData.cost += orderCost;
              existingData.profit += (order.total_price || 0) - orderCost;
              existingData.orders += 1;
              dailyDataMap.set(formattedDateKey, existingData);
            }

            // Dados mensais
            const monthKey = format(orderDate, 'yyyy-MM');
            const monthData = monthlyDataMap.get(monthKey) || { revenue: 0, orders: 0, profit: 0 };
            monthData.revenue += order.total_price || 0;
            monthData.profit += (order.total_price || 0) - orderCost;
            monthData.orders += 1;
            monthlyDataMap.set(monthKey, monthData);

          } else if (order.status === 'pending_payment' || order.status === 'processing') {
            pendingOrders++;
          }
        });

        // Estatísticas de afiliados
        const totalAffiliates = affiliates.length;
        const affiliateRevenue = affiliateEarnings.reduce((sum, earning) => sum + earning.order_value, 0);
        
        // Estatísticas de assinaturas
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
        const subscriptionRevenue = activeSubscriptions.reduce((sum, sub) => {
          // Assumindo que temos o valor mensal salvo ou calculamos baseado no plano
          return sum + 0; // Precisará ser ajustado quando tivermos os dados do plano
        }, 0);

        // Estatísticas da carteira
        const totalWalletBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
        const totalWalletDeposits = walletTransactions
          .filter(t => t.transaction_type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0);
        
        // Calcular métricas
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
        const conversionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;
        
        // Crescimento mensal
        const thisMonth = monthlyDataMap.get(format(today, 'yyyy-MM')) || { revenue: 0 };
        const lastMonth = monthlyDataMap.get(format(monthAgo, 'yyyy-MM')) || { revenue: 0 };
        const monthlyGrowth = lastMonth.revenue > 0 ? ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100 : 0;

        // Serviço mais vendido
        const topService = Array.from(serviceRevenueMap.entries())
          .sort(([,a], [,b]) => b - a)[0];

        setStats({
          revenue: totalRevenue,
          totalCost: totalCost,
          profit: totalProfit,
          margin: profitMargin,
          totalOrders: orders.length,
          completedOrders: completedOrders,
          pendingOrders: pendingOrders,
          cancelledOrders: cancelledOrders,
          expressOrders: expressOrders,
          todayRevenue: todayRevenue,
          yesterdayRevenue: yesterdayRevenue,
          todayOrders: todayOrders,
          yesterdayOrders: yesterdayOrders,
          averageOrderValue: averageOrderValue,
          topService: topService ? { name: topService[0], revenue: topService[1] } : null,
          conversionRate: conversionRate,
          totalUsers: users.length,
          recentOrders: recentOrders,
          monthlyGrowth: monthlyGrowth,
          weeklyRevenue: weeklyRevenue,
          hourlyData: Array.from(hourlyDataMap.entries()).map(([hour, data]) => ({
            hour,
            ...data
          })),
          totalAffiliates: totalAffiliates,
          affiliateRevenue: affiliateRevenue,
          totalSubscriptions: activeSubscriptions.length,
          subscriptionRevenue: subscriptionRevenue,
          walletBalance: totalWalletBalance,
          walletDeposits: totalWalletDeposits
        });

        // Preparar dados para gráficos
        const last7DaysData = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(today, 6 - i);
          const formattedDateKey = format(date, 'yyyy-MM-dd');
          const dayStats = dailyDataMap.get(formattedDateKey) || { revenue: 0, cost: 0, orders: 0, profit: 0 };
          
          return {
            date: format(date, 'dd/MM'),
            fullDate: format(date, 'dd/MM/yyyy'),
            Receita: dayStats.revenue,
            Custo: dayStats.cost,
            Lucro: dayStats.profit,
            Pedidos: dayStats.orders
          };
        });
        setChartData(last7DaysData);

        // Top 5 serviços mais vendidos (por receita)
        const sortedServices = Array.from(serviceRevenueMap.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, revenue]) => ({ 
            name: name.length > 25 ? name.substring(0, 25) + '...' : name, 
            Receita: revenue,
            Pedidos: serviceCountMap.get(name) || 0,
            Lucro: serviceProfitMap.get(name) || 0
          }));
        setTopServices(sortedServices);

        // Dados de lucratividade por serviço
        const profitabilityArray = Array.from(serviceProfitMap.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, profit]) => ({
            name: name.length > 20 ? name.substring(0, 20) + '...' : name,
            Lucro: profit,
            Receita: serviceRevenueMap.get(name) || 0,
            Margem: serviceRevenueMap.get(name) > 0 ? ((profit / serviceRevenueMap.get(name)) * 100) : 0
          }));
        setProfitabilityData(profitabilityArray);

        // Dados de status
        const statusArray = Array.from(statusCountMap.entries()).map(([status, count]) => ({
          name: status === 'completed' ? 'Concluído' : 
                status === 'pending_payment' ? 'Aguardando Pagamento' :
                status === 'processing' ? 'Processando' : 
                status === 'cancelled' ? 'Cancelado' : 'Outros',
          value: count,
          percentage: ((count / orders.length) * 100).toFixed(1)
        }));
        setStatusData(statusArray);

        // Dados mensais (últimos 6 meses)
        const monthlyArray = Array.from({ length: 6 }, (_, i) => {
          const date = subMonths(today, 5 - i);
          const monthKey = format(date, 'yyyy-MM');
          const monthStats = monthlyDataMap.get(monthKey) || { revenue: 0, orders: 0, profit: 0 };
          
          return {
            month: format(date, 'MMM/yy', { locale: ptBR }),
            Receita: monthStats.revenue,
            Pedidos: monthStats.orders,
            Lucro: monthStats.profit
          };
        });
        setMonthlyData(monthlyArray);

        // Receita por plataforma
        const platformArray = Array.from(platformRevenueMap.entries())
          .sort(([,a], [,b]) => b - a)
          .map(([platform, revenue]) => ({
            name: platform,
            value: revenue,
            percentage: ((revenue / totalRevenue) * 100).toFixed(1)
          }));
        setRevenueByPlatform(platformArray);

        // Estatísticas de afiliados por receita gerada
        const affiliateStatsArray = affiliates.map(affiliate => {
          const affiliateEarningsData = affiliateEarnings.filter(e => e.affiliate_id === affiliate.id);
          const totalGenerated = affiliateEarningsData.reduce((sum, e) => sum + e.order_value, 0);
          const totalCommission = affiliateEarningsData.reduce((sum, e) => sum + e.commission_amount, 0);
          
          return {
            name: affiliate.user_email.split('@')[0],
            Vendas: totalGenerated,
            Comissão: totalCommission,
            Pedidos: affiliateEarningsData.length
          };
        }).sort((a, b) => b.Vendas - a.Vendas).slice(0, 5);
        setAffiliateStats(affiliateStatsArray);

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'pending_payment': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'processing': return 'Processando';
      case 'pending_payment': return 'Aguardando';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getGrowthIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <BarChartIcon className="w-4 h-4 text-red-500 rotate-180" />;
    return <BarChartIcon className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (current, previous) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600 mt-1">Panorama completo do seu negócio</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          Atualizado em tempo real
        </div>
      </div>

      {/* Métricas Principais - Linha 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-green-100 text-xs">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-blue-100 text-xs">Lucro Líquido</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.profit)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Percent className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-purple-100 text-xs">Margem</p>
                <p className="text-2xl font-bold">{stats.margin.toFixed(1)}%</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <ShoppingCart className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-orange-100 text-xs">Pedidos</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Target className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-pink-100 text-xs">Conversão</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <BarChartIcon className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-indigo-100 text-xs">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <UserCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-cyan-100 text-xs">Afiliados</p>
                <p className="text-2xl font-bold">{stats.totalAffiliates}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Wallet className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-teal-100 text-xs">Carteiras</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.walletBalance)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Comparações Hoje vs Ontem + Métricas Especiais */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Hoje</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.todayRevenue)}</p>
              </div>
              {getGrowthIcon(stats.todayRevenue, stats.yesterdayRevenue)}
            </div>
            <p className={`text-xs ${getGrowthColor(stats.todayRevenue, stats.yesterdayRevenue)}`}>
              vs {formatCurrency(stats.yesterdayRevenue)} ontem
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Hoje</p>
                <p className="text-xl font-bold text-blue-600">{stats.todayOrders}</p>
              </div>
              {getGrowthIcon(stats.todayOrders, stats.yesterdayOrders)}
            </div>
            <p className={`text-xs ${getGrowthColor(stats.todayOrders, stats.yesterdayOrders)}`}>
              vs {stats.yesterdayOrders} ontem
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Express</p>
                <p className="text-xl font-bold text-yellow-600">{stats.expressOrders}</p>
              </div>
              <Zap className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">pedidos prioritários</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assinaturas</p>
                <p className="text-xl font-bold text-purple-600">{stats.totalSubscriptions}</p>
              </div>
              <Repeat className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">receita recorrente</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crescimento</p>
                <p className={`text-xl font-bold ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
                </p>
              </div>
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">vs mês anterior</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">aguardando ação</p>
          </CardHeader>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Area type="monotone" dataKey="Receita" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="Lucro" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Serviços Mais Lucrativos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitabilityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="Lucro" fill="#10b981" />
                <Bar dataKey="Receita" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda Linha de Gráficos */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} pedidos`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByPlatform.map((platform, index) => (
                <div key={platform.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(platform.value)}</p>
                    <p className="text-xs text-gray-500">{platform.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {affiliateStats.map((affiliate, index) => (
                <div key={affiliate.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{affiliate.name}</p>
                    <p className="text-xs text-gray-500">{affiliate.Pedidos} pedidos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{formatCurrency(affiliate.Vendas)}</p>
                    <p className="text-xs text-blue-600">{formatCurrency(affiliate.Comissão)} comissão</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Últimos Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      {order.service_name}
                      {order.is_express && <Zap className="w-4 h-4 text-yellow-500" />}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.created_date), 'dd/MM/yy HH:mm')} - {order.customer_email?.split('@')[0]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(order.total_price)}</p>
                  <p className={`text-xs ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução dos Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorMonthlyRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMonthlyProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'Receita' || name === 'Lucro' ? formatCurrency(value) : value, 
                  name
                ]}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="Receita" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorMonthlyRevenue)" 
                strokeWidth={2} 
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="Lucro" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorMonthlyProfit)" 
                strokeWidth={2} 
              />
              <Bar yAxisId="right" dataKey="Pedidos" fill="#8b5cf6" opacity={0.7} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}