import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  ShieldCheck,
  Rocket,
  CheckCircle,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Music,
  ThumbsUp,
  Heart,
  Eye,
  Users,
  Star,
  Lock,
  Clock,
  MessageSquare,
  Sparkles,
} from "lucide-react";

// Mock data para desenvolvimento
const MOCK_SETTINGS = {
  brand_name: 'InstaFLY',
  logo_url: null,
  primary_color: '#8b5cf6',
  secondary_color: '#ec4899',
  site_description: 'Impulsione suas redes sociais com nossos serviços de alta qualidade.'
};

const MOCK_SERVICES = [
  {
    id: "1",
    service: "1",
    name: "Seguidores Brasileiros Instagram",
    platform: "Instagram",
    service_type: "followers",
    price: "59.99",
    price_per_thousand: 59.99,
    min_quantity: 100,
    max_quantity: 10000,
    default_quantity: 1000,
    is_brazilian: true,
    is_popular: true,
    delivery_time: "1-2 horas",
    show_in_homepage: true,
    is_active: true,
    features: [
      { icon: "Star", text: "Alta qualidade" },
      { icon: "Lock", text: "Não precisa da senha" },
      { icon: "ThumbsUp", text: "Garantia contra quedas" },
      { icon: "ShieldCheck", text: "Seguro e Fácil" },
      { icon: "Clock", text: "Entrega Rápida" },
      { icon: "MessageSquare", text: "Suporte 24 horas" },
      { icon: "CheckCircle", text: "Pagamentos Seguros" },
    ]
  },
  {
    id: "2",
    service: "2",
    name: "Curtidas Instagram",
    platform: "Instagram",
    service_type: "likes",
    price: "29.99",
    price_per_thousand: 29.99,
    min_quantity: 50,
    max_quantity: 5000,
    default_quantity: 500,
    is_brazilian: false,
    is_popular: true,
    delivery_time: "30 minutos",
    show_in_homepage: true,
    is_active: true,
    features: [
      { icon: "Zap", text: "Entrega instantânea" },
      { icon: "Heart", text: "Curtidas reais" },
      { icon: "Star", text: "Alta qualidade" },
    ]
  },
  {
    id: "3",
    service: "3",
    name: "Visualizações TikTok",
    platform: "TikTok",
    service_type: "views",
    price: "19.99",
    price_per_thousand: 19.99,
    min_quantity: 100,
    max_quantity: 100000,
    default_quantity: 1000,
    is_brazilian: false,
    is_popular: false,
    delivery_time: "1 hora",
    show_in_homepage: true,
    is_active: true,
    features: [
      { icon: "Eye", text: "Visualizações reais" },
      { icon: "Rocket", text: "Crescimento rápido" },
    ]
  }
];

const platformIcons = {
  Instagram: Instagram,
  Facebook: Facebook,
  YouTube: Youtube,
  Twitter: Twitter,
  TikTok: Music,
};

const serviceIcons = {
  likes: Heart,
  followers: Users,
  views: Eye,
  default: ThumbsUp
};

const featureIconsList = {
  Star,
  Lock,
  ThumbsUp,
  ShieldCheck,
  Clock,
  MessageSquare,
  CheckCircle,
  Zap,
  Heart,
  Eye,
  Rocket
};

export default function HomeWithoutAuth() {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [orderData, setOrderData] = useState({ 
    url: "", 
    quantity: "", 
    email: "", 
    whatsapp: "" 
  });

  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      try {
        // Try to load real data first
        const { Settings, Service } = await import('@/api/entities');
        
        const [settingsResult, servicesResult] = await Promise.all([
          Settings.list(),
          Service.filter({ show_in_homepage: true, is_active: true })
        ]);

        setSettings(settingsResult.length > 0 ? settingsResult[0] : MOCK_SETTINGS);
        setServices(servicesResult.length > 0 ? servicesResult : MOCK_SERVICES);
      } catch (error) {
        console.log('Using mock data due to API error:', error);
        // Use mock data if API fails
        setSettings(MOCK_SETTINGS);
        setServices(MOCK_SERVICES);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOrderClick = (service) => {
    setSelectedService(service);
    setOrderData({ 
      url: "", 
      quantity: service.default_quantity || service.min_quantity || 100, 
      email: "", 
      whatsapp: "" 
    });
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    alert(`Pedido criado para: ${selectedService.name}\nQuantidade: ${orderData.quantity}\nURL: ${orderData.url}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-medium text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  const effectiveSettings = settings || MOCK_SETTINGS;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg"
              style={effectiveSettings?.primary_color && effectiveSettings?.secondary_color ? { background: `linear-gradient(to right, ${effectiveSettings.primary_color}, ${effectiveSettings.secondary_color})` } : {}}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {effectiveSettings?.brand_name || 'InstaFLY'}
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-600 hover:text-purple-600 transition">Início</a>
            <a href="/faq" className="text-gray-600 hover:text-purple-600 transition">Ajuda</a>
            <a href="/ordertracking" className="text-gray-600 hover:text-purple-600 transition">Rastrear Pedido</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Impulsione suas <span className="text-yellow-300">Redes Sociais</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            {effectiveSettings?.site_description || 'Aumente seus seguidores, curtidas e visualizações com nossos serviços de alta qualidade'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              ⚡ Entrega Rápida
            </Badge>
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              🛡️ 100% Seguro
            </Badge>
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              🇧🇷 Suporte 24h
            </Badge>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Nossos Serviços
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const PlatformIcon = platformIcons[service.platform] || Instagram;
              const ServiceIcon = serviceIcons[service.service_type] || serviceIcons.default;
              
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <PlatformIcon className="w-6 h-6 text-purple-600" />
                        <ServiceIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      {service.is_popular && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          🔥 Popular
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>
                      {service.platform} • {service.delivery_time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-purple-600">
                          R$ {service.price_per_thousand?.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-sm text-gray-500">por mil</span>
                      </div>
                      
                      <div className="space-y-2">
                        {service.features?.slice(0, 3).map((feature, idx) => {
                          const FeatureIcon = featureIconsList[feature.icon] || CheckCircle;
                          return (
                            <div key={idx} className="flex items-center space-x-2 text-sm">
                              <FeatureIcon className="w-4 h-4 text-green-600" />
                              <span>{feature.text}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Button 
                        onClick={() => handleOrderClick(service)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Pedir Agora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Order Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Fazer Pedido</CardTitle>
              <CardDescription>{selectedService.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <Label htmlFor="url">URL/Link</Label>
                  <Input
                    id="url"
                    value={orderData.url}
                    onChange={(e) => setOrderData({...orderData, url: e.target.value})}
                    placeholder="Cole o link aqui..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={orderData.quantity}
                    onChange={(e) => setOrderData({...orderData, quantity: e.target.value})}
                    min={selectedService.min_quantity}
                    max={selectedService.max_quantity}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={orderData.whatsapp}
                    onChange={(e) => setOrderData({...orderData, whatsapp: e.target.value})}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Criar Pedido
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedService(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-2 rounded text-sm">
        ✅ Home sem autenticação funcionando!
      </div>
    </div>
  );
}