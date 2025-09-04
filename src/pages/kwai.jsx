import React, { useState, useEffect } from "react";
import { Service } from "@/api/entities";
import { Settings } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Music, Heart, Users, Eye, ShoppingCart, Sparkles, TrendingUp, CheckCircle, Star, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function KwaiPage() {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState({ url: "", quantity: "", email: "", whatsapp: "" });
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const cacheKey = 'instafly_kwai_data_v1';
        const cachedData = localStorage.getItem(cacheKey);
        const now = new Date().getTime();
        const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (now - timestamp < CACHE_DURATION) {
            console.log("Loading Kwai data from cache.");
            setServices(data.services || []);
            setSettings(data.settings);
            return;
          }
        }

        console.log("Fetching Kwai data from API.");
        const [kwaiServices, settingsData] = await Promise.all([
          Service.filter({ platform: "Kwai", is_active: true }, 'order_index'),
          Settings.list()
        ]);
        
        const settingsToDisplay = settingsData.length > 0 ? settingsData[0] : null;

        setServices(kwaiServices);
        setSettings(settingsToDisplay);

        const dataToCache = {
          timestamp: now,
          data: {
            services: kwaiServices,
            settings: settingsToDisplay
          }
        };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));

      } catch (error) {
        console.error("Erro ao carregar dados do Kwai:", error);
      }
    };
    loadData();
  }, []);
  useEffect(() => {
    if (selectedService && orderData.quantity) {
      const quantity = parseInt(orderData.quantity) || 0;
      const pricePerUnit = selectedService.price_per_thousand / 1000;
      setFinalPrice(pricePerUnit * quantity);
    }
  }, [selectedService, orderData.quantity]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setOrderData({
      url: "",
      quantity: service.default_quantity || service.min_quantity || 100,
      email: "",
      whatsapp: ""
    });
    setShowCheckout(true);
  };

  const handleQuantityChange = (e) => {
    setOrderData({ ...orderData, quantity: e.target.value });
  };

  const serviceIcons = {
    followers: Users,
    likes: Heart,
    views: Eye
  };

  const getServiceIcon = (serviceType) => {
    const Icon = serviceIcons[serviceType] || Eye;
    return <Icon className="w-6 h-6 text-white" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-red-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-block p-4 bg-white/20 rounded-2xl shadow-2xl backdrop-blur-sm">
              <Music className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Cresça no
            <span className="block text-yellow-300">
              Kwai
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Seguidores e curtidas para seus vídeos curtos.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Escolha seu Pacote Kwai</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map(service => {
              const isPopular = service.is_popular || service.badge_type === 'popular';
              return (
                <div key={service.id} className={`relative bg-white rounded-2xl shadow-xl border overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform hover:scale-105 ${isPopular ? 'border-orange-200 ring-2 ring-orange-300' : 'border-gray-100'}`}>
                  {isPopular && (
                    <Badge className="absolute top-4 left-4 bg-orange-500 text-white">🔥 Mais Vendido</Badge>
                  )}
                  <div className="p-6 text-center border-b">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        {getServiceIcon(service.service_type)}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{service.default_quantity?.toLocaleString()}</h3>
                    <p className="text-lg font-semibold text-gray-700 mb-4">{service.name}</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <span className="font-bold text-lg text-orange-600 block">Kwai</span>
                         <div className="mt-1">
                            {service.is_brazilian ? (
                              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                🇧🇷 Brasileiros
                              </span>
                            ) : (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                                🌎 Mundiais
                              </span>
                            )}
                          </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-8 text-center bg-gray-50">
                    <span className="text-2xl font-medium text-gray-600">R$</span>
                    <span className="text-5xl font-bold tracking-tighter ml-1">
                      {(service.price_per_thousand / 1000 * service.default_quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="p-6 flex-grow">
                    <ul className="space-y-4">
                      {(service.features || []).map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <CheckCircle className="w-5 h-5 mr-3 text-orange-500" />
                          <span className="text-sm font-medium">{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-gray-50 border-t">
                    <Button className="w-full text-lg py-6 bg-orange-500 hover:bg-orange-600" onClick={() => handleServiceSelect(service)}>
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      Comprar Agora
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Pedido - {selectedService?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="url">Link do Vídeo/Perfil</Label>
              <Input id="url" value={orderData.url} onChange={e => setOrderData({...orderData, url: e.target.value})} placeholder="https://kwai.com/..." />
            </div>
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" value={orderData.quantity} onChange={handleQuantityChange} />
            </div>
            <div>
              <Label htmlFor="whatsapp">Seu WhatsApp</Label>
              <Input id="whatsapp" type="tel" value={orderData.whatsapp} onChange={e => setOrderData({...orderData, whatsapp: e.target.value})} placeholder="(11) 99999-9999" />
            </div>
            <div className="text-2xl font-bold text-center">
              Total: R$ {finalPrice.toFixed(2).replace('.', ',')}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>Cancelar</Button>
            <Button className="bg-orange-500 hover:bg-orange-600">Ir para Pagamento <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}