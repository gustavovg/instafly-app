
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Instagram, Youtube, Music, Facebook, ShoppingCart, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Service } from '@/api/entities';
import { ChatbotFlow } from '@/api/entities';
import { ChatbotSettings } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const platformIcons = {
  Instagram: Instagram,
  YouTube: Youtube,
  TikTok: Music,
  Facebook: Facebook
};

const Message = ({ msg, onServiceClick, onOptionClick, settings }) => {
  const isBot = msg.sender === 'bot';
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isBot && msg.text) {
      setIsTyping(true);
      setDisplayedText('');
      let i = 0;
      const fullText = msg.text;
      const typingSpeed = settings?.typing_speed || 25;
      
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setDisplayedText(prev => prev + fullText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, typingSpeed);

      return () => clearInterval(typingInterval);
    } else {
      setDisplayedText(msg.text || '');
      setIsTyping(false);
    }
  }, [msg.text, isBot, settings?.typing_speed]);

  const showContent = !isTyping || !isBot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
    >
      {isBot && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback 
            className="text-white"
            style={{ backgroundColor: settings?.bot_avatar_color || '#3b82f6' }}
          >
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[85%] p-3 rounded-2xl ${
          isBot 
            ? 'bg-white border border-gray-200 shadow-sm rounded-bl-none' 
            : 'text-white rounded-br-none shadow-md'
        }`}
        style={!isBot ? { 
          background: `linear-gradient(135deg, ${settings?.primary_color || '#3b82f6'}, ${settings?.secondary_color || '#8b5cf6'})` 
        } : {}}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayedText}</p>
        
        {showContent && msg.services && msg.services.length > 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Aqui estão as melhores opções para você:</p>
            {msg.services.map(service => {
              const PlatformIcon = platformIcons[service.platform] || ShoppingCart;
              return (
                <Card 
                  key={service.id} 
                  className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:from-blue-100 hover:to-purple-100"
                  onClick={() => onServiceClick(service)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${settings?.primary_color || '#3b82f6'}, ${settings?.secondary_color || '#8b5cf6'})` }}
                    >
                      <PlatformIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-600">
                        {service.default_quantity?.toLocaleString()} por R$ {
                          (service.price_per_thousand / 1000 * service.default_quantity).toFixed(2).replace('.', ',')
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        
        {showContent && msg.options && msg.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {msg.options.map((opt, index) => (
              <Button 
                key={index} 
                size="sm" 
                variant="outline" 
                className="text-xs h-auto py-2 px-3 hover:bg-blue-50 border-blue-200" 
                onClick={() => onOptionClick(opt)}
              >
                {opt.text}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function SalesChatbot({ settings: globalSettings, currentPageName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [loading, setLoading] = useState(false);
  const [chatbotFlows, setChatbotFlows] = useState([]);
  const [chatbotSettings, setChatbotSettings] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef(null);
  const autoOpenRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    loadChatbotData();
  }, []);

  useEffect(() => {
    // Auto-open logic
    if (isReady && chatbotSettings?.auto_open_delay > 0 && !autoOpenRef.current && !isOpen) {
      const timer = setTimeout(() => {
        if (shouldShowOnCurrentPage()) {
          setIsOpen(true);
          autoOpenRef.current = true;
        }
      }, chatbotSettings.auto_open_delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isReady, chatbotSettings?.auto_open_delay, currentPageName, isOpen]);

  const loadChatbotData = async () => {
    try {
      const [flowsData, settingsData] = await Promise.all([
        ChatbotFlow.list("order_index"),
        ChatbotSettings.list()
      ]);
      
      setChatbotFlows(flowsData);
      if (settingsData.length > 0) {
        setChatbotSettings(settingsData[0]);
      }
    } catch (error) {
      console.error("Failed to load chatbot data:", error);
    } finally {
      setIsReady(true);
    }
  };

  const shouldShowOnCurrentPage = () => {
    if (!chatbotSettings?.show_on_pages || chatbotSettings.show_on_pages.length === 0) return true;
    return chatbotSettings.show_on_pages.includes(currentPageName);
  };

  const startConversation = () => {
    if (!chatbotSettings) return;

    const welcomeMessage = {
      sender: 'bot',
      text: chatbotSettings.welcome_message,
      options: chatbotSettings.quick_actions?.map(action => ({
        text: action.text,
        value: action.action_value,
        action_type: action.action_type,
        is_primary: action.is_primary
      })) || [],
      timestamp: Date.now()
    };

    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0 && chatbotSettings) {
      setTimeout(startConversation, 500);
    }
  }, [isOpen, chatbotSettings]);

  const handleOptionClick = async (option) => {
    // Add user message
    const userMessage = { 
      sender: 'user', 
      text: option.text, 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, userMessage]);

    // Handle different action types
    if (option.action_type === 'redirect') {
      // Redirect action
      setTimeout(() => {
        if (option.value.startsWith('#')) {
          // Scroll to element
          const element = document.querySelector(option.value);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
          }
        } else if (option.value.startsWith('http')) {
          // External link
          window.open(option.value, '_blank');
        } else {
          // Internal page
          window.location.href = createPageUrl(option.value);
        }
      }, 500);
      return;
    }

    if (option.action_type === 'contact') {
      // WhatsApp contact
      setTimeout(() => {
        const whatsappNumber = globalSettings?.whatsapp_support_number;
        if (whatsappNumber) {
          const message = encodeURIComponent(`Olá! Vim através do chatbot do site e preciso de ajuda.`);
          window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        }
      }, 500);
      return;
    }

    if (option.action_type === 'start_flow') {
      // Start conversation flow
      const targetStep = option.value || 'welcome';
      const flow = chatbotFlows.find(f => f.step_name === targetStep && f.is_active);
      
      if (flow) {
        setLoading(true);
        setTimeout(async () => {
          await processFlowStep(flow);
          setLoading(false);
        }, 1000);
      }
      return;
    }

    // Default: look for next step in flows
    const currentFlow = chatbotFlows.find(f => 
      f.options?.some(opt => opt.value === option.value) && f.is_active
    );
    
    if (currentFlow) {
      const selectedOption = currentFlow.options.find(opt => opt.value === option.value);
      if (selectedOption?.next_step) {
        const nextFlow = chatbotFlows.find(f => 
          f.step_name === selectedOption.next_step && f.is_active
        );
        
        if (nextFlow) {
          setLoading(true);
          setTimeout(async () => {
            await processFlowStep(nextFlow, { selectedOption: option.value });
            setLoading(false);
          }, 1000);
        }
      }
    }
  };

  const processFlowStep = async (flow, context = {}) => {
    let botMessage = {
      sender: 'bot',
      text: flow.message_text,
      timestamp: Date.now()
    };

    // Show services if configured
    if (flow.show_services) {
      try {
        let services = await Service.filter({ 
          is_active: true, 
          show_in_homepage: true 
        }, 'order_index');

        // Apply filters if specified
        if (flow.service_filters) {
          if (flow.service_filters.platform) {
            services = services.filter(s => s.platform === flow.service_filters.platform);
          }
          if (flow.service_filters.service_type) {
            services = services.filter(s => s.service_type === flow.service_filters.service_type);
          }
        }

        botMessage.services = services.slice(0, 3); // Limit to 3 services
      } catch (error) {
        console.error("Failed to load services:", error);
      }
    }

    // Add options if available
    if (flow.options && flow.options.length > 0) {
      botMessage.options = flow.options;
    }

    setMessages(prev => [...prev, botMessage]);
    setCurrentStep(flow.step_name);
  };

  const handleServiceClick = (service) => {
    // Add user message
    const userMessage = { 
      sender: 'user', 
      text: `Interessado em: ${service.name}`, 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, userMessage]);

    // Redirect to service page or home with service pre-selected
    setTimeout(() => {
      const serviceUrl = createPageUrl(`Home?service=${service.id || service.service}&quantity=${service.default_quantity}`);
      window.location.href = serviceUrl;
    }, 500);
  };

  // Don't render if not ready, disabled, or not on allowed pages
  if (!isReady || !chatbotSettings?.is_enabled || !shouldShowOnCurrentPage()) {
    return null;
  }

  const buttonStyle = {
    background: `linear-gradient(135deg, ${chatbotSettings?.primary_color || '#3b82f6'}, ${chatbotSettings?.secondary_color || '#8b5cf6'})`
  };

  const headerStyle = {
    background: `linear-gradient(135deg, ${chatbotSettings?.primary_color || '#3b82f6'}, ${chatbotSettings?.secondary_color || '#8b5cf6'})`
  };

  const widgetVariants = {
    closed: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full h-14 w-auto px-6 flex items-center gap-2 shadow-2xl text-white transform hover:scale-105 transition-transform duration-300"
              style={buttonStyle}
              aria-label="Abrir assistente de vendas"
            >
              <Bot className="w-6 h-6" />
              <span className="font-semibold">Ajuda?</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={widgetVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed bottom-24 right-6 w-[calc(100%-48px)] max-w-sm h-[80vh] max-h-[640px] bg-gray-50 rounded-2xl shadow-2xl flex flex-col z-50 origin-bottom-right"
          >
            <CardHeader 
              className="flex flex-row items-center justify-between p-4 text-white rounded-t-2xl flex-shrink-0 min-h-[70px]"
              style={headerStyle}
            >
              <div className="flex-1 pr-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  {chatbotSettings?.widget_title || 'Assistente de Vendas'}
                </CardTitle>
                <CardDescription className="text-white/80 text-xs mt-1 leading-tight">
                  {chatbotSettings?.widget_subtitle || 'Vou te ajudar a encontrar o serviço perfeito!'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 flex-shrink-0">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <Message 
                    key={`${msg.timestamp}-${index}`}
                    msg={msg} 
                    onServiceClick={handleServiceClick}
                    onOptionClick={handleOptionClick}
                    settings={chatbotSettings}
                  />
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-gray-200 rounded-lg rounded-bl-none p-3">
                      <p className="text-sm">Digitando...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Footer */}
            {chatbotSettings?.show_powered_by && (
              <div className="p-2 bg-gray-100 text-center flex-shrink-0 rounded-b-2xl">
                <p className="text-xs text-gray-500">
                  Powered by <span className="font-semibold">InstaFLY</span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
