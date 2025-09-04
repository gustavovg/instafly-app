
import React, { useState, useEffect } from "react";
import { Affiliate } from "@/api/entities";
import { AffiliateEarning } from "@/api/entities";
import { useAffiliateAuth } from "@/contexts/AffiliateAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  DollarSign, 
  Share2, 
  Copy, 
  CheckCircle, 
  Gift,
  TrendingUp,
  Calendar,
  Link as LinkIcon,
  Sparkles,
  Save,
  LogOut
} from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from "@/utils";

export default function Affiliates() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAffiliateAuth();
  const [affiliate, setAffiliate] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalReferrals: 0,
    totalSales: 0,
    pendingEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [alert, setAlert] = useState(null);
  const [pixKey, setPixKey] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        loadAffiliateData(user.email);
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, user, authLoading]);

  const loadAffiliateData = async (userEmail) => {
    if (!userEmail) return;

    try {
      setLoading(true);
      
      // Simular busca de afiliado no localStorage
      const affiliatesData = JSON.parse(localStorage.getItem('affiliates') || '[]');
      const affiliateData = affiliatesData.find(a => a.user_email === userEmail);
      
      if (affiliateData) {
        setAffiliate(affiliateData);
        setPixKey(affiliateData.pix_key || "");
        setWhatsappNumber(affiliateData.whatsapp_number || "");

        // Simular carregamento de earnings
        const earningsData = JSON.parse(localStorage.getItem('affiliate_earnings') || '[]');
        let userEarnings = earningsData.filter(e => e.affiliate_id === affiliateData.id);
        
        // Se não há earnings, criar alguns dados de exemplo para demonstração
        if (userEarnings.length === 0 && affiliateData.id) {
          const mockEarnings = [
            {
              id: '1',
              affiliate_id: affiliateData.id,
              order_id: 'ORD123456789',
              commission_amount: 15.50,
              status: 'paid',
              created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              affiliate_id: affiliateData.id,
              order_id: 'ORD987654321',
              commission_amount: 8.75,
              status: 'pending',
              created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              affiliate_id: affiliateData.id,
              order_id: 'ORD456789123',
              commission_amount: 22.30,
              status: 'paid',
              created_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          
          // Salvar earnings de exemplo
          const allEarnings = [...earningsData, ...mockEarnings];
          localStorage.setItem('affiliate_earnings', JSON.stringify(allEarnings));
          userEarnings = mockEarnings;
        }
        
        setEarnings(userEarnings);

        // Calcular estatísticas
        const totalEarnings = userEarnings.reduce((sum, earning) => sum + (earning.commission_amount || 0), 0);
        const pendingEarnings = userEarnings
          .filter(e => e.status === 'pending')
          .reduce((sum, earning) => sum + (earning.commission_amount || 0), 0);

        setStats({
          totalEarnings,
          totalReferrals: affiliateData.total_referrals || 0,
          totalSales: affiliateData.total_sales || 0,
          pendingEarnings
        });
      }
    } catch (error) {
      console.error("Error loading affiliate data:", error);
      setAlert({ type: "error", message: "Erro ao carregar dados do afiliado." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Redirecionar para página de login de afiliados
    window.location.href = createPageUrl("AffiliateLogin");
  };

  const handleApplyAffiliate = async () => {
    if (!user) {
      setAlert({ type: "error", message: "Você precisa estar logado para se tornar afiliado." });
      return;
    }

    if (!pixKey.trim()) {
      setAlert({ type: "error", message: "Por favor, informe sua chave PIX." });
      return;
    }

    if (!whatsappNumber.trim()) {
      setAlert({ type: "error", message: "Por favor, informe seu WhatsApp." });
      return;
    }

    setApplying(true);
    setAlert(null);

    try {
      // Gerar código único de afiliado
      const affiliateCode = `AF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

      const newAffiliate = {
        id: Date.now().toString(),
        user_email: user.email,
        affiliate_code: affiliateCode,
        whatsapp_number: whatsappNumber,
        commission_percentage: 10,
        pix_key: pixKey,
        is_active: true,
        approved_date: new Date().toISOString(),
        total_referrals: 0,
        total_sales: 0,
        created_at: new Date().toISOString()
      };

      // Salvar no localStorage
      const affiliatesData = JSON.parse(localStorage.getItem('affiliates') || '[]');
      affiliatesData.push(newAffiliate);
      localStorage.setItem('affiliates', JSON.stringify(affiliatesData));

      setAffiliate(newAffiliate);
      setAlert({ 
        type: "success", 
        message: "Parabéns! Você foi aprovado como afiliado. Comece a compartilhar seu link!" 
      });
    } catch (error) {
      console.error("Error applying for affiliate:", error);
      setAlert({ type: "error", message: "Erro ao processar solicitação de afiliado." });
    } finally {
      setApplying(false);
    }
  };

  const updateAffiliateInfo = async () => {
    if (!affiliate) return;

    if (!pixKey.trim() && !whatsappNumber.trim()) {
      setAlert({ type: "error", message: "A chave PIX ou o WhatsApp devem ser informados." });
      return;
    }

    try {
      // Atualizar no localStorage
      const affiliatesData = JSON.parse(localStorage.getItem('affiliates') || '[]');
      const updatedAffiliates = affiliatesData.map(a => 
        a.id === affiliate.id 
          ? { ...a, pix_key: pixKey, whatsapp_number: whatsappNumber }
          : a
      );
      localStorage.setItem('affiliates', JSON.stringify(updatedAffiliates));
      
      // Atualizar estado local
      setAffiliate(prev => ({ ...prev, pix_key: pixKey, whatsapp_number: whatsappNumber }));
      setAlert({ type: "success", message: "Informações atualizadas com sucesso!" });
    } catch (error) {
      console.error("Error updating affiliate info:", error);
      setAlert({ type: "error", message: "Erro ao atualizar informações." });
    }
  };

  const copyAffiliateLink = () => {
    if (!affiliate) return;
    
    const currentUrl = window.location.origin;
    const affiliateLink = `${currentUrl}?ref=${affiliate.affiliate_code}`;
    
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Programa de Afiliados</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Ganhe Dinheiro Compartilhando
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Receba <span className="font-bold text-purple-600">10% de comissão</span> em cada venda 
              que você indicar. É fácil, rápido e lucrativo!
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Share2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">1. Compartilhe</h3>
              <p className="text-gray-600">Compartilhe seu link único com amigos e redes sociais</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">2. Ganhe</h3>
              <p className="text-gray-600">Receba 10% de comissão em cada venda realizada</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">3. Receba</h3>
              <p className="text-gray-600">Receba seus ganhos via PIX de forma rápida e segura</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                Comece Agora
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Faça login para acessar sua conta de afiliado ou se cadastrar no programa.
              </p>
              
              {alert && (
                <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              )}
              
              <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Fazer Login
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                Sistema seguro de login próprio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Programa de Afiliados</span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Bem-vindo, {user.full_name || user.email}!
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {affiliate ? 
              "Gerencie suas comissões e acompanhe seus ganhos" :
              "Complete seu cadastro para começar a ganhar 10% de comissão"
            }
          </p>
        </div>

        {alert && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {!affiliate ? (
          /* Formulário de Aplicação */
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Gift className="w-6 h-6 text-purple-600" />
                Torne-se um Afiliado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Share2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-bold">1. Compartilhe</h3>
                      <p className="text-sm text-gray-600">Seu link único</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-bold">2. Ganhe</h3>
                      <p className="text-sm text-gray-600">10% por venda</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-bold">3. Receba</h3>
                      <p className="text-sm text-gray-600">Via PIX</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">Seu WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="31999999999"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Será usado para notificar você sobre novas comissões
                  </p>
                </div>

                <div>
                  <Label htmlFor="pix">Sua Chave PIX *</Label>
                  <Input
                    id="pix"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, CNPJ, email ou chave aleatória"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Será usada para pagamento das suas comissões
                  </p>
                </div>

                <Button 
                  onClick={handleApplyAffiliate}
                  disabled={applying}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {applying ? "Processando..." : "Tornar-se Afiliado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Dashboard do Afiliado */
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    R$ {stats.totalEarnings.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total Ganho</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalReferrals}
                  </p>
                  <p className="text-sm text-gray-600">Indicações</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {stats.totalSales.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Vendas Geradas</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    R$ {stats.pendingEarnings.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Pendente</p>
                </CardContent>
              </Card>
            </div>

            {/* Link de Afiliado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Seu Link de Afiliado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}?ref=${affiliate.affiliate_code}`}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button onClick={copyAffiliateLink} variant="outline">
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Código: {affiliate.affiliate_code}</p>
                    <p className="text-xs text-gray-500">Comissão: {affiliate.commission_percentage}%</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Ativo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Configurações */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Suas Informações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                        <Label htmlFor="pix-key-edit">Chave PIX</Label>
                        <Input
                          id="pix-key-edit"
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          placeholder="Sua chave PIX para pagamentos"
                        />
                    </div>
                    <div>
                        <Label htmlFor="whatsapp-edit">WhatsApp</Label>
                        <Input
                          id="whatsapp-edit"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="Seu WhatsApp para notificações"
                        />
                    </div>
                    <Button onClick={updateAffiliateInfo} className="w-full">
                      <Save className="w-4 h-4 mr-2"/>
                      Salvar Informações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Como Funciona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Compartilhe seu link único</p>
                  <p>• Ganhe 10% de cada venda</p>
                  <p>• Receba via PIX quando solicitar</p>
                  <p>• Sem limite de ganhos</p>
                </CardContent>
              </Card>
            </div>

            {/* Histórico de Ganhos */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Comissões</CardTitle>
              </CardHeader>
              <CardContent>
                {earnings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma comissão gerada ainda. Comece a compartilhar seu link!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {earnings.map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            R$ {earning.commission_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Pedido: {earning.order_id.slice(0, 8)} • 
                            {format(new Date(earning.created_date), 'dd/MM/yy', { locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(earning.status)}>
                          {getStatusText(earning.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
