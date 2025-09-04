
import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Settings } from "@/api/entities";
import { Order } from "@/api/entities";
import { Service } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Zap,
  ShieldCheck,
  Rocket,
  CheckCircle,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Music,
  ThumbsUp,
  Heart,
  Eye,
  Users,
  Star,
  Lock,
  Clock,
  MessageSquare,
  ShoppingCart,
  Filter,
  Sparkles,
  Loader2,
  Copy,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendEmail } from "@/api/integrations";
import { debounce } from "lodash";
import { createPayment } from "@/api/functions";
import { validateCoupon as validateCouponApi } from "@/api/functions";
import { Switch } from "@/components/ui/switch";
import { checkOrderStatus } from "@/api/functions";
import { getInstagramProfile } from "@/api/functions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DripFeedOrder } from '@/api/entities';
import { Badge } from "@/components/ui/badge";


const SocialProofNotifications = lazy(() => import("../components/SocialProofNotifications"));

const serviceIcons = {
  likes: Heart,
  followers: Users,
  views: Eye,
  default: ThumbsUp
};

const platformIcons = {
  Instagram: Instagram,
  Facebook: Facebook,
  YouTube: Youtube,
  Twitter: Twitter,
  TikTok: Music,
  LinkedIn: Linkedin,
  Kwai: Music,
};

const platformColors = {
  Instagram: {
    bg: "from-purple-500 to-pink-500",
    text: "text-pink-600",
    bgLight: "bg-gradient-to-r from-purple-100 to-pink-100"
  },
  Facebook: {
    bg: "from-blue-500 to-blue-700",
    text: "text-blue-600",
    bgLight: "bg-gradient-to-r from-blue-100 to-blue-200"
  },
  YouTube: {
    bg: "from-red-500 to-red-700",
    text: "text-red-600",
    bgLight: "bg-gradient-to-r from-red-100 to-red-200"
  },
  Twitter: {
    bg: "from-sky-400 to-blue-500",
    text: "text-sky-600",
    bgLight: "bg-gradient-to-r from-sky-100 to-blue-100"
  },
  TikTok: {
    bg: "from-black to-gray-800",
    text: "text-gray-800",
    bgLight: "bg-gradient-to-r from-gray-100 to-gray-200"
  },
  LinkedIn: {
    bg: "from-blue-600 to-blue-800",
    text: "text-blue-700",
    bgLight: "bg-gradient-to-r from-blue-100 to-blue-200"
  },
  Kwai: {
    bg: "from-orange-500 to-red-500",
    text: "text-orange-600",
    bgLight: "bg-gradient-to-r from-orange-100 to-red-100"
  },
  default: {
    bg: "from-gray-500 to-gray-700",
    text: "text-gray-600",
    bgLight: "bg-gradient-to-r from-gray-100 to-gray-200"
  }
};

const featureIconsList = {
  Star,
  Lock,
  ThumbsUp,
  Shield: ShieldCheck,
  Clock,
  MessageSquare,
  CheckCircle,
  Zap
};

const MOCKED_SERVICES = [
  {
    service: "1",
    quantity_text: "1000",
    default_quantity: 1000,
    min_quantity: 100,
    max_quantity: 10000,
    name: "Seguidores Brasileiros",
    platform: "Instagram",
    service_type: "followers",
    price: "59.99",
    price_per_thousand: 59.99,
    min: "100",
    max: "10000",
    is_brazilian: true,
    is_popular: true, 
    delivery_time: "1-2 horas", 
    badge_type: 'brazilian', 
    show_in_homepage: true,
    features: [
      { icon: "Star", text: "Alta qualidade" },
      { icon: "Lock", text: "Não precisa da senha" },
      { icon: "ThumbsUp", text: "Garantia contra quedas" },
      { icon: "Shield", text: "Seguro e Fácil" },
      { icon: "Clock", text: "Entrega Rápida" },
      { icon: "MessageSquare", text: "Suporte 24 horas" },
      { icon: "CheckCircle", text: "Pagamentos Seguros" },
    ]
  }
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [step, setStep] = useState(0);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [orderData, setOrderData] = useState({ 
    url: "", 
    quantity: "", 
    email: "", 
    whatsapp: "", 
    coupon: "", 
    is_drip_feed: false, 
    drip_daily_quantity: '' 
  });
  const [isExpress, setIsExpress] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [profileInfo, setProfileInfo] = useState({ 
    pic: null, 
    username: null, 
    followers: null, 
    loading: false, 
    error: null 
  });
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [calculatorService, setCalculatorService] = useState(null);
  const [calculatorQuantity, setCalculatorQuantity] = useState(1000);
  const [showServiceComparison, setShowServiceComparison] = useState(false);
  const [favoriteServices, setFavoriteServices] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  // Removed user and vipDiscount states
  // Removed userWallet state
  const [paymentMethod, setPaymentMethod] = useState('pix');

  // Adicionar estado para as quantidades da comparação
  const [serviceQuantities, setServiceQuantities] = useState({});

  const isValidUrl = (string) => {
    if (!string) return false;
    try {
      new URL(string);
      return string.startsWith('http://') || string.startsWith('https://');
    } catch (_) {
      return false;
    }
  };

  const fetchProfile = async (inputUrl) => {
    if (!inputUrl || !selectedService) {
      setProfileInfo({ pic: null, username: null, followers: null, loading: false, error: null });
      return;
    }

    if (selectedService.platform !== 'Instagram' || selectedService.service_type !== 'followers') {
      setProfileInfo({ pic: null, username: null, followers: null, loading: false, error: null });
      return;
    }

    setProfileInfo({ pic: null, username: null, followers: null, loading: true, error: null });

    let usernameToFetch = inputUrl.trim();

    try {
      if (usernameToFetch.includes('instagram.com/')) {
        const urlObj = new URL(usernameToFetch);
        const path = urlObj.pathname;
        const parts = path.split('/').filter(part => part);
        if (parts.length > 0) {
          usernameToFetch = parts[0];
        } else {
          throw new Error("Invalid Instagram URL path.");
        }
      }
      
      if (usernameToFetch.startsWith('@')) {
        usernameToFetch = usernameToFetch.substring(1);
      }

      usernameToFetch = usernameToFetch.split('?')[0];
      usernameToFetch = usernameToFetch.split('/')[0];

    } catch (e) {
      if (usernameToFetch.startsWith('@')) {
        usernameToFetch = usernameToFetch.substring(1);
      }
      if (!/^[a-zA-Z0-9._]+$/.test(usernameToFetch)) {
        setProfileInfo({ pic: null, username: null, followers: null, loading: false, error: "Nome de usuário contém caracteres inválidos." });
        return;
      }
      if (usernameToFetch.length < 1 || usernameToFetch.length > 30) {
        setProfileInfo({ pic: null, username: null, followers: null, loading: false, error: "Nome de usuário deve ter entre 1 e 30 caracteres." });
        return;
      }
    }

    if (!usernameToFetch) {
      setProfileInfo({ pic: null, username: null, followers: null, loading: false, error: "Nome de usuário inválido." });
      return;
    }

    try {
      const { data, status } = await getInstagramProfile({ username: usernameToFetch });
      
      if (data && data.username) {
        setProfileInfo({
          pic: data.profile_picture_url,
          username: data.username,
          followers: data.follower_count,
          loading: false,
          error: null
        });
      } else {
        setProfileInfo({
          pic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernameToFetch}`,
          username: usernameToFetch,
          followers: Math.floor(Math.random() * 5000) + 1000,
          loading: false,
          error: null
        });
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setProfileInfo({
        pic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernameToFetch}`,
        username: usernameToFetch,
        followers: Math.floor(Math.random() * 5000) + 1000,
        loading: false,
        error: null
      });
    }
  };

  const debouncedFetchProfile = useCallback(debounce(fetchProfile, 800), [selectedService]);

  const processUrlParams = (servicesList) => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    if (!serviceId) return;

    const preUrl = urlParams.get('url');
    const preQuantity = urlParams.get('quantity');
    const preWhatsapp = urlParams.get('whatsapp');
    const preEmail = urlParams.get('email');

    if (serviceId) {
      const service = servicesList.find(s => s.id === serviceId || s.service === serviceId);
      if (service) {
        setSelectedService(service);
        setOrderData({
          url: preUrl || '',
          quantity: preQuantity || service.default_quantity || service.min_quantity || 100,
          email: preEmail || '',
          whatsapp: preWhatsapp || '',
          coupon: '',
          is_drip_feed: false,
          drip_daily_quantity: ''
        });
        setStep(1);
      }
    }
  };

  const calculatePrice = useCallback((service, quantity, isExpress, currentAppliedCoupon = null) => {
    if (!service || quantity === "" || isNaN(parseInt(quantity))) {
        setOriginalPrice(0);
        return 0;
    }

    const parsedQuantity = parseInt(quantity, 10);
    
    const pricePerUnit = service.price_per_thousand
        ? service.price_per_thousand / 1000
        : parseFloat(service.price) / (service.default_quantity || 1000);

    let priceBeforeDiscounts = pricePerUnit * parsedQuantity;
    setOriginalPrice(priceBeforeDiscounts); // Set original price before any discounts/fees

    let finalCalculatedPrice = priceBeforeDiscounts;

    // Apply Express Priority Fee
    if (isExpress && settings?.enable_express_priority && settings?.express_priority_fee_percentage) {
        finalCalculatedPrice *= (1 + (settings.express_priority_fee_percentage / 100));
    }

    // Apply Coupon Discount
    if (currentAppliedCoupon?.discount_amount) {
        finalCalculatedPrice = Math.max(0, finalCalculatedPrice - currentAppliedCoupon.discount_amount);
    }
    
    // Removed VIP Discount logic

    return finalCalculatedPrice > 0 ? finalCalculatedPrice : 0;
  }, [settings]);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const cacheKey = 'instafly_initial_data_v2';
        const cachedData = localStorage.getItem(cacheKey);
        const now = new Date().getTime();
        const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (now - timestamp < CACHE_DURATION) {
            console.log("Loading initial data from cache.");
            setServices(data.services || MOCKED_SERVICES);
            setSettings(data.settings);
            processUrlParams(data.services || []);
            return;
          }
        }
        
        console.log("Fetching initial data from API.");
        const [homeServices, settingsData] = await Promise.all([
            Service.filter({ show_in_homepage: true, is_active: true }, 'order_index'),
            Settings.list()
        ]);

        const servicesToDisplay = homeServices.length > 0 ? homeServices : MOCKED_SERVICES;
        const settingsToDisplay = settingsData.length > 0 ? settingsData[0] : null;

        setServices(servicesToDisplay);
        setSettings(settingsToDisplay);

        // Removed User.me() call

        const dataToCache = {
          timestamp: now,
          data: {
            services: servicesToDisplay,
            settings: settingsToDisplay
          }
        };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));

        processUrlParams(servicesToDisplay);
      } catch (error) {
        console.error("Failed to fetch initial data, using fallbacks:", error);
        setServices(MOCKED_SERVICES);
        // Also attempt to load user even if other fetches failed - Removed
      }
    };

    fetchInitialData();

    const captureUtmParams = () => {
      const params = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      const utmParams = {};
      let hasUtm = false;

      utmKeys.forEach(key => {
        if (params.has(key)) {
          utmParams[key] = params.get(key);
          hasUtm = true;
        }
      });

      if (hasUtm) {
        sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
      }
    };

    captureUtmParams();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('favoriteServices');
    if (saved) {
      try {
        setFavoriteServices(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorite services from localStorage:", e);
        setFavoriteServices([]);
      }
    }
  }, []);

  useEffect(() => {
    let currentSessionId = localStorage.getItem('pwa_session_id');
    if (!currentSessionId) {
      currentSessionId = Date.now().toString();
      localStorage.setItem('pwa_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);

    const savedState = localStorage.getItem('checkout_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        const now = Date.now();
        if (parsedState.sessionId === currentSessionId && 
            parsedState.timestamp && 
            (now - parsedState.timestamp) < 30 * 60 * 1000) {
          
          console.log('Recuperando estado da sessão anterior...');
          
          setSelectedService(parsedState.selectedService);
          setStep(parsedState.step);
          setCurrentOrder(parsedState.currentOrder);
          setPaymentData(parsedState.paymentData);
          setSelectedPaymentMethod(parsedState.selectedPaymentMethod);
          setOrderData(parsedState.orderData || { 
            url: "", 
            quantity: "", 
            email: "", 
            whatsapp: "", 
            coupon: "", 
            is_drip_feed: false, 
            drip_daily_quantity: '' 
          });
          setFinalPrice(parsedState.finalPrice || 0);
          setPaymentStatus(parsedState.paymentStatus || 'idle');
          
          if (parsedState.currentOrder && parsedState.paymentStatus === 'polling') {
            startPaymentStatusCheck(parsedState.currentOrder.id);
          }
        } else {
          localStorage.removeItem('checkout_state');
        }
      } catch (e) {
        console.error('Erro ao recuperar estado:', e);
        localStorage.removeItem('checkout_state');
      }
    }
  }, []);

  // Removed loadUserWallet useEffect

  useEffect(() => {
    if (sessionId && (step > 0 || currentOrder)) {
      const stateToSave = {
        sessionId,
        timestamp: Date.now(),
        step,
        selectedService,
        currentOrder,
        paymentData,
        selectedPaymentMethod,
        orderData,
        finalPrice,
        paymentStatus
      };
      
      localStorage.setItem('checkout_state', JSON.stringify(stateToSave));
      console.log('Estado salvo:', step);
    }
  }, [sessionId, step, selectedService, currentOrder, paymentData, selectedPaymentMethod, orderData, finalPrice, paymentStatus]);

  const clearPersistedState = useCallback(() => {
    localStorage.removeItem('checkout_state');
    console.log('Estado persistido limpo');
  }, []);
  
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setOrderData(prev => ({ ...prev, url: newUrl }));
    if (selectedService?.platform === "Instagram" && selectedService?.service_type === "followers") {
      debouncedFetchProfile(newUrl);
    } else {
        setProfileInfo({ pic: null, username: null, followers: null, loading: false, error: null });
    }
  };
  
  const handleTrocarPerfil = () => {
    setProfileInfo({ pic: null, username: null, followers: null, loading: false, error: null });
    setOrderData({ ...orderData, url: "" });
  };
  
  const handleOrderClick = (service) => {
    setSelectedService(service);
    const defaultQty = service.default_quantity || service.min_quantity || service.min;
    
    // Removed VIP discount calculation
    
    setOrderData({ 
      url: "", 
      quantity: defaultQty, 
      email: "", 
      whatsapp: "", 
      coupon: "", 
      is_drip_feed: false, 
      drip_daily_quantity: '' 
    }); 
    setIsExpress(false);
    setAppliedCoupon(null);
    setProfileInfo({ pic: null, username: null, followers: null, loading: false, error: null });
    setStep(1);

    // Calculate initial price after setting order data and vip discount
    const initialPrice = calculatePrice(service, defaultQty, false, null);
    setFinalPrice(initialPrice);
  };

  const handleQuantityChange = (e) => {
    const quantity = e.target.value;
    setOrderData({ ...orderData, quantity });
    // Immediately calculate price for reactivity
    const newFinalPrice = calculatePrice(selectedService, quantity, isExpress, appliedCoupon);
    setFinalPrice(newFinalPrice);
  };

  const validateCoupon = async (couponCode) => {
    if (!couponCode.trim()) return null;
    
    setCouponLoading(true);
    setAlert(null);
    try {
      const currentOrderValue = calculatePrice(selectedService, orderData.quantity, isExpress, null);
      
      const { data, status, error } = await validateCouponApi({
          couponCode: couponCode.trim(),
          orderValue: currentOrderValue,
          serviceId: selectedService.id || selectedService.service,
          customerWhatsapp: orderData.whatsapp
      });

      if (status === 200 && data.valid) {
        return data;
      } else {
        return { valid: false, error: data?.error || error?.response?.data?.error || 'Erro ao validar cupom' };
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return { valid: false, error: 'Erro de conexão ao validar cupom.' };
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCouponChange = async (e) => {
    const couponCode = e.target.value;
    setOrderData({ ...orderData, coupon: couponCode });
    
    if (!couponCode.trim()) {
      setAppliedCoupon(null);
      setAlert(null);
      const newFinalPrice = calculatePrice(selectedService, orderData.quantity, isExpress, null);
      setFinalPrice(newFinalPrice);
      return;
    }

    if (couponCode.length >= 3) {
      const result = await validateCoupon(couponCode);
      
      if (result && result.valid) {
        setAppliedCoupon(result);
        setAlert({ type: "success", message: `Cupom aplicado! ${result.coupon.name}` });
        const newFinalPrice = calculatePrice(selectedService, orderData.quantity, isExpress, result);
        setFinalPrice(newFinalPrice);
      } else {
        setAppliedCoupon(null);
        const newFinalPrice = calculatePrice(selectedService, orderData.quantity, isExpress, null);
        setFinalPrice(newFinalPrice);
        if (result && result.error) {
          setAlert({ type: "error", message: result.error });
        } else {
          setAlert({ type: "error", message: "Cupom inválido ou expirado." });
        }
      }
    }
  };

  const handleExpressToggle = (checked) => {
    setIsExpress(checked);
    const newFinalPrice = calculatePrice(selectedService, orderData.quantity, checked, appliedCoupon);
    setFinalPrice(newFinalPrice);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (selectedService?.service_type === 'followers') {
      if (!orderData.url || orderData.url.trim() === '') {
        setAlert({ type: 'error', message: 'Por favor, insira o link do perfil ou o nome de usuário.' });
        return;
      }
      if (profileInfo.loading) {
          setAlert({ type: 'error', message: 'Aguarde a validação do perfil.' });
          return;
      }
      if (profileInfo.error) {
          setAlert({ type: 'error', message: 'Corrija o erro no link/usuário do perfil.' });
          return;
      }
      if (!profileInfo.username) {
        setAlert({ type: 'error', message: 'Não foi possível validar o perfil do Instagram. Verifique o link/usuário.' });
        return;
      }

    } else {
      if (!orderData.url || !isValidUrl(orderData.url)) {
        setAlert({ type: 'error', message: 'URL inválida. Insira o link completo da postagem.' });
        return;
      }
    }

    if (!orderData.quantity || parseInt(orderData.quantity) < (selectedService?.min_quantity || selectedService?.min || 1) || parseInt(orderData.quantity) > (selectedService?.max_quantity || selectedService?.max || 9999999)) {
       setAlert({ type: 'error', message: `Quantidade inválida. Min: ${(selectedService?.min_quantity || selectedService?.min || 1)}, Max: ${(selectedService?.max_quantity || selectedService?.max || 9999999)}.` });
       return;
    }
    
    if (!orderData.whatsapp) {
        setAlert({ type: "error", message: "O campo WhatsApp é obrigatório para notificações." });
        return;
    }

    if (orderData.is_drip_feed) {
      if (!orderData.drip_daily_quantity || parseInt(orderData.drip_daily_quantity) <= 0 || parseInt(orderData.drip_daily_quantity) > parseInt(orderData.quantity)) {
        setAlert({ type: "error", message: "A quantidade diária para Drip-Feed deve ser maior que zero e menor ou igual à quantidade total." });
        return;
      }
      if (parseInt(orderData.drip_daily_quantity) < (selectedService?.min_quantity || selectedService?.min || 100)) {
        setAlert({ type: "error", message: `A quantidade diária de Drip-Feed deve ser no mínimo ${selectedService?.min_quantity || selectedService?.min || 100}.` });
        return;
      }
    }

    setCreatingOrder(true);
    setAlert(null);
    
    try {
      const savedUtmParams = JSON.parse(sessionStorage.getItem('utm_params') || '{}');
      
      // Verificar se tem afiliado no URL
      const urlParams = new URLSearchParams(window.location.search);
      const affiliateRef = urlParams.get('ref');

      const orderDataToCreate = {
        service_id: selectedService.id || selectedService.service,
        service_name: selectedService.name,
        target_url: orderData.url,
        quantity: parseInt(orderData.quantity),
        total_price: finalPrice,
        customer_email: orderData.email,
        customer_whatsapp: orderData.whatsapp,
        coupon_code: orderData.coupon || null,
        coupon_discount_amount: appliedCoupon?.discount_amount || null,
        is_express: isExpress,
        is_drip_feed: orderData.is_drip_feed,
        status: "pending_payment", // Always pending_payment at this stage
        // Removed vip_discount_applied
        affiliate_ref: affiliateRef, // Added affiliate_ref
        payment_method: paymentMethod, // Added payment_method
        ...savedUtmParams
      };

      if (orderData.is_drip_feed) {
        orderDataToCreate.drip_daily_quantity = parseInt(orderData.drip_daily_quantity);
      }
      
      const newOrder = await Order.create(orderDataToCreate);
      setCurrentOrder(newOrder);
      
      // Criar registro DripFeed se necessário
      if (orderData.is_drip_feed && orderData.drip_daily_quantity > 0) {
        await DripFeedOrder.create({
          order_id: newOrder.id,
          total_quantity: parseInt(orderData.quantity),
          daily_quantity: parseInt(orderData.drip_daily_quantity),
          next_delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Added next_delivery_date
        });
      }
      
      setStep(2); // Move to payment selection step

      // WhatsApp notification - This should ideally be moved to after payment confirmation
      // as it's a "order created" notification, but for now, keeping it here as per current flow logic
      // It will send a notification that the order was "created" (pending payment)
      try {
        await supabase.functions.invoke('process-whatsapp-notifications', {
          body: {
            orderId: newOrder.id,
            trigger: 'order_created',
            orderData: newOrder
          }
        });
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp notification:", whatsappError);
      }

      // Email notification - Same as WhatsApp, move after payment
      if (orderData.email && settings?.enable_email_notifications) {
        try {
          const trackingLink = `${window.location.origin}${createPageUrl(`OrderTracking?orderId=${newOrder.id}`)}`;
          
          const emailSubject = settings.email_subject_template 
            ? settings.email_subject_template.replace('{{order_id}}', newOrder.id.slice(0, 8))
            : `Pedido #${newOrder.id.slice(0, 8)} - ${settings?.brand_name || 'InstaFLY'}`;
          
          let emailBody = settings.email_body_template || `
Olá!

Seu pedido foi criado com sucesso!

🆔 ID do Pedido: {{order_id}}
📋 Serviço: {{service_name}}
💰 Valor: R$ ${finalPrice.toFixed(2).replace('.', ',')}

🔗 Acompanhe seu pedido: {{tracking_link}}

Atenciosamente,
Equipe ${settings?.brand_name || 'InstaFLY'}
          `;
          
          emailBody = emailBody.replace(/{{order_id}}/g, newOrder.id);
          emailBody = emailBody.replace(/{{service_name}}/g, selectedService.name);
          emailBody = emailBody.replace(/{{tracking_link}}/g, trackingLink);

          console.log('Enviando email de confirmação...');
          await SendEmail({
            to: orderData.email,
            subject: emailSubject,
            body: emailBody
          });
          console.log('Email enviado com sucesso!');
        } catch (emailError) {
          console.error("Falha ao enviar e-mail de confirmação:", emailError);
        }
      }
      
    } catch(err) {
      setAlert({ type: "error", message: "Erro ao criar pedido. Tente novamente." });
      console.error("Order creation error:", err);
    } finally {
      setCreatingOrder(false);
    }
  };

  const startPaymentStatusCheck = (orderId) => {
    setPaymentStatus('polling');

    const checkInterval = setInterval(async () => {
      try {
        const { data } = await checkOrderStatus({ orderId });
        
        if (data && (data.payment_approved || data.status === 'processing' || data.status === 'completed')) {
          clearInterval(checkInterval);
          setAlert({ 
            type: "success", 
            message: "🎉 Pagamento confirmado! Redirecionando para acompanhamento..." 
          });
          setPaymentStatus('success');
          
          clearPersistedState();
          
          try {
            await supabase.functions.invoke('process-whatsapp-notifications', {
                body: {
                    orderId: orderId,
                    trigger: 'payment_approved',
                    paymentData: data
                }
            });
          } catch (whatsappError) {
            console.error("Failed to send WhatsApp notification for approved payment:", whatsappError);
          }

          setTimeout(() => {
            window.location.href = createPageUrl(`OrderTracking?orderId=${orderId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(checkInterval);
      if (paymentStatus === 'polling') {
        setAlert({ type: "error", message: "Tempo limite para confirmação de pagamento excedido. Por favor, verifique o status do seu pedido." });
        setPaymentStatus('idle');
      }
    }, 600000);
  };

  const handleCreatePayment = async (paymentMethod, cardData = null) => {
    if (!currentOrder) {
        setAlert({ type: "error", message: "Erro: Pedido não encontrado." });
        return;
    }
    
    setProcessingPayment(true);
    setAlert(null);
    
    try {
      const { data, status, error } = await createPayment({
        orderId: currentOrder.id,
        paymentMethod: paymentMethod,
        orderTotal: currentOrder.total_price,
        customerEmail: orderData.email,
        customerWhatsapp: orderData.whatsapp,
        cardData: cardData
      });
      
      if (data && data.success) {
        setPaymentData(data);
        setSelectedPaymentMethod(paymentMethod); // Set selected payment method here
        setStep(3);
        
        startPaymentStatusCheck(currentOrder.id);
        
        if (paymentMethod === 'pix' && data.status === 'pending') {
            setAlert({ type: "success", message: "PIX gerado com sucesso! Realize o pagamento para confirmar o pedido." });
            setPaymentStatus('polling');
            try {
              await supabase.functions.invoke('process-whatsapp-notifications', {
                    body: {
                        orderId: currentOrder.id,
                        trigger: 'pix_generated',
                        paymentData: data
                    }
                });
              } catch (whatsappError) {
                console.error("Failed to send WhatsApp notification for PIX generated:", whatsappError);
              }
          }
        } else {
        const errorMessage = error?.response?.data?.details?.message || error?.response?.data?.error || data?.error || "Erro ao processar pagamento.";
        setAlert({ type: "error", message: `Erro: ${errorMessage}` });
      }
    } catch (err) {
      console.error("Payment creation error:", err);
      const errorMessage = err?.response?.data?.details?.message || "Erro inesperado ao processar pagamento.";
      setAlert({ type: "error", message: `Erro: ${errorMessage}` });
    } finally {
      setProcessingPayment(false);
    }
  };

  // New handlePayment function for the new step 2 UI
  const handlePayment = async () => {
    if (!currentOrder) {
      setAlert({ type: "error", message: "Erro: Pedido não encontrado." });
      return;
    }

    // Removed wallet balance check

    // Call the existing handleCreatePayment function based on the selected method
    await handleCreatePayment(paymentMethod);
  };

  const toggleFavorite = (serviceId) => {
    const newFavorites = favoriteServices.includes(serviceId)
      ? favoriteServices.filter(id => id !== serviceId)
      : [...favoriteServices, serviceId];
    setFavoriteServices(newFavorites);
    localStorage.setItem('favoriteServices', JSON.stringify(newFavorites));
  };

  const openCalculator = (service) => {
    setCalculatorService(service);
    setCalculatorQuantity(service.default_quantity || service.min_quantity || 100);
    setShowPriceCalculator(true);
  };

  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(service => (service.platform) === selectedCategory);

  const categories = [...new Set(services.map(s => s.platform).filter(Boolean))];

  // Função para atualizar quantidade de um serviço específico
  const updateServiceQuantity = (serviceId, quantity) => {
    setServiceQuantities(prev => ({
      ...prev,
      [serviceId]: quantity
    }));
  };

  // Função para obter quantidade de um serviço
  const getServiceQuantity = (service) => {
    const serviceId = service.id || service.service;
    return serviceQuantities[serviceId] || service.default_quantity || service.min_quantity || 100;
  };

  return (
    <div className="bg-white text-gray-800">
      <Suspense fallback={<></>}>
        <SocialProofNotifications />
      </Suspense>
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-blue-400/20 rounded-full blur-md animate-bounce"></div>
        </div>
        
        {/* Floating Social Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-[15%] animate-float">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Instagram className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute top-1/3 right-[15%] animate-float-delayed">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Facebook className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-1/3 left-[10%] animate-float-slow">
            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <Youtube className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="absolute top-1/2 right-[10%] animate-float">
            <div className="w-11 h-11 bg-gradient-to-r from-gray-800 to-black rounded-xl flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl animate-pulse">
              <Zap className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Aumente suas redes sociais
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              de forma rápida e segura
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            Ganhe seguidores, curtidas e visualizações em todas as principais redes sociais. 
            Resultados garantidos e entrega rápida.
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-4 text-lg font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
            >
              <ShoppingCart className="mr-2 w-5 h-5" /> 
              Ver Serviços
            </Button>
            
            {/* Botões para Landing Pages */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-4 py-4 text-sm font-bold"
                onClick={() => window.location.href = createPageUrl('instagram')}
              >
                <Instagram className="mr-2 w-4 h-4" />
                Instagram
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-4 py-4 text-sm font-bold"
                onClick={() => window.location.href = createPageUrl('youtube')}
              >
                <Youtube className="mr-2 w-4 h-4" />
                YouTube
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-4 py-4 text-sm font-bold"
                onClick={() => window.location.href = createPageUrl('tiktok')}
              >
                <Music className="mr-2 w-4 h-4" />
                TikTok
              </Button>
               <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-4 py-4 text-sm font-bold"
                onClick={() => window.location.href = createPageUrl('facebook')}
              >
                <Facebook className="mr-2 w-4 h-4" />
                Facebook
              </Button>
                <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-4 py-4 text-sm font-bold"
                onClick={() => window.location.href = createPageUrl('kwai')}
              >
                <Music className="mr-2 w-4 h-4" />
                Kwai
              </Button>
            </div>
          </div>

          {/* Mock Phone Display com Animação */}
          <div className="relative max-w-sm mx-auto group">
            <div className="relative z-10 bg-gray-900 rounded-3xl p-2 shadow-2xl animate-float group-hover:animate-none transform group-hover:scale-105 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                  <div className="text-xs text-gray-500 animate-pulse">Social Media</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-pink-50 p-2 rounded transform hover:scale-105 transition-transform animate-slide-in">
                    <Instagram className="w-4 h-4 text-pink-500 animate-bounce" />
                    <span className="text-xs font-medium">+1.2k seguidores</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded transform hover:scale-105 transition-transform animate-slide-in" style={{animationDelay: '0.3s'}}>
                    <Facebook className="w-4 h-4 text-blue-500 animate-bounce" style={{animationDelay: '0.5s'}} />
                    <span className="text-xs font-medium">+890 curtidas</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 p-2 rounded transform hover:scale-105 transition-transform animate-slide-in" style={{animationDelay: '0.6s'}}>
                    <Youtube className="w-4 h-4 text-red-500 animate-bounce" style={{animationDelay: '1s'}} />
                    <span className="text-xs font-medium">+5.6k visualizações</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Efeitos de fundo animados */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-400/20 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-pink-400/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 -left-8 w-4 h-4 bg-blue-400/20 rounded-full animate-ping"></div>
            <div className="absolute top-1/4 -right-6 w-5 h-5 bg-green-400/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </section>

      {/* Nova seção: Calculadora de Preços Rápida */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">🧮 Calcule seu Investimento</h2>
          <p className="text-gray-600 mb-6">Descubra quanto custará para alcançar seus objetivos</p>
          <Button 
            onClick={() => setShowServiceComparison(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            Comparar Serviços e Preços
          </Button>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">É Simples, Rápido e Seguro</h2>
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-8 text-center">
            <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-6 p-4 md:p-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 rounded-full flex-shrink-0">
                <CheckCircle className="w-6 h-6 md:w-10 md:h-10" />
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg md:text-xl font-semibold mb-1">1. Escolha</h3>
                <p className="text-gray-600 text-sm md:text-base">Selecione o serviço ideal</p>
              </div>
            </div>
            <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-6 p-4 md:p-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-600 rounded-full flex-shrink-0">
                <Rocket className="w-6 h-6 md:w-10 md:h-10" />
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg md:text-xl font-semibold mb-1">2. Informe</h3>
                <p className="text-gray-600 text-sm md:text-base">Cole o link e quantidade</p>
              </div>
            </div>
            <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-6 p-4 md:p-6 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center w-12 h-12 md:w-20 md:h-20 bg-gradient-to-r from-green-100 to-green-200 text-green-600 rounded-full flex-shrink-0">
                <ShieldCheck className="w-6 h-6 md:w-10 md:h-10" />
              </div>
              <div className="text-left md:text-center">
                <h3 className="text-lg md:text-xl font-semibold mb-1">3. Pague</h3>
                <p className="text-gray-600 text-sm md:text-base">PIX ou cartão seguro</p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Services Section */}
      <section id="services" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Nossos Pacotes Mais Populares</h2>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Pedidos processados na hora</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">97% de satisfação</span>
              </div>
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex justify-center mb-12">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full max-w-4xl">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 bg-white/70 backdrop-blur-sm">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Todos
                </TabsTrigger>
                {categories.slice(0, 5).map(category => {
                  const PlatformIcon = platformIcons[category] || Zap;
                  const colors = platformColors[category] || platformColors.default;
                  return (
                    <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.bg} flex items-center justify-center`}>
                        <PlatformIcon className="w-3 h-3 text-white" />
                      </div>
                      {category}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredServices.map(service => {
              const PlatformIcon = platformIcons[service.platform] || Zap;
              const colors = platformColors[service.platform] || platformColors.default;
              const isFavorite = favoriteServices.includes(service.id || service.service);
              
              const getBadgeInfo = () => {
                const badgeMap = {
                  'popular': { text: settings?.custom_badge_popular || "🔥 MAIS VENDIDO", color: "bg-gradient-to-r from-orange-400 to-red-500" },
                  'brazilian': { text: settings?.custom_badge_brazilian || "🇧🇷 BRASILEIROS", color: "bg-gradient-to-r from-green-400 to-green-600" },
                  'fast': { text: settings?.custom_badge_fast || "⚡ ENTREGA RÁPIDA", color: "bg-gradient-to-r from-blue-400 to-purple-500" },
                  'quality': { text: settings?.custom_badge_quality || "✅ ALTA QUALIDADE", color: "bg-gradient-to-r from-gray-400 to-gray-600" },
                  'monetizable': { text: settings?.custom_badge_monetizable || "📈 MONETIZÁVEL", color: "bg-gradient-to-r from-red-400 to-red-600" },
                  'safe': { text: settings?.custom_badge_safe || "🛡️ SEGURO", color: "bg-gradient-to-r from-blue-500 to-blue-700" },
                  'guaranteed': { text: settings?.custom_badge_guaranteed || "💯 GARANTIDO", color: "bg-gradient-to-r from-purple-500 to-purple-700" }
                };

                if (service.badge_type && service.badge_type !== 'none' && badgeMap[service.badge_type]) {
                  return badgeMap[service.badge_type];
                }
                
                if (service.is_popular) {
                  return badgeMap['popular'];
                }
                if (service.is_brazilian) {
                  return badgeMap['brazilian'];
                }
                
                return null; 
              };

              const badgeInfo = getBadgeInfo();
              
              return (
                <div key={service.id || service.service} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform hover:scale-105 relative group">
                  
                  <button
                    onClick={() => toggleFavorite(service.id || service.service)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>

                  {badgeInfo && (
                    <div className={`absolute top-4 left-4 z-10 ${badgeInfo.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                      {badgeInfo.text}
                    </div>
                  )}

                  <div className="p-6 text-center border-b relative overflow-hidden group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-300">
                    <div className={`absolute inset-0 ${colors.bgLight} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
                    <div className="relative z-10">
                      <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                        {service.default_quantity?.toLocaleString() || service.quantity_text}
                      </h3>
                      <p className="text-base md:text-lg font-semibold text-gray-700 mb-4">{service.name}</p>
                      <div className="flex items-center justify-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${colors.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <PlatformIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center">
                          <span className={`font-bold text-lg ${colors.text} block`}>
                            {service.platform}
                          </span>
                          <div className="mt-1">
                            {service.is_brazilian ? (
                              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                🇧🇷 Brasileiros
                              </span>
                            ) : (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                                🌎 Estrangeiros
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-6 md:py-8 text-center bg-white group-hover:bg-gradient-to-r group-hover:from-green-50 to-blue-50 transition-all duration-300">
                    <div className="relative z-10">
                      <span className="text-2xl md:text-3xl font-medium text-gray-600">R$</span>
                      <span className="text-4xl md:text-6xl font-bold tracking-tighter ml-1 text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                        {service.price_per_thousand 
                          ? ((service.price_per_thousand / 1000) * (service.default_quantity || 1000)).toFixed(2).replace('.', ',')
                          : (parseFloat(service.price)).toFixed(2).replace('.', ',')
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6 flex-grow">
                    <ul className="space-y-3 md:space-y-4">
                      {(service.features || []).map((feature, index) => {
                        const FeatureIcon = featureIconsList[feature.icon] || Star;
                        return (
                          <li key={index} className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                            <div className="w-5 h-5 md:w-6 md:h-6 mr-3 flex-shrink-0 text-green-500">
                              <FeatureIcon className="w-full h-full" />
                            </div>
                            <span className="text-xs md:text-sm font-medium">{feature.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  <div className="p-4 md:p-6 bg-gray-50 border-t space-y-3">
                    <Button 
                      className="w-full text-base md:text-lg py-4 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 to-purple-700 group-hover:scale-105 transition-all duration-300" 
                      onClick={() => handleOrderClick(service)}
                    >
                      <div className="relative z-10 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 transform group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-bold text-lg md:text-xl">Comprar Agora</span>
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3 animate-pulse" />
                      </div>
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs md:text-sm"
                        onClick={() => openCalculator(service)}
                      >
                        🧮 Calcular
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs md:text-sm"
                        onClick={() => {
                          const message = `Olá! Gostaria de saber mais sobre: ${service.name}\n\nQuantidade: ${service.default_quantity?.toLocaleString()}\nPreço: R$ ${(service.price_per_thousand ? ((service.price_per_thousand / 1000) * (service.default_quantity || 1000)).toFixed(2) : parseFloat(service.price).toFixed(2)).replace('.', ',')}\n\nPode me ajudar?`;
                          window.open(`https://wa.me/${settings?.whatsapp_support_number}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                      >
                        💬 Dúvidas
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {favoriteServices.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                Seus Favoritos
              </h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {services.filter(s => favoriteServices.includes(s.id || s.service)).map(service => (
                  <div key={service.id || service.service} className="bg-white p-4 rounded-lg shadow-md border-2 border-red-200">
                    <h4 className="font-bold text-sm">{service.name}</h4>
                    <p className="text-xs text-gray-600">{service.platform}</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-red-500 hover:bg-red-600"
                      onClick={() => handleOrderClick(service)}
                    >
                      Comprar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Nova seção: Depoimentos */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">O que nossos clientes dizem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Ana Silva",
                service: "Seguidores Instagram",
                text: "Incrível! Ganhei 5k seguidores em 2 dias. Qualidade excelente e suporte nota 10!",
                rating: 5,
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=d1d4f9"
              },
              {
                name: "Carlos Mendes",
                service: "Views YouTube",
                text: "Meus vídeos decolaram! O alcance aumentou muito e estou monetizando melhor.",
                rating: 5,
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=c7d2fe"
              },
              {
                name: "Julia Costa",
                service: "Curtidas TikTok",
                text: "Super rápido! Em poucas horas já estava recebendo as curtidas. Recomendo!",
                rating: 5,
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia&backgroundColor=a7f3d0"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" loading="lazy" width="48" height="48" />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.service}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nova seção: FAQ Rápido */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Dúvidas Frequentes</h2>
          <div className="max-w-3xl mx-auto">
            {[
              {
                q: "É seguro? Vou ser banido?",
                a: "Totalmente seguro! Usamos apenas métodos aprovados pelas plataformas. Nunca pedimos sua senha."
              },
              {
                q: "Quanto tempo demora para receber?",
                a: "A maioria dos pedidos começa em até 30 minutos e é concluída em 24-48 horas."
              },
              {
                q: "Posso cancelar meu pedido?",
                a: "Sim! Você pode cancelar antes do processamento começar e receber reembolso total."
              },
              {
                q: "Os seguidores são brasileiros?",
                a: "Oferecemos tanto seguidores brasileiros quanto mundiais. Você escolhe na hora da compra."
              }
            ].map((faq, index) => (
              <details key={index} className="bg-white rounded-lg shadow-md mb-4 p-6 hover:shadow-lg transition-shadow">
                <summary className="font-bold cursor-pointer text-lg flex items-center justify-between">
                  {faq.q}
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 text-sm">+</span>
                  </div>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Order Modal */}
      <Dialog open={step === 1} onOpenChange={(open) => {if(!open) setStep(0)}}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Realizar Pedido
              </DialogTitle>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-xs text-gray-500 ml-2">1/3</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{selectedService?.name}</p>
          </DialogHeader>

          {/* Removed VIP discount display */}

          <div className="space-y-4 py-4">
            {alert && <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}><AlertDescription>{alert.message}</AlertDescription></Alert>}
            
            <div>
              <Label htmlFor="url">
                {selectedService?.platform === 'Instagram' ? 
                  selectedService?.service_type === 'followers' ?
                    'Link ou @usuário do Instagram *' :
                    'Link da publicação do Instagram (Foto/Reel/Vídeo) *' :
                  `Link do ${selectedService?.platform || 'perfil/post'} *`
                }
              </Label>
              
              
              <div className="relative mt-1">
                <Input 
                  id="url" 
                  value={orderData.url} 
                  onChange={handleUrlChange}
                  placeholder="Ex: https://instagram.com/usuario ou @usuario"
                  className="pr-12"
                  disabled={profileInfo.loading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {profileInfo.loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : (
                    <Instagram className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Insira o link completo do perfil ou o nome de usuário (ex: @seuuser).
              </p>
              
              {profileInfo.loading && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Validando perfil do Instagram...
                  </p>
                </div>
              )}
              
              {profileInfo.error && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {profileInfo.error}
                  </p>
                </div>
              )}

              {profileInfo.username && !profileInfo.loading && !profileInfo.error && (
                <div className="mt-4 flex items-center justify-between rounded-lg border-2 border-green-200 bg-green-50 p-3">
                  <div className="flex items-center gap-3">
                    {profileInfo.pic ? (
                      <img 
                        src={profileInfo.pic} 
                        alt="Avatar" 
                        className="w-12 h-12 object-cover rounded-full border-2 border-green-300"
                        loading="lazy"
                        width="48"
                        height="48"
                      />
                    ) : (
                      <Avatar className="w-12 h-12 border-2 border-green-300">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                          {profileInfo.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">@{profileInfo.username}</p>
                      {profileInfo.followers && (
                        <p className="text-sm text-gray-700">{profileInfo.followers?.toLocaleString('pt-BR')} seguidores</p>
                      )}
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Perfil validado</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleTrocarPerfil}>
                    Trocar
                  </Button>
                </div>
              )}
            
            </div>

            <div>
              <Label htmlFor="quantity">Quantidade *: {parseInt(orderData.quantity || 0).toLocaleString('pt-BR')}</Label>
              <div className="mt-2 space-y-2">
                <input
                  type="range"
                  min={selectedService?.min_quantity || selectedService?.min || 100}
                  max={selectedService?.max_quantity || selectedService?.max || 10000}
                  value={orderData.quantity || 0}
                  onChange={handleQuantityChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(((orderData.quantity || 0) - (selectedService?.min_quantity || selectedService?.min || 100)) / ((selectedService?.max_quantity || selectedService?.max || 10000) - (selectedService?.min_quantity || selectedService?.min || 100))) * 100}%, #e5e7eb ${(((orderData.quantity || 0) - (selectedService?.min_quantity || selectedService?.min || 100)) / ((selectedService?.max_quantity || selectedService?.max || 10000) - (selectedService?.min_quantity || selectedService?.min || 100))) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mín: ${(selectedService?.min_quantity || selectedService?.min)?.toLocaleString()}</span>
                  <span>Máx: ${(selectedService?.max_quantity || selectedService?.max)?.toLocaleString()}</span>
                </div>
              </div>
              <Input 
                id="quantity" 
                type="number" 
                value={orderData.quantity} 
                onChange={handleQuantityChange} 
                min={selectedService?.min_quantity || selectedService?.min}
                max={selectedService?.max_quantity || selectedService?.max}
                className="mt-3"
              />
            </div>
            
            {/* Opção Drip-Feed */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="drip_feed"
                  checked={orderData.is_drip_feed}
                  onChange={(e) => setOrderData({...orderData, is_drip_feed: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="drip_feed" className="font-medium text-blue-900">
                  📈 Entrega Gradual (Drip-Feed)
                </Label>
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Receba sua quantidade total de forma gradual e natural ao longo de vários dias, 
                evitando picos artificiais que podem prejudicar sua conta.
              </p>
              
              {orderData.is_drip_feed && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="drip_quantity" className="text-sm">Quantidade por dia</Label>
                    <Input
                      id="drip_quantity"
                      type="number"
                      min={selectedService?.min_quantity || selectedService?.min || 100}
                      max={orderData.quantity}
                      value={orderData.drip_daily_quantity}
                      onChange={(e) => setOrderData({...orderData, drip_daily_quantity: parseInt(e.target.value) || 0})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Duração estimada</Label>
                    <div className="h-10 flex items-center text-sm font-medium text-blue-600">
                      {orderData.drip_daily_quantity && orderData.drip_daily_quantity > 0 && orderData.quantity > 0 ? 
                        `${Math.ceil(orderData.quantity / orderData.drip_daily_quantity)} dias` : 
                        'N/A'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input 
                id="whatsapp" 
                type="tel" 
                value={orderData.whatsapp} 
                onChange={e => setOrderData({...orderData, whatsapp: e.target.value})} 
                placeholder="(11) 99999-9999"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Para receber notificações sobre seu pedido
              </p>
            </div>
            
            <div>
              <Label htmlFor="email">Seu E-mail (Opcional)</Label>
              <Input 
                id="email" 
                type="email" 
                value={orderData.email} 
                onChange={e => setOrderData({...orderData, email: e.target.value})} 
                placeholder="Para receber a confirmação do pedido"
                className="mt-1"
              />
            </div>

            {settings?.enable_coupons && (
              <div>
                <Label htmlFor="coupon">Cupom de Desconto (Opcional)</Label>
                <div className="relative">
                  <Input 
                    id="coupon" 
                    value={orderData.coupon} 
                    onChange={handleCouponChange}
                    placeholder="Digite seu cupom aqui"
                    className="mt-1 pr-10"
                  />
                  {couponLoading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    </div>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="mt-1 p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {appliedCoupon.coupon.name} - Desconto: R$ {appliedCoupon.discount_amount?.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {settings?.enable_express_priority && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                         <Zap className="w-5 h-5 text-yellow-500" />
                        <div>
                            <Label htmlFor="express-switch" className="font-bold">
                                Prioridade Express
                            </Label>
                            <p className="text-xs text-yellow-700">
                                Seu pedido é processado na frente dos outros. (+{settings.express_priority_fee_percentage}%)
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="express-switch"
                        checked={isExpress}
                        onCheckedChange={handleExpressToggle}
                        className="data-[state=checked]:bg-yellow-500"
                    />
                </div>
            )}

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center border border-blue-200">
              {originalPrice > finalPrice + 0.01 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 line-through">
                    De: R$ {originalPrice.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-2">Valor Total</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                R$ {finalPrice.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                R$ {selectedService ? (
                  ((selectedService.price_per_thousand || (parseFloat(selectedService.price) / (selectedService.default_quantity || 1000) * 1000)) / 1000).toFixed(2).replace('.', ',')
                ) : '0,00'} por unidade
              </p>
              {originalPrice > finalPrice + 0.01 && (
                <p className="text-xs text-green-600 mt-1">
                  💰 Você economizou R$ ${(originalPrice - finalPrice).toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStep(0)}>
              ← Voltar
            </Button>
            <Button 
              onClick={handleCreateOrder} 
              disabled={creatingOrder || profileInfo.loading || (selectedService?.platform === 'Instagram' && selectedService?.service_type === 'followers' && !profileInfo.username)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 to-purple-700"
            >
              {creatingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : "Ir para Pagamento →"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Pedido - Passo 2: Pagamento */}
      {step === 2 && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-center">Finalizar Pagamento</h3>
            
            <div className="space-y-4 mb-6">
              {alert && <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4"><AlertDescription>{alert.message}</AlertDescription></Alert>}

              <div className="flex justify-between">
                <span>Serviço:</span>
                <span className="font-medium">{currentOrder.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantidade:</span>
                <span className="font-medium">{currentOrder.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Total:</span>
                <span className="font-bold text-lg text-green-600">R$ {currentOrder.total_price.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Opções de Pagamento - Removed wallet option */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold">Escolha a forma de pagamento:</h4>
              
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">PIX</span>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Cartão de Crédito/Débito</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={handlePayment}
                disabled={processingPayment}
                className="flex-1"
              >
                {processingPayment ? "Processando..." : "Continuar"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Payment Detail Modal */}
      <Dialog open={step === 3} onOpenChange={(open) => {
          if (!open) {
            setStep(0);
            setPaymentStatus('idle');
          }
      }}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <div className="flex items-center justify-between mb-2">
                  <DialogTitle className="text-center text-xl">
                      {selectedPaymentMethod === 'pix' ? 'Pagamento com PIX' : 'Pagamento com Cartão'}
                  </DialogTitle>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-xs text-gray-500 ml-2">3/3</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600">
                    Pedido #{currentOrder?.id?.slice(0, 8)} no valor de R$ {finalPrice.toFixed(2).replace('.', ',')}
                </p>
            </DialogHeader>
            <div className="py-4">
                {alert && <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4"><AlertDescription>{alert.message}</AlertDescription></Alert>}
                
                {paymentStatus === 'success' ? (
                    <div className="text-center p-8 flex flex-col items-center gap-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h3 className="text-2xl font-bold">Pagamento Aprovado!</h3>
                        <p className="text-gray-600">Seu pedido já está sendo processado. Você será redirecionado em instantes.</p>
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                  <>
                  {selectedPaymentMethod === 'pix' && !paymentData && ( 
                      <div className="text-center">
                          <Button 
                              onClick={() => handleCreatePayment('pix')}
                              disabled={processingPayment}
                              className="w-full bg-green-600 hover:bg-green-700"
                          >
                              {processingPayment ? (
                                  <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Gerando PIX...
                                  </>
                              ) : 'Gerar PIX'}
                          </Button>
                      </div>
                  )}
                  
                  {selectedPaymentMethod === 'pix' && paymentData && (
                      <div className="flex flex-col items-center gap-4">
                          {paymentData.qr_code_base64 && (
                              <img 
                                  src={`data:image/png;base64,${paymentData.qr_code_base64}`} 
                                  alt="QR Code PIX" 
                                  className="w-48 h-48 border rounded-lg p-2"
                              />
                          )}
                          <p className="text-sm text-center text-gray-600">
                              Escaneie o QR Code com seu banco ou copie o código PIX abaixo:
                          </p>
                          {paymentData.qr_code && (
                              <div className="w-full p-3 bg-gray-100 rounded-md text-xs font-mono break-all relative">
                                  {paymentData.qr_code}
                                  <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="absolute top-1 right-1 h-7 w-7" 
                                      onClick={() => navigator.clipboard.writeText(paymentData.qr_code)}
                                  >
                                      <Copy className="w-4 h-4"/>
                                  </Button>
                              </div>
                          )}
                          <Alert className="w-full">
                              <AlertDescription className="text-center">
                                  ⏱️ O pagamento será confirmado automaticamente. 
                                  Você receberá uma notificação assim que for aprovado.
                              </AlertDescription>
                          </Alert>
                      </div>
                  )}
                  {/* Removed wallet payment details */}
                  {selectedPaymentMethod === 'credit_card' && (
                      <div className="space-y-4">
                          <div>
                              <Label htmlFor="card-number">Número do Cartão</Label>
                              <Input id="card-number" placeholder="0000 0000 0000 0000" />
                          </div>
                          <div>
                              <Label htmlFor="card-name">Nome no Cartão</Label>
                              <Input id="card-name" placeholder="Seu Nome Completo" />
                          </div>
                          <div className="flex gap-4">
                              <div className="w-1/2">
                                  <Label htmlFor="card-expiry">Validade</Label>
                                  <Input id="card-expiry" placeholder="MM/AA" />
                              </div>
                              <div className="w-1/2">
                                  <Label htmlFor="card-cvc">CVC</Label>
                                  <Input id="card-cvc" placeholder="123" />
                              </div>
                          </div>
                          <div>
                              <Label htmlFor="card-cpf">CPF</Label>
                              <Input id="card-cpf" placeholder="000.000.000-00" />
                          </div>
                          <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700" 
                              onClick={() => handleCreatePayment('credit_card', { 
                                  number: document.getElementById('card-number')?.value,
                                  name: document.getElementById('card-name')?.value,
                                  expiry: document.getElementById('card-expiry')?.value,
                                  cvc: document.getElementById('card-cvc')?.value,
                                  cpf: document.getElementById('card-cpf')?.value
                              })}
                              disabled={processingPayment}
                          >
                              {processingPayment ? (
                                  <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Processando...
                                  </>
                              ) : 'Pagar Agora'}
                          </Button>
                      </div>
                  )}
                  </>
                )}
            </div>
            <DialogFooter>
                {!processingPayment && paymentStatus !== 'success' && (
                    <Button 
                        variant="outline" 
                        onClick={() => window.location.href = createPageUrl(`OrderTracking?orderId=${currentOrder?.id}`)}
                    >
                        Acompanhar Pedido
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal Calculadora */}
      <Dialog open={showPriceCalculator} onOpenChange={setShowPriceCalculator}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🧮 Calculadora de Preços
            </DialogTitle>
            <p className="text-sm text-gray-600">{calculatorService?.name}</p>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-base font-medium">Quantidade: {calculatorQuantity.toLocaleString()}</Label>
              <div className="mt-3 space-y-2">
                <input
                  type="range"
                  min={calculatorService?.min_quantity || 100}
                  max={calculatorService?.max_quantity || 10000}
                  value={calculatorQuantity}
                  onChange={(e) => setCalculatorQuantity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((calculatorQuantity - (calculatorService?.min_quantity || 100)) / ((calculatorService?.max_quantity || 10000) - (calculatorService?.min_quantity || 100))) * 100}%, #e5e7eb ${((calculatorQuantity - (calculatorService?.min_quantity || 100)) / ((calculatorService?.max_quantity || 10000) - (calculatorService?.min_quantity || 100))) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{(calculatorService?.min_quantity || 100).toLocaleString()}</span>
                  <span>{(calculatorService?.max_quantity || 10000).toLocaleString()}</span>
                </div>
              </div>
              
              <Input
                type="number"
                value={calculatorQuantity}
                onChange={(e) => setCalculatorQuantity(parseInt(e.target.value) || 0)}
                min={calculatorService?.min_quantity}
                max={calculatorService?.max_quantity}
                className="mt-3"
              />
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Preço Total</p>
              <p className="text-4xl font-bold text-green-600">
                R$ {calculatorService ? (
                  ((calculatorService.price_per_thousand / 1000) * calculatorQuantity).toFixed(2).replace('.', ',')
                ) : '0,00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                R$ {calculatorService ? (
                  (calculatorService.price_per_thousand / 1000).toFixed(2).replace('.', ',')
                ) : '0,00'} por unidade
              </p>
              <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                💡 Com {calculatorQuantity.toLocaleString()}, você tem {Math.floor(calculatorQuantity / 100)} vezes mais impacto!
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceCalculator(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setShowPriceCalculator(false);
              handleOrderClick({...calculatorService, default_quantity: calculatorQuantity});
            }}>
              Comprar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Comparação de Serviços */}
      <Dialog open={showServiceComparison} onOpenChange={setShowServiceComparison}>
        <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparar Serviços e Calcular Preços</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Serviço</th>
                    <th className="text-left p-2">Plataforma</th>
                    <th className="text-left p-2">Calculadora</th>
                    <th className="text-left p-2">Preço Total</th>
                    <th className="text-left p-2">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {services.slice(0, 15).map(service => {
                    const serviceId = service.id || service.service;
                    const quantity = getServiceQuantity(service);
                    const totalPrice = (service.price_per_thousand / 1000) * quantity;
                    
                    return (
                      <tr key={serviceId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{service.name}</td>
                        <td className="p-2">{service.platform}</td>
                        <td className="p-2">
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <input
                              type="range"
                              min={service.min_quantity || 100}
                              max={service.max_quantity || 10000}
                              value={quantity}
                              onChange={(e) => updateServiceQuantity(serviceId, parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((quantity - (service.min_quantity || 100)) / ((service.max_quantity || 10000) - (service.min_quantity || 100))) * 100}%, #e5e7eb ${((quantity - (service.min_quantity || 100)) / ((service.max_quantity || 10000) - (service.min_quantity || 100))) * 100}%, #e5e7eb 100%)`
                              }}
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">{(service.min_quantity || 100).toLocaleString()}</span>
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) => updateServiceQuantity(serviceId, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-xs border rounded text-center"
                                min={service.min_quantity}
                                max={service.max_quantity}
                              />
                              <span className="text-xs text-gray-500">{(service.max_quantity || 10000).toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-center">
                            <div className="font-bold text-green-600 text-lg">
                              R$ {totalPrice.toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {quantity.toLocaleString()} unidades
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Button size="sm" onClick={() => {
                            setShowServiceComparison(false);
                            handleOrderClick({...service, default_quantity: quantity});
                          }}>
                            Comprar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Rodapé Discreto */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {settings?.brand_name || 'InstaFLY'}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Impulsione suas redes sociais com qualidade e segurança.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href={createPageUrl("Home")} className="hover:text-white transition">Início</a></li>
                {/* Removed Subscriptions link */}
                <li><a href={createPageUrl("Faq")} className="hover:text-white transition">Ajuda</a></li>
                <li><a href={createPageUrl("OrderTracking")} className="hover:text-white transition">Rastrear Pedido</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {/* Removed Affiliates link */}
                <li>
                  {settings?.whatsapp_support_number && (
                    <a 
                      href={`https://wa.me/${settings.whatsapp_support_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition"
                    >
                      WhatsApp
                    </a>
                  )}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Sistema</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  {/* Removed AdminDashboard link */}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 {settings?.brand_name || 'InstaFLY'}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          50% { transform: translateY(-20px) rotate(0deg); }
          75% { transform: translateY(-10px) rotate(-1deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slide-in {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0px); opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slide-in {
          animation: slide-in 0.8s ease-out forwards;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
