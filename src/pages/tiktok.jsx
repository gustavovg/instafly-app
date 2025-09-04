import React, { useState, useEffect } from "react";
import { Service } from "@/api/entities";
import { Settings } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Music, Heart, Users, Eye, ShoppingCart, TrendingUp, CheckCircle, Star, Zap, ArrowRight, Flame } from "lucide-react";

export default function TikTokPage() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState({ url: "", quantity: "", email: "", whatsapp: "" });
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tiktokServices = await Service.filter({ platform: "TikTok", is_active: true }, 'order_index');
        setServices(tiktokServices);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
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

  const serviceIcons = {
    likes: Heart,
    followers: Users,
    views: Eye
  };

  const getServiceIcon = (serviceType) => {
    const Icon = serviceIcons[serviceType] || Heart;
    return <Icon className="w-6 h-6 text-white" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      {/* Hero Section TikTok */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-bounce"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-block p-4 bg-white/10 rounded-2xl shadow-2xl backdrop-blur-sm">
              <Music className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Vire Viral no
            <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              TikTok
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Curtidas e seguidores para seus vídeos bombarem! 
            <strong className="text-white">Algoritmo friendly e entrega rápida.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">Viral Ready</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Super Rápido</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <Star className="w-5 h-5 text-pink-400" />
              <span className="font-semibold">Qualidade Premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Urgência */}
      <section className="py-8 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 animate-bounce" />
              <span className="font-bold">+12.5K curtidas entregues hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">67 tiktokers comprando agora</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Serviços */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pacotes TikTok</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Faça seus vídeos bombarem com curtidas e seguidores de qualidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map(service => (
              <div key={service.id} className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform hover:scale-105">
                
                {service.badge_type === 'guaranteed' && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    💯 GARANTIDO
                  </div>
                )}

                <div className="p-6 text-center border-b border-gray-600 bg-gradient-to-r from-gray-800 to-purple-800">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      {getServiceIcon(service.service_type)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {service.default_quantity?.toLocaleString()}
                  </h3>
                  <p className="text-lg font-semibold text-gray-200">{service.name}</p>
                </div>

                <div className="py-8 text-center bg-gray-800/30">
                  <span className="text-2xl font-medium text-gray-300">R$</span>
                  <span className="text-4xl font-bold text-white ml-1">
                    {((service.price_per_thousand / 1000) * (service.default_quantity || 1000)).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {(service.features || []).slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <CheckCircle className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full py-6 text-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300" 
                    onClick={() => handleServiceSelect(service)}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Comprar Agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-lg bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Music className="w-6 h-6 text-pink-500" />
              Finalizar Pedido - {selectedService?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-pink-900/30 p-4 rounded-lg text-center border border-pink-700">
              <p className="text-sm text-pink-300 mb-2">Você está comprando:</p>
              <p className="text-2xl font-bold text-white">
                {parseInt(orderData.quantity || 0).toLocaleString()} {selectedService?.name}
              </p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                R$ {finalPrice.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div>
              <Label className="text-gray-300">Link do seu TikTok *</Label>
              <Input 
                value={orderData.url}
                onChange={(e) => setOrderData({...orderData, url: e.target.value})}
                placeholder="https://tiktok.com/@usuario/video/..."
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Quantidade: {parseInt(orderData.quantity || 0).toLocaleString()}</Label>
              <input
                type="range"
                min={selectedService?.min_quantity || 100}
                max={selectedService?.max_quantity || 50000}
                value={orderData.quantity || 0}
                onChange={(e) => setOrderData({...orderData, quantity: e.target.value})}
                className="w-full mt-2"
              />
            </div>

            <div>
              <Label className="text-gray-300">WhatsApp *</Label>
              <Input 
                value={orderData.whatsapp}
                onChange={(e) => setOrderData({...orderData, whatsapp: e.target.value})}
                placeholder="(11) 99999-9999"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">E-mail (opcional)</Label>
              <Input 
                value={orderData.email}
                onChange={(e) => setOrderData({...orderData, email: e.target.value})}
                placeholder="seu@email.com"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)} className="border-gray-600 text-gray-300">
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-pink-600 to-purple-600"
              onClick={() => {
                const params = new URLSearchParams({
                  service: selectedService.id,
                  url: orderData.url,
                  quantity: orderData.quantity,
                  whatsapp: orderData.whatsapp,
                  email: orderData.email
                });
                window.location.href = createPageUrl(`Home?${params.toString()}`);
              }}
            >
              Finalizar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}