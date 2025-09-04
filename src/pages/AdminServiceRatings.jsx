import React, { useState, useEffect } from 'react';
import { ServiceRating } from '@/api/entities';
import { Service } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function AdminServiceRatings() {
  const [ratings, setRatings] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceStats, setServiceStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ratingsData, servicesData] = await Promise.all([
        ServiceRating.list('-created_date'),
        Service.list()
      ]);
      
      setRatings(ratingsData);
      setServices(servicesData);
      
      // Calcular estatísticas por serviço
      const stats = servicesData.map(service => {
        const serviceRatings = ratingsData.filter(r => r.service_id === service.id);
        const avgRating = serviceRatings.length > 0 
          ? serviceRatings.reduce((sum, r) => sum + r.rating, 0) / serviceRatings.length 
          : 0;
        const avgSpeed = serviceRatings.length > 0 
          ? serviceRatings.reduce((sum, r) => sum + (r.delivery_speed || 0), 0) / serviceRatings.length 
          : 0;
        const avgQuality = serviceRatings.length > 0 
          ? serviceRatings.reduce((sum, r) => sum + (r.service_quality || 0), 0) / serviceRatings.length 
          : 0;

        return {
          service,
          totalRatings: serviceRatings.length,
          averageRating: avgRating,
          averageSpeed: avgSpeed,
          averageQuality: avgQuality,
          recentRatings: serviceRatings.slice(0, 5)
        };
      }).sort((a, b) => b.totalRatings - a.totalRatings);

      setServiceStats(stats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (rating >= 3.5) return <Badge className="bg-yellow-100 text-yellow-800">Bom</Badge>;
    if (rating >= 2.5) return <Badge className="bg-orange-100 text-orange-800">Regular</Badge>;
    return <Badge className="bg-red-100 text-red-800">Ruim</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Avaliações dos Serviços</h1>
        <p className="text-gray-600 mt-2">Monitore a qualidade e satisfação dos seus serviços</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Média Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRatingColor(ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0)}`}>
              {ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : '0.0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Serviços Avaliados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {serviceStats.filter(s => s.totalRatings > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {serviceStats.filter(s => s.averageRating < 3).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Serviços */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Ranking de Qualidade dos Serviços</h2>
        
        {serviceStats.map((stat, index) => (
          <Card key={stat.service.id} className={`${stat.averageRating < 3 && stat.totalRatings > 0 ? 'border-red-200 bg-red-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    {stat.service.name}
                    <Badge variant="outline">{stat.service.platform}</Badge>
                    {stat.totalRatings > 0 && getRatingBadge(stat.averageRating)}
                    {stat.averageRating < 3 && stat.totalRatings > 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Atenção
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {stat.totalRatings} avaliações
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(stat.averageRating))}
                    <span className={`font-bold ${getRatingColor(stat.averageRating)}`}>
                      {stat.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {stat.totalRatings > 0 && (
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Métricas Detalhadas</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Qualidade Geral:</span>
                        <span className={getRatingColor(stat.averageRating)}>
                          {stat.averageRating.toFixed(1)}/5
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Velocidade:</span>
                        <span className={getRatingColor(stat.averageSpeed)}>
                          {stat.averageSpeed.toFixed(1)}/5
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Qualidade do Serviço:</span>
                        <span className={getRatingColor(stat.averageQuality)}>
                          {stat.averageQuality.toFixed(1)}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Avaliações Recentes</h4>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {stat.recentRatings.map(rating => (
                        <div key={rating.id} className="flex items-start gap-2 text-xs">
                          <div className="flex">
                            {renderStars(rating.rating)}
                          </div>
                          {rating.comment && (
                            <p className="text-gray-600 flex-1 truncate">"{rating.comment}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}