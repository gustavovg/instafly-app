
import React, { useState, useEffect } from "react";
import { Settings } from "@/api/entities";
import { Order } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings as SettingsIcon,
  RefreshCw,
  MessageSquare,
  Clock,
  Send,
  Play,
  Bug,
  Target,
  Bell, // NEW import for marketing test card
  TestTube // NEW import for marketing test card
} from "lucide-react";
import { autoSyncOrders } from "@/api/functions";
import { intelligentNotifications } from "@/api/functions";
import { sendWhatsApp } from "@/api/functions";
import { simulateFullFlow } from "@/api/functions";

export default function AdminDiagnostics() {
  const [results, setResults] = useState({});
  const [runningTest, setRunningTest] = useState(null);
  const [fullFlowResult, setFullFlowResult] = useState(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState(''); // Updated state variable name and usage
  const [loading, setLoading] = useState({ whatsapp: false, marketing: false }); // NEW: loading states for specific buttons
  const [alerts, setAlerts] = useState([]); // NEW: for displaying multiple success/error messages

  const runTest = async (testName, testFunction) => {
    setRunningTest(testName);
    setResults(prev => ({ ...prev, [testName]: { status: 'running' } }));
    try {
      const response = await testFunction();
      let data = response;

      // Handle functions that might return different response structures
      if (response && typeof response.json === 'function') {
         data = await response.json();
      } else if (response && response.data) {
         data = response.data;
      }

      setResults(prev => ({ ...prev, [testName]: { status: 'success', data } }));
    } catch (error) {
      console.error(`Error running test ${testName}:`, error);
      setResults(prev => ({ ...prev, [testName]: { status: 'error', data: error.message } }));
    } finally {
      setRunningTest(null);
    }
  };

  const runFullFlowSimulation = async () => {
    setRunningTest('fullFlow');
    setFullFlowResult({ status: 'running', steps: [] });

    try {
      const response = await simulateFullFlow({ testPhoneNumber: '31985255551' });
      let data = response;

      if (response && typeof response.json === 'function') {
         data = await response.json();
      } else if (response && response.data) {
         data = response.data;
      }

      setFullFlowResult({ status: 'success', data });
    } catch (error) {
      console.error('Error in full flow simulation:', error);
      setFullFlowResult({
        status: 'error',
        data: { error: error.message, steps: [] }
      });
    } finally {
      setRunningTest(null);
    }
  };

  // Teste de conectividade da Evolution API (no changes from original file)
  const testEvolutionConnection = async () => {
    const { data, error } = await supabase.functions.invoke('test-evolution-connection', {
      body: {}
    });
    
    if (error) {
      throw new Error(`Evolution API Error: ${error.message}`);
    }
    
    // Simulate response format for compatibility
    const response = {
      ok: !error,
      status: error ? 500 : 200,
      json: async () => data
    };

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If not JSON, just use status text
      }
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  };

  // MODIFIED FUNCTION: Teste das notificações de marketing to accept testPhoneNumber
  const testMarketingNotifications = async ({ testPhoneNumber }) => {
    try {
      // Buscar configurações primeiro
      const settingsList = await Settings.list();
      if (settingsList.length === 0) {
        throw new Error("Configurações não encontradas");
      }
      const config = settingsList[0];

      // Verificar se as notificações estão habilitadas
      if (!config.intelligent_notifications_enabled) {
        throw new Error("Notificações inteligentes estão desabilitadas nas configurações.");
      }

      // Função auxiliar para enviar mensagem
      const sendTestMessage = async (messageType, message) => {
        try {
          const response = await sendWhatsApp({
            phoneNumber: testPhoneNumber, // Uses the passed testPhoneNumber
            message: `📱 *TESTE ${messageType.toUpperCase()}*\n\n${message}`
          });

          if (response.data && response.data.success) {
            return {
              type: messageType,
              status: 'success',
              message: 'Mensagem enviada com sucesso'
            };
          } else {
            return {
              type: messageType,
              status: 'error',
              message: response.data?.error || 'Erro desconhecido'
            };
          }
        } catch (error) {
          return {
            type: messageType,
            status: 'error',
            message: error.message || 'Erro ao enviar mensagem'
          };
        }
      };

      const results = [];
      let sentCount = 0;

      // 1. Teste: Carrinho Abandonado
      if (config.abandoned_cart_enabled !== false) {
        const couponText = config.abandoned_cart_coupon_code
          ? `\n\n🎁 Use o cupom *${config.abandoned_cart_coupon_code}* e ganhe desconto especial!`
          : '';

        const abandonedCartMessage = `🛒 *Ops! Esqueceu de finalizar sua compra?*

Olá! Vimos que você iniciou um pedido mas não finalizou o pagamento.

📋 *Seu Pedido:* #ABC123
💰 *Valor:* R$ 59,99
⏰ *Ainda dá tempo de garantir!*${couponText}

Precisa de ajuda? É só chamar! 😊`;

        const result = await sendTestMessage('Carrinho Abandonado', abandonedCartMessage);
        results.push(result);
        if (result.status === 'success') sentCount++;
      }

      // 2. Teste: Reativação de Cliente
      if (config.reactivation_enabled !== false) {
        const couponText = config.reactivation_coupon_code
          ? `\n\n🎁 *Oferta Especial:* Use o cupom *${config.reactivation_coupon_code}* e volte com desconto!`
          : '';

        const reactivationMessage = `💜 *Sentimos sua falta!*

Olá! Já faz um tempo que você não impulsiona suas redes conosco.

🚀 *Que tal voltar com tudo?*
✨ Temos novos serviços e promoções especiais
📈 Seus concorrentes não param de crescer${couponText}

Vamos retomar seu crescimento? 🔥`;

        const result = await sendTestMessage('Reativação de Cliente', reactivationMessage);
        results.push(result);
        if (result.status === 'success') sentCount++;
      }

      // 3. Teste: Promoção VIP
      if (config.vip_promo_enabled !== false) {
        const couponText = config.vip_promo_coupon_code
          ? `\n\n🎁 *Cupom Exclusivo:* *${config.vip_promo_coupon_code}*\n💎 Válido apenas para clientes VIP como você!`
          : '';

        const vipPromoMessage = `👑 *Oferta Exclusiva VIP*

Olá! Você é um dos nossos clientes mais especiais!

🌟 *Seu Perfil VIP:*
• 5 pedidos realizados
• R$ 299,99 investidos no crescimento

🎯 *Oferta Especial desta Semana:*
Serviços premium com condições exclusivas${couponText}

Aproveite enquanto é VIP! 💜`;

        const result = await sendTestMessage('Promoção VIP', vipPromoMessage);
        results.push(result);
        if (result.status === 'success') sentCount++;
      }

      // 4. Teste: Upsell Pós-Compra
      if (config.upsell_enabled !== false) {
        const couponText = config.upsell_coupon_code
          ? `\n\n🎁 Use o cupom *${config.upsell_coupon_code}* e ganhe desconto na próxima compra!`
          : '';

        const upsellMessage = `🎉 *Seu pedido foi entregue com sucesso!*

Parabéns! Seus seguidores já estão ativos.

📈 *Que tal turbinar ainda mais?*
• Mais seguidores = maior credibilidade
• Mais curtidas = maior alcance
• Mais visualizações = mais oportunidades${couponText}

Continue crescendo! 🚀`;

        const result = await sendTestMessage('Upsell Pós-Compra', upsellMessage);
        results.push(result);
        if (result.status === 'success') sentCount++;
      }

      // 5. Teste: Reconquista de Cliente Perdido
      if (config.winback_enabled !== false) {
        const couponText = config.winback_coupon_code
          ? `\n\n🔥 *CUPOM ESPECIAL:* *${config.winback_coupon_code}*\n💥 Desconto imperdível para seu retorno!`
          : '';

        const winbackMessage = `💔 *Você faz falta por aqui!*

Olá! Notamos que você não faz pedidos há um tempo...

🤔 *O que aconteceu?*
• Mudou de estratégia?
• Não gostou do resultado?
• Esqueceu de nós?

🎯 *Queremos você de volta!*
Novos serviços, melhor qualidade, preços especiais${couponText}

Uma nova chance? 🙏`;

        const result = await sendTestMessage('Reconquista (Winback)', winbackMessage);
        results.push(result);
        if (result.status === 'success') sentCount++;
      }

      // 6. Teste: Promoção de Aniversário
      if (config.birthday_promo_enabled) {
        const couponText = config.birthday_promo_coupon_code
          ? `\n\n🎁 *Presente de Aniversário:* *${config.birthday_promo_coupon_code}*\n🎂 Desconto especial só para você!`
          : '';

        const birthdayMessage = `🎂 *PARABÉNS! É SEU ANIVERSÁRIO!*

Hoje é um dia especial e queremos celebrar com você!

🎉 *Comemore impulsionando suas redes!*
• Mais seguidores
• Mais curtidas
• Mais sucesso${couponText}

Feliz Aniversário! 🥳`;

        const result = await sendTestMessage('Aniversário', birthdayMessage);
        results.push(result);
        if (result.status === 'success') sentCount++;
      }

      return {
        success: true,
        results: results,
        total_sent: sentCount,
        total_errors: results.filter(r => r.status === 'error').length
      };

    } catch (error) {
      console.error('Erro no teste de marketing:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  };

  // NEW FUNCTION: handleWhatsAppTest as per outline
  const handleWhatsAppTest = async () => {
    if (!testPhoneNumber.trim()) {
      setAlerts(prev => [...prev, { type: 'error', message: 'Por favor, insira um número de telefone para teste.' }]);
      return;
    }

    setLoading(prev => ({ ...prev, whatsapp: true }));
    setAlerts([]); // Clear previous alerts related to this action

    try {
      const settingsList = await Settings.list();
      if (settingsList.length === 0) {
        throw new Error("Configurações não encontradas.");
      }

      const config = settingsList[0];
      if (!config.whatsapp_support_number) {
        throw new Error("Número de WhatsApp de suporte não configurado nas configurações gerais.");
      }

      // Verificar se as configurações da Evolution API estão presentes
      if (!config.evolution_api_url || !config.evolution_api_key || !config.evolution_instance_name) {
        throw new Error("Configurações da Evolution API incompletas. Verifique URL, API Key e Nome da Instância nas configurações.");
      }

      const timestamp = new Date().toLocaleTimeString('pt-BR');
      const response = await sendWhatsApp({
        phoneNumber: testPhoneNumber,
        message: `[${timestamp}] 🔧 Teste de diagnóstico do painel.`
      });

      const data = response.data;
      const status = response.status;
      const error = response.error;

      if (status === 200 && data && data.success) {
        setAlerts(prev => [...prev, {
          type: 'success',
          message: '✅ Mensagem WhatsApp enviada com sucesso!'
        }]);
      } else {
        setAlerts(prev => [...prev, {
          type: 'error',
          message: `❌ Erro: ${data?.error || error || 'Falha no envio.'}`
        }]);
      }
    } catch (err) {
      console.error("Error running test whatsapp:", err);
      setAlerts(prev => [...prev, {
        type: 'error',
        message: `❌ Erro: ${err.message || 'Falha na conexão ou configuração.'}`
      }]);
    } finally {
      setLoading(prev => ({ ...prev, whatsapp: false }));
    }
  };

  // NEW FUNCTION: handleMarketingTest as per outline
  const handleMarketingTest = async () => {
    if (!testPhoneNumber.trim()) {
      setAlerts(prev => [...prev, { type: 'error', message: 'Por favor, insira um número de telefone para teste.' }]);
      return;
    }

    setLoading(prev => ({ ...prev, marketing: true }));
    setAlerts([]); // Clear previous alerts related to this action

    try {
      const { success, results, total_sent, total_errors, error } = await testMarketingNotifications({
        testPhoneNumber: testPhoneNumber
      });

      if (success) {
        setAlerts(prev => [...prev, {
          type: 'success',
          message: `Teste de marketing executado com sucesso! ${total_sent} mensagens enviadas, ${total_errors} erros.`
        }]);
        results.forEach(res => {
          setAlerts(prev => [...prev, {
            type: res.status,
            message: `${res.type}: ${res.message}`
          }]);
        });
      } else {
        setAlerts(prev => [...prev, {
          type: 'error',
          message: `Erro no teste de marketing: ${error || 'Erro desconhecido.'}`
        }]);
      }
    } catch (err) {
      setAlerts(prev => [...prev, {
        type: 'error',
        message: `Erro ao testar marketing: ${err.message}`
      }]);
    } finally {
      setLoading(prev => ({ ...prev, marketing: false }));
    }
  };

  const getStatusComponent = (status) => {
    if (status === 'running') return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Send className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Diagnóstico do Sistema</h1>
        <p className="text-gray-600">Execute diagnósticos detalhados para identificar exatamente onde está o problema.</p>
      </div>

      {/* Display alerts based on the new 'alerts' state */}
      <div className="space-y-3 mb-6">
        {alerts.map((alertItem, index) => (
          <Alert key={index} variant={alertItem.type === 'success' ? 'default' : 'destructive'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{alertItem.type === 'success' ? 'Sucesso!' : 'Erro!'}</AlertTitle>
            <AlertDescription>{alertItem.message}</AlertDescription>
          </Alert>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Teste de WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Teste de WhatsApp
            </CardTitle>
            <CardDescription>
              Envia uma mensagem de teste para verificar se a integração está funcionando.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-phone">Número para Teste</Label>
              <Input
                id="test-phone"
                type="tel"
                placeholder="5511999999999"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: código do país + DDD + número (ex: 5511999999999)
              </p>
            </div>
            <Button
              onClick={handleWhatsAppTest}
              disabled={loading.whatsapp || !testPhoneNumber.trim()}
              className="w-full"
            >
              {loading.whatsapp ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Teste
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Teste de Marketing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Teste de Notificações de Marketing
            </CardTitle>
            <CardDescription>
              Testa o sistema de notificações inteligentes de marketing enviando mensagens de exemplo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="marketing-test-phone">Número para Teste</Label>
              <Input
                id="marketing-test-phone"
                type="tel"
                placeholder="5511999999999"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Todas as mensagens de remarketing serão enviadas para este número.
              </p>
            </div>
            <Button
              onClick={handleMarketingTest}
              disabled={loading.marketing || !testPhoneNumber.trim()}
              className="w-full"
              variant="outline"
            >
              {loading.marketing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Marketing
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div> {/* End of grid md:grid-cols-2 */}

      {/* Teste de Conectividade Evolution API */}
      <Card className="mb-6 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Teste de Conectividade Evolution API
          </CardTitle>
          <CardDescription>
            Testa a conectividade completa com a Evolution API: URL base, instância e envio de mensagem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => runTest('evolutionConnection', testEvolutionConnection)}
            disabled={runningTest}
            className="bg-green-600 hover:bg-green-700 mb-4"
          >
            {runningTest === 'evolutionConnection' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando Conectividade...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Testar Conectividade Evolution API
              </>
            )}
          </Button>

          {results.evolutionConnection && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                {getStatusComponent(results.evolutionConnection.status)}
                <span className="font-semibold">
                  Status: {results.evolutionConnection.status === 'running' ? 'Executando...' :
                          results.evolutionConnection.status === 'success' ? 'Concluído' : 'Erro'}
                </span>
              </div>

              {results.evolutionConnection.data && (
                <div className="space-y-4">
                  {/* Verificação de Configurações */}
                  <div>
                    <h4 className="font-semibold mb-2">Verificação de Configurações:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg ${results.evolutionConnection.data.config_check?.url_exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                        <div className="flex items-center gap-2">
                          {results.evolutionConnection.data.config_check?.url_exists ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">URL da API</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {results.evolutionConnection.data.config_check?.url_value || 'Não configurado'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${results.evolutionConnection.data.config_check?.instance_exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                        <div className="flex items-center gap-2">
                          {results.evolutionConnection.data.config_check?.instance_exists ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">Nome da Instância</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {results.evolutionConnection.data.config_check?.instance_value || 'Não configurado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resultados dos Testes */}
                  {results.evolutionConnection.data.tests && (
                    <div>
                      <h4 className="font-semibold mb-2">Resultados dos Testes:</h4>
                      <div className="space-y-2">
                        {results.evolutionConnection.data.tests.map((test, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            test.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              {test.success ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium">{test.test}</span>
                              <Badge variant={test.success ? "default" : "destructive"}>
                                {test.status || 'N/A'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{test.message}</p>
                            {test.error && (
                              <p className="text-xs text-red-600 mt-1">Erro: {test.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resumo */}
                  {results.evolutionConnection.data.summary && (
                    <Alert className={results.evolutionConnection.data.summary.overall_status === 'SUCESSO' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Resumo</AlertTitle>
                      <AlertDescription>
                        <strong>Status:</strong> {results.evolutionConnection.data.summary.overall_status}<br />
                        <strong>Testes:</strong> {results.evolutionConnection.data.summary.successful_tests}/{results.evolutionConnection.data.summary.total_tests} bem-sucedidos<br />
                        <strong>Recomendação:</strong> {results.evolutionConnection.data.summary.recommendation}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulação Completa do Fluxo */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-600" />
            Simulação Completa do Fluxo
          </CardTitle>
          <CardDescription>
            Simula um pedido completo do início ao fim após verificar a conectividade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runFullFlowSimulation}
            disabled={runningTest}
            className="bg-red-600 hover:bg-red-700 mb-4"
          >
            {runningTest === 'fullFlow' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executando Simulação...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Executar Simulação Completa
              </>
            )}
          </Button>

          {fullFlowResult && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                {getStatusComponent(fullFlowResult.status)}
                <span className="font-semibold">
                  Status: {fullFlowResult.status === 'running' ? 'Executando...' :
                          fullFlowResult.status === 'success' ? 'Concluído' : 'Erro'}
                </span>
              </div>

              {fullFlowResult.data && (
                <div className="space-y-4">
                  {/* Passos da Simulação */}
                  {fullFlowResult.data.steps && fullFlowResult.data.steps.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Passos Executados:</h4>
                      <div className="space-y-2">
                        {fullFlowResult.data.steps.map((step, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            step.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              {step.success ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium">{step.step}</span>
                              <span className="text-xs text-gray-500">{step.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700">{step.message}</p>
                            {step.data && (
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                                {JSON.stringify(step.data, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resultado Final */}
                  <div>
                    <h4 className="font-semibold mb-2">Resultado Final:</h4>
                    <Textarea
                      value={JSON.stringify(fullFlowResult.data, null, 2)}
                      readOnly
                      className="h-40 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testes Individuais */}
      <Card>
        <CardHeader>
          <CardTitle>Testes Individuais de Componentes</CardTitle>
          <CardDescription>
            Execute funções específicas para isolar problemas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teste</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Ação</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Sincronização de Pedidos */}
              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600"/> Sincronização de Pedidos
                </TableCell>
                <TableCell className="text-sm text-gray-600">Verifica e atualiza o status de todos os pedidos "em processamento".</TableCell>
                <TableCell className="text-center">
                  <Button size="sm" onClick={() => runTest('sync', autoSyncOrders)} disabled={runningTest}>
                    {runningTest === 'sync' ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Executar'}
                  </Button>
                </TableCell>
                <TableCell className="text-center">{getStatusComponent(results.sync?.status)}</TableCell>
                <TableCell className="text-xs font-mono bg-gray-100 rounded p-2 max-w-xs">
                  {results.sync ? (
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(results.sync.data, null, 2)}
                    </pre>
                  ) : 'Aguardando execução...'}
                </TableCell>
              </TableRow>

              {/* Notificações Inteligentes */}
              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600"/> Notificações Inteligentes
                </TableCell>
                <TableCell className="text-sm text-gray-600">Verifica e envia campanhas de marketing (carrinho abandonado, reativação, etc).</TableCell>
                <TableCell className="text-center">
                  <Button size="sm" onClick={() => runTest('marketing', intelligentNotifications)} disabled={runningTest}>
                    {runningTest === 'marketing' ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Executar'}
                  </Button>
                </TableCell>
                <TableCell className="text-center">{getStatusComponent(results.marketing?.status)}</TableCell>
                <TableCell className="text-xs font-mono bg-gray-100 rounded p-2 max-w-xs">
                  {results.marketing ? (
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(results.marketing.data, null, 2)}
                    </pre>
                  ) : 'Aguardando execução...'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert variant="default" className="mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Como interpretar os resultados</AlertTitle>
        <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Simulação Completa:</strong> Mostra cada passo do processo e onde exatamente falha.</li>
                <li><strong>Teste de WhatsApp:</strong> Se falhar aqui, o problema está na configuração da Evolution API.</li>
                <li><strong>Sincronização:</strong> Se funcionar aqui mas não automaticamente, o problema é no agendador.</li>
                <li><strong>Resultado em JSON:</strong> Contém detalhes técnicos para diagnóstico avançado.</li>
            </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
