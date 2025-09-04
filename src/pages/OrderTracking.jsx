
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Order } from "@/api/entities";
import { Settings } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  CreditCard,
  Package,
  Truck,
  Star,
  Calendar,
  MapPin,
  ExternalLink,
  Rocket,
  LifeBuoy,
  Loader2 // Importar Loader2 para o ícone de carregamento
} from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { checkOrderStatus } from "@/api/functions"; // Importar checkOrderStatus

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null); // Renomeado searchedOrder para order
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [searched, setSearched] = useState(false); // Novo estado para controlar se uma busca foi feita
  const [trackingLog, setTrackingLog] = useState([]); // Novo estado para o log de rastreamento

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get("orderId");
    if (idFromUrl) {
      setOrderId(idFromUrl);
      handleSearch(idFromUrl);
    }
    fetchSettings();
  }, [location.search]);

  // Novo useEffect para polling
  useEffect(() => {
    let intervalId;
    if (order && ['pending_payment', 'processing', 'drip_feed_active'].includes(order.status)) { // Added drip_feed_active to polling
        intervalId = setInterval(async () => {
            try {
                // Assuming checkOrderStatus returns { data: { status: '...' } }
                const { data } = await checkOrderStatus({ orderId: order.id });
                if (data && data.status !== order.status) {
                    // Se o status mudou, busca o pedido completo novamente para atualizar a UI
                    handleSearch(order.short_id || order.id);
                }
            } catch (error) {
                console.error("Erro ao verificar status:", error);
            }
        }, 5000); // Verifica a cada 5 segundos
    }

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar ou se o order mudar
  }, [order]); // Dependência no objeto 'order'

  const fetchSettings = async () => {
    try {
      const settingsData = await Settings.list();
      if (settingsData.length > 0) {
        setSettings(settingsData[0]);
      }
    } catch (e) {
      console.error("Erro ao carregar configurações:", e);
    }
  };

  const handleSearch = async (idToSearch) => {
    const finalId = idToSearch || orderId;
    if (!finalId) {
      setError("Por favor, insira um ID de pedido.");
      setSearched(false); // Nenhuma busca bem-sucedida ainda
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null); // Limpa o pedido anterior
    setSearched(false); // Define como falso no início da busca

    try {
      let foundOrder = null;

      // Tenta buscar por short_id primeiro
      let foundOrders = await Order.filter({ short_id: finalId });
      if (foundOrders.length > 0) {
        foundOrder = foundOrders[0];
      } else {
        // Se não encontrar por short_id, tenta buscar pelo ID completo
        try {
          foundOrder = await Order.get(finalId);
        } catch (e) {
          // Não faz nada, foundOrder continua null
        }
      }

      if (foundOrder) {
        setOrder(foundOrder);
        setSearched(true); // Uma busca bem-sucedida ocorreu

        // Atualiza o log de rastreamento (simplified for this example, usually this would come from a backend)
        const log = [
            { status: 'Pedido Criado', date: foundOrder.created_date, completed: true }
        ];
        // Simplified logic for log, can be expanded based on actual order history
        if (foundOrder.status !== 'pending_payment') {
            log.push({ status: 'Pagamento Confirmado', date: foundOrder.updated_date || foundOrder.created_date, completed: true });
        }
        if (['processing', 'drip_feed_active', 'completed', 'partial', 'cancelled'].includes(foundOrder.status)) { // Added drip_feed_active
            log.push({ status: 'Em Processamento', date: foundOrder.updated_date || foundOrder.created_date, completed: true });
        }
        if (foundOrder.status === 'drip_feed_active') {
            log.push({ status: 'Entrega Gradual em Andamento', date: foundOrder.updated_date || foundOrder.created_date, completed: true });
        }
        if (['completed', 'partial'].includes(foundOrder.status)) {
            log.push({ status: 'Concluído', date: foundOrder.updated_date || foundOrder.created_date, completed: true });
        }
        setTrackingLog(log);

      } else {
        setError("Pedido não encontrado. Verifique o ID e tente novamente.");
        setSearched(true); // Considera uma busca feita, mas sem resultado
      }
    } catch (e) {
      console.error("Erro na busca do pedido:", e);
      setError("Pedido não encontrado ou ocorreu um erro na busca.");
      setSearched(true); // Considera uma busca feita, mas com erro
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending_payment":
        return {
          text: "Aguardando Pagamento",
          icon: <CreditCard className="w-6 h-6 text-yellow-500" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          progress: 10,
          description: "Realize o pagamento para que possamos processar seu pedido.",
          nextStep: "Após o pagamento ser confirmado, iniciaremos o processamento."
        };
      case "processing":
        return {
          text: "Em Processamento",
          icon: <Package className="w-6 h-6 text-blue-500 animate-pulse" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200",
          progress: 60,
          description: "Seu pedido está sendo processado pelos nossos fornecedores.",
          nextStep: "A entrega será iniciada em breve. Tempo estimado: 24-72h."
        };
      case "drip_feed_active":
        return {
          text: "Entrega Gradual em Andamento",
          icon: <Clock className="w-6 h-6 text-blue-500 animate-pulse" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200",
          progress: 40,
          description: "Seu pedido está sendo entregue gradualmente conforme solicitado.",
          nextStep: "As entregas diárias continuarão até completar a quantidade total."
        };
      case "completed":
        return {
          text: "Concluído",
          icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
          progress: 100,
          description: "Pedido entregue com sucesso! Verifique seu perfil.",
          nextStep: "Obrigado pela confiança! Que tal fazer um novo pedido?"
        };
      case "cancelled":
      case "refunded":
        return {
          text: "Cancelado",
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          color: "text-red-600",
          bgColor: "bg-red-50 border-red-200",
          progress: 0,
          description: "Este pedido foi cancelado.",
          nextStep: "Entre em contato conosco se tiver dúvidas."
        };
      case "partial":
        return {
          text: "Parcialmente Concluído",
          icon: <Clock className="w-6 h-6 text-orange-500" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50 border-orange-200",
          progress: 80,
          description: "Parte do pedido foi entregue. Continuamos processando o restante.",
          nextStep: "A entrega será completada em breve."
        };
      default:
        return {
          text: "Status Desconhecido",
          icon: <Clock className="w-6 h-6 text-gray-500" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
          progress: 0,
          description: "Status não reconhecido.",
          nextStep: "Entre em contato com nosso suporte."
        };
    }
  };

  const getTimelineSteps = (currentStatus) => {
    const steps = [
      { key: 'pending_payment', label: 'Pedido Criado', icon: Package },
      { key: 'processing', label: 'Em Processamento', icon: Zap },
      { key: 'completed', label: 'Entregue', icon: CheckCircle2 }
    ];

    // Para drip-feed, ajustar timeline
    if (currentStatus === 'drip_feed_active') {
      // Find the processing step and update it
      const processingIndex = steps.findIndex(step => step.key === 'processing');
      if (processingIndex !== -1) {
        steps[processingIndex] = { key: 'drip_feed_active', label: 'Entrega Gradual', icon: Clock };
      }
    }

    const statusOrder = {
      'pending_payment': 0,
      'processing': 1,
      'drip_feed_active': 1, // Drip-feed is conceptually at the same stage as processing in the timeline
      'completed': 2,
      'cancelled': -1,
      'refunded': -1,
      'partial': 1.5
    };

    const currentStep = statusOrder[currentStatus] ?? 0;

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentStep,
      isActive: index === Math.floor(currentStep),
      isCancelled: currentStatus === 'cancelled' || currentStatus === 'refunded'
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", dateString, e);
      return dateString; // Fallback to original string if invalid date
    }
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = settings?.whatsapp_support_number;
    if (!whatsappNumber) {
      alert("Número de suporte não configurado. Por favor, entre em contato com o suporte de outra forma.");
      return;
    }
    const message = encodeURIComponent("Olá! Preciso de ajuda com meu pedido.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rastrear Pedido</h1>
          <p className="text-lg text-gray-600">Digite o ID do seu pedido para acompanhar o status da entrega</p>
        </div>

        {/* Search */}
        <Card className="shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="Digite o ID do pedido (ex: 12ab34cd)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(orderId)} // Pass orderId
                className="text-lg py-3"
              />
              <Button
                onClick={() => handleSearch(orderId)} // Pass orderId
                disabled={loading}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" /> // Usando Loader2
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription className="text-center text-lg">{error}</AlertDescription>
          </Alert>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* New Summary Card (as per outline's CardHeader content) */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Pedido #{order.short_id || order.id.slice(0,8)}</CardTitle>
                <CardDescription>
                  {order.quantity} {order.service_name}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Status Card */}
            <Card className={`shadow-2xl border-2 ${getStatusInfo(order.status).bgColor}`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {getStatusInfo(order.status).icon}
                </div>
                <CardTitle className={`text-2xl font-bold ${getStatusInfo(order.status).color}`}>
                  {getStatusInfo(order.status).text}
                </CardTitle>
                <div className="mt-4">
                  <Progress
                    value={getStatusInfo(order.status).progress}
                    className="h-3 bg-white/50"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {getStatusInfo(order.status).progress}% concluído
                  </p>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 mb-4 text-lg">
                  {getStatusInfo(order.status).description}
                </p>
                <div className="bg-white/70 p-4 rounded-lg border">
                  <p className="font-semibold text-gray-800">Próximo passo:</p>
                  <p className="text-gray-600">{getStatusInfo(order.status).nextStep}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Linha do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getTimelineSteps(order.status).map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          step.isCompleted
                            ? step.isCancelled
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                            : step.isActive
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          <StepIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            step.isCompleted || step.isCancelled ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </h4>
                          {step.isActive && (
                            <p className="text-sm text-blue-600 font-medium">Em andamento...</p>
                          )}
                        </div>
                        {/* Render connecting line if not the last step */}
                        {index < getTimelineSteps(order.status).length - 1 && (
                          <div className={`w-px h-8 ml-6 absolute left-6 transform -translate-x-1/2 translate-y-12 ${
                            step.isCompleted ? 'bg-green-300' : 'bg-gray-200'
                          }`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Detalhes do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID do Pedido:</span>
                    <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">
                      {order.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serviço:</span>
                    <span className="font-semibold text-right">
                      {order.service_name}
                      {order.is_express && (
                        <Badge className="ml-2 bg-yellow-400 text-yellow-900">
                          <Rocket className="w-3 h-3 mr-1" />
                          Express
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantidade:</span>
                    <span className="font-bold text-purple-600">
                      {order.quantity?.toLocaleString('pt-BR') ?? 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-bold text-green-600 text-lg">
                      R$ {order.total_price?.toFixed(2).replace('.', ',') ?? '0,00'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Informações Adicionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data do Pedido:</span>
                    <span className="font-medium text-right">
                      {formatDate(order.created_date)}
                    </span>
                  </div>
                  {order.target_url && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Perfil/Link:</span>
                      <a
                        href={order.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <MapPin className="w-4 h-4" />
                        Ver perfil
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {order.coupon_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cupom Usado:</span>
                      <Badge variant="secondary">{order.coupon_code}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Support */}
            <Card className="shadow-xl bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="text-center p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Precisa de ajuda com seu pedido?
                </h3>
                <p className="text-gray-600 mb-6">
                  Nossa equipe de suporte está pronta para te ajudar!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => window.location.href = createPageUrl('CustomerTickets')}
                  >
                    <LifeBuoy className="w-4 h-4" />
                    Abrir Ticket
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    onClick={handleWhatsAppClick}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.567-.01-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
                    </svg>
                    Falar no WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Message for no search yet or no results */}
        {!order && searched && !error && (
            <Alert className="mb-8">
                <AlertDescription className="text-center text-lg">
                    Nenhum pedido encontrado com o ID fornecido.
                </AlertDescription>
            </Alert>
        )}
        {!order && !searched && !error && (
            <Alert className="mb-8">
                <AlertDescription className="text-center text-lg">
                    Utilize a barra de pesquisa acima para rastrear seu pedido.
                </AlertDescription>
            </Alert>
        )}
      </div>
    </div>
  );
}
