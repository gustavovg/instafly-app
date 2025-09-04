import React, { useState, useEffect } from 'react';
import { Order } from '@/api/entities';
import { Service } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Target, Percent, LineChart as LineChartIcon, Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export default function AdminMarketing() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        conversionRate: 0,
        averageTicket: 0,
        sourcePerformance: [],
        campaignPerformance: [],
        totalCost: 0,
        totalProfit: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [orders, services] = await Promise.all([
                    Order.list('-created_date', 5000), // Fetch a large number of orders for analysis
                    Service.list()
                ]);

                const servicesMap = services.reduce((acc, s) => {
                    acc[s.id] = s;
                    return acc;
                }, {});

                const sourceMap = new Map();
                const campaignMap = new Map();
                let totalRevenue = 0;
                let totalCost = 0;

                const paidOrders = orders.filter(o => o.status === 'completed' || o.status === 'processing');

                paidOrders.forEach(order => {
                    const source = order.utm_source || 'direto';
                    const campaign = order.utm_campaign || 'sem_campanha';
                    const price = order.total_price || 0;
                    
                    const service = servicesMap[order.service_id];
                    const cost = service && order.quantity ? (order.quantity / 1000) * (service.cost_per_thousand || 0) : 0;
                    const profit = price - cost;

                    totalRevenue += price;
                    totalCost += cost;

                    // Source Performance
                    const sourceData = sourceMap.get(source) || { name: source, receita: 0, pedidos: 0, custo: 0, lucro: 0 };
                    sourceData.receita += price;
                    sourceData.pedidos += 1;
                    sourceData.custo += cost;
                    sourceData.lucro += profit;
                    sourceMap.set(source, sourceData);

                    // Campaign Performance
                    const campaignData = campaignMap.get(campaign) || { name: campaign, receita: 0, pedidos: 0, custo: 0, lucro: 0 };
                    campaignData.receita += price;
                    campaignData.pedidos += 1;
                    campaignData.custo += cost;
                    campaignData.lucro += profit;
                    campaignMap.set(campaign, campaignData);
                });

                const totalOrders = paidOrders.length;
                const totalProfit = totalRevenue - totalCost;

                setStats({
                    totalRevenue,
                    totalOrders,
                    averageTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                    sourcePerformance: Array.from(sourceMap.values()).sort((a, b) => b.lucro - a.lucro),
                    campaignPerformance: Array.from(campaignMap.values()).sort((a, b) => b.lucro - a.lucro),
                    totalCost,
                    totalProfit,
                });

            } catch (error) {
                console.error("Failed to fetch marketing data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Marketing & Análise de Campanhas</h1>
                <p className="text-gray-600">Entenda a origem e o desempenho de suas vendas.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <DollarSign className="w-5 h-5" />
                            Receita Total (Campanhas)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            Lucro Total (Campanhas)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalProfit)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <ShoppingCart className="w-5 h-5" />
                            Pedidos (Campanhas)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalOrders}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Target className="w-5 h-5" />
                            Ticket Médio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(stats.averageTicket)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Desempenho por Canal de Origem</CardTitle>
                        <CardDescription>Receita, Lucro e Pedidos por fonte de tráfego.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.sourcePerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={formatCurrency} />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="receita" fill="#8884d8" name="Receita" />
                                <Bar dataKey="lucro" fill="#82ca9d" name="Lucro" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mix de Canais (Pedidos)</CardTitle>
                         <CardDescription>Distribuição dos pedidos entre os canais.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.sourcePerformance}
                                    dataKey="pedidos"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                >
                                    {stats.sourcePerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} pedidos`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Análise Detalhada de Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campanha (utm_campaign)</TableHead>
                                <TableHead className="text-right">Receita</TableHead>
                                <TableHead className="text-right">Custo</TableHead>
                                <TableHead className="text-right">Lucro</TableHead>
                                <TableHead className="text-right">Pedidos</TableHead>
                                <TableHead className="text-right">Ticket Médio</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.campaignPerformance.map((campaign) => (
                                <TableRow key={campaign.name}>
                                    <TableCell className="font-medium">{campaign.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(campaign.receita)}</TableCell>
                                    <TableCell className="text-right text-red-600">{formatCurrency(campaign.custo)}</TableCell>
                                    <TableCell className="text-right text-green-600 font-bold">{formatCurrency(campaign.lucro)}</TableCell>
                                    <TableCell className="text-right">{campaign.pedidos}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(campaign.pedidos > 0 ? campaign.receita / campaign.pedidos : 0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}