import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Star, Zap, Rocket, Crown, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { createSubscription } from '@/api/functions';
import { Alert, AlertDescription } from '@/components/ui/alert';

const planIcons = { Star, Zap, Rocket, Crown };

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const checkUserAndFetchPlans = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        fetchPlans();
      }
    };
    checkUserAndFetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const activePlans = await SubscriptionPlan.filter({ is_active: true });
      setPlans(activePlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setAlert({ type: 'error', message: 'Erro ao carregar os planos.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setProcessingPlanId(planId);
    setAlert(null);

    if (!user) {
      // If user is not logged in, redirect to login and then back to this page
      const callbackUrl = window.location.href;
      User.loginWithRedirect(callbackUrl);
      return;
    }

    try {
      const { data } = await createSubscription({ planId, userEmail: user.email });
      if (data && data.success && data.init_point) {
        // Redirect user to Mercado Pago checkout
        window.location.href = data.init_point;
      } else {
        setAlert({ type: 'error', message: data?.details || 'Não foi possível iniciar a assinatura. Tente novamente.' });
      }
    } catch (error) {
      console.error('Subscription creation failed:', error);
      setAlert({ type: 'error', message: 'Ocorreu um erro. Por favor, tente mais tarde.' });
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Planos de Assinatura</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Automatize seu crescimento com entregas mensais. Escolha o plano perfeito e veja seu perfil decolar.
          </p>
        </div>
        
        {alert && <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-8 max-w-lg mx-auto"><AlertDescription>{alert.message}</AlertDescription></Alert>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
          {plans.map(plan => {
            const PlanIcon = planIcons[plan.icon] || Star;
            const isFeatured = plan.is_featured;
            const isProcessing = processingPlanId === plan.id;

            return (
              <Card 
                key={plan.id}
                className={`transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${isFeatured ? 'border-purple-500 border-2 bg-purple-50/50 scale-105 shadow-2xl' : 'bg-white'}`}
              >
                {isFeatured && (
                  <div className="bg-purple-600 text-white text-sm font-bold text-center py-1 rounded-t-lg">
                    MAIS POPULAR
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center rounded-full">
                    <PlanIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="px-4">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-5xl font-bold tracking-tighter text-gray-900">
                    R${plan.price.toFixed(2).split('.')[0]}<span className="text-2xl font-medium text-gray-600">,{plan.price.toFixed(2).split('.')[1]}/mês</span>
                  </p>
                </CardContent>
                <CardContent>
                  <ul className="space-y-4">
                    {plan.services_included.map(service => (
                      <li key={service.service_id} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">{service.quantity.toLocaleString('pt-BR')}</span> {service.service_name}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isProcessing}
                    className={`w-full text-lg py-6 ${isFeatured ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}