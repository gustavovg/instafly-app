import React, { useState, useEffect } from 'react';
import { DripFeedOrder } from '@/api/entities';
import { Order } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Calendar, BarChart3 } from 'lucide-react';

export default function AdminDripFeed() {
  const [dripOrders, setDripOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDripOrders();
  }, []);

  const loadDripOrders = async () => {
    try {
      const orders = await DripFeedOrder.list('-created_date');
      setDripOrders(orders);
    } catch (error) {
      console.error('Erro ao carregar pedidos drip-feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await DripFeedOrder.update(orderId, { status: newStatus });
      loadDripOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.active;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <BarChart3 className="w-4 h-4" />;
      case 'cancelled': return <RotateCcw className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const calculateProgress = (delivered, total) => {
    return total > 0 ? (delivered / total) * 100 : 0;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Entregas Graduais (Drip-Feed)</h1>
        <p className="text-gray-600 mt-2">Gerencie pedidos com entrega escalonada</p>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dripOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dripOrders.filter(order => order.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pausados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {dripOrders.filter(order => order.status === 'paused').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dripOrders.filter(order => order.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos Drip-Feed */}
      <div className="space-y-4">
        {dripOrders.map(order => {
          const progress = calculateProgress(order.delivered_quantity, order.total_quantity);
          const isActive = order.status === 'active';
          const isPaused = order.status === 'paused';
          
          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      Pedido #{order.order_id.slice(0, 8)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.delivered_quantity.toLocaleString()} / {order.total_quantity.toLocaleString()} entregues
                      | {order.daily_quantity.toLocaleString()} por dia
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isPaused && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'active')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Retomar
                      </Button>
                    )}
                    {isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'paused')}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pausar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso da Entrega</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Informações</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Total: {order.total_quantity.toLocaleString()}</div>
                      <div>Entregue: {order.delivered_quantity.toLocaleString()}</div>
                      <div>Restante: {(order.total_quantity - order.delivered_quantity).toLocaleString()}</div>
                      <div>Por dia: {order.daily_quantity.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Cronograma</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Próxima entrega: {order.next_delivery_date ? new Date(order.next_delivery_date).toLocaleDateString('pt-BR') : 'Não agendada'}
                      </div>
                      <div>
                        Dias restantes: ~{Math.ceil((order.total_quantity - order.delivered_quantity) / order.daily_quantity)}
                      </div>
                    </div>
                  </div>
                </div>

                {order.delivery_history && order.delivery_history.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Histórico Recente</h4>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {order.delivery_history.slice(-3).map((delivery, index) => (
                        <div key={index} className="flex justify-between text-xs text-gray-600">
                          <span>{new Date(delivery.date).toLocaleDateString('pt-BR')}</span>
                          <span>{delivery.quantity.toLocaleString()} entregues</span>
                          <Badge variant="outline" className="text-xs">{delivery.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {dripOrders.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido drip-feed encontrado</h3>
          <p className="text-gray-600">Pedidos com entrega gradual aparecerão aqui quando forem criados.</p>
        </div>
      )}
    </div>
  );
}