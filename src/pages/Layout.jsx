
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from '@/api/entities';
import { WhiteLabelSite } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from 'sonner';
import PWAManifest from '../components/PWAManifest';
import WhatsAppSupport from '../components/WhatsAppSupport';
import SalesChatbot from '../components/SalesChatbot';
import { useAuth } from '@/contexts/AuthContext';

import {
  Menu, X, Download, LayoutDashboard, Package, BarChart3, TrendingUp, 
  Users as UsersIcon, DollarSign, UserPlus, CreditCard, Crown, Star, 
  TicketIcon, HelpCircle as HelpIcon, MessageSquare, MessagesSquare, Key, 
  Globe, Bell, Smartphone, Settings as SettingsIcon, Stethoscope, Sparkles,
  LogOut
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [settings, setSettings] = useState(null);
  const [whiteLabelSettings, setWhiteLabelSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Hook de autenticação (só usado em páginas admin)
  const auth = currentPageName?.startsWith('Admin') ? useAuth() : null;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const testDomain = urlParams.get('test_domain');
        const hostname = testDomain || window.location.hostname;

        const mainDomain = process.env.REACT_APP_MAIN_DOMAIN || "localhost";

        if (hostname !== mainDomain && hostname !== "localhost") {
          const sites = await WhiteLabelSite.list();
          const siteConfig = sites.find(s => s.site_domain === hostname);
          if (siteConfig) {
            setWhiteLabelSettings(siteConfig);
          }
        }

        const settingsResult = await Settings.list();
        if (settingsResult.length > 0) {
          setSettings(settingsResult[0]);
        }
      } catch (error) {
        console.log('Error loading settings', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [currentPageName]);

  const handleMobileMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handlePwaModalOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPwaModal(true);
  };

  const effectiveSettings = whiteLabelSettings ? {
    ...settings,
    brand_name: whiteLabelSettings.brand_name || (settings ? settings.brand_name : 'InstaFLY'),
    logo_url: whiteLabelSettings.logo_url || (settings ? settings.logo_url : null),
    primary_color: whiteLabelSettings.primary_color || (settings ? settings.primary_color : '#8b5cf6'),
    secondary_color: whiteLabelSettings.secondary_color || (settings ? settings.secondary_color : '#ec4899'),
    whatsapp_support_number: whiteLabelSettings.whatsapp_number || (settings ? settings.whatsapp_support_number : null)
  } : (settings || {});

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

  const isAdminPage = currentPageName?.startsWith('Admin');
  const isAdminLoginPage = currentPageName === 'AdminLogin';
  const isAffiliateLoginPage = currentPageName === 'AffiliateLogin';
  const isPublicRoute = ['Home', 'Faq', 'OrderTracking', 'Affiliates', 'Subscriptions', 'instagram', 'youtube', 'tiktok', 'facebook', 'kwai', 'MigrationGuide', 'AffiliateLogin'].includes(currentPageName);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster />
      <PWAManifest settings={effectiveSettings} />

      {isAdminPage && !isAdminLoginPage ? (
        <div className="flex h-screen bg-gray-100">
          <aside className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                {sidebarOpen && (
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Admin Panel
                  </span>
                )}
              </div>
            </div>

            <nav className="flex-1 pt-4">
              <div className="space-y-1 px-3">
                <Link to={createPageUrl("AdminDashboard")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminDashboard' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Dashboard'}
                </Link>
                <Link to={createPageUrl("AdminOrders")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminOrders' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Package className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Pedidos'}
                </Link>
                <Link to={createPageUrl("AdminDripFeed")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminDripFeed' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <BarChart3 className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Drip-Feed'}
                </Link>
                <Link to={createPageUrl("AdminServices")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminServices' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <TrendingUp className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Serviços'}
                </Link>
                <Link to={createPageUrl("AdminUsers")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminUsers' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <UsersIcon className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Usuários'}
                </Link>
                <Link to={createPageUrl("AdminCoupons")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminCoupons' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <DollarSign className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Cupons'}
                </Link>
                <Link to={createPageUrl("AdminAffiliates")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminAffiliates' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <UserPlus className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Afiliados'}
                </Link>
                <Link to={createPageUrl("AdminWalletPayments")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminWalletPayments' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <CreditCard className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Carteira'}
                </Link>
                <Link to={createPageUrl("AdminSubscriptionPlans")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminSubscriptionPlans' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Crown className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Planos'}
                </Link>
                <Link to={createPageUrl("AdminCustomerSubscriptions")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminCustomerSubscriptions' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Star className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Assinantes'}
                </Link>
                <Link to={createPageUrl("AdminTickets")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminTickets' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <TicketIcon className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Tickets'}
                </Link>
                <Link to={createPageUrl("AdminFaqs")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminFaqs' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <HelpIcon className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'FAQ'}
                </Link>

                {/* Seção de Comunicação */}
                <div className="pt-4 pb-2">
                  {sidebarOpen && <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Comunicação</div>}
                </div>

                <Link to={createPageUrl("AdminChatbot")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminChatbot' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <MessageSquare className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Chatbot'}
                </Link>
                <Link to={createPageUrl("AdminWhatsAppTemplates")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminWhatsAppTemplates' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <MessagesSquare className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Templates WhatsApp'}
                </Link>

                {/* Seção de Recursos Avançados */}
                <div className="pt-4 pb-2">
                  {sidebarOpen && <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recursos Avançados</div>}
                </div>

                <Link to={createPageUrl("AdminApiManagement")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminApiManagement' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Key className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'API Revendedores'}
                </Link>
                <Link to={createPageUrl("AdminWhiteLabel")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminWhiteLabel' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Globe className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'White-Label'}
                </Link>
                <Link to={createPageUrl("AdminServiceRatings")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminServiceRatings' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Star className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Avaliações'}
                </Link>

                <Link to={createPageUrl("AdminMarketing")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminMarketing' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Bell className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Marketing'}
                </Link>

                <Link to={createPageUrl("AdminPwaSettings")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminPwaSettings' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Smartphone className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Aplicativo PWA'}
                </Link>

                <Link to={createPageUrl("AdminSettings")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminSettings' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <SettingsIcon className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Configurações'}
                </Link>
                <Link to={createPageUrl("AdminDiagnostics")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'AdminDiagnostics' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Stethoscope className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Corrigir Problemas'}
                </Link>
                
                <Link to={createPageUrl("MigrationGuide")} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPageName === 'MigrationGuide' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Download className="w-5 h-5 mr-3" />
                  {sidebarOpen && 'Guia de Migração'}
                </Link>
              </div>
            </nav>

            <div className="p-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full justify-center"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </aside>

          <main className="flex-1 overflow-auto">
            <header className="bg-white shadow-sm p-6 border-b">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                  {currentPageName?.replace('Admin', '')}
                </h1>
                <div className="flex items-center space-x-4">
                  <Link to={createPageUrl("Home")} className="text-purple-600 hover:text-purple-800 transition">
                    Ver Site
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                          A
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Admin</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => auth?.logout()}
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                      title="Sair do sistema"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </header>
            <div className="p-6">{children}</div>
          </main>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
              <Link to={createPageUrl("Home")} className="flex items-center space-x-3">
                {effectiveSettings?.logo_url ? (
                  <img src={effectiveSettings.logo_url} alt="Logo" className="h-12 object-contain" />
                ) : (
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg"
                      style={effectiveSettings?.primary_color && effectiveSettings?.secondary_color ? { background: `linear-gradient(to right, ${effectiveSettings.primary_color}, ${effectiveSettings.secondary_color})` } : {}}
                    >
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <span
                      className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                      style={effectiveSettings?.primary_color && effectiveSettings?.secondary_color ? { backgroundImage: `linear-gradient(to right, ${effectiveSettings.primary_color}, ${effectiveSettings.secondary_color})` } : {}}
                    >
                      {effectiveSettings?.brand_name || 'InstaFLY'}
                    </span>
                  </div>
                )}
              </Link>

              <nav className="hidden md:flex items-center space-x-6">
                <Link to={createPageUrl("Home")} className="text-gray-600 hover:text-purple-600 transition">
                  Início
                </Link>
                <Link to={createPageUrl("Subscriptions")} className="text-gray-600 hover:text-purple-600 transition font-semibold">
                  Planos
                </Link>
                <Link to={createPageUrl("Faq")} className="text-gray-600 hover:text-purple-600 transition">
                  Ajuda
                </Link>
                <Link to={createPageUrl("Affiliates")} className="text-gray-600 hover:text-purple-600 transition">
                  Afiliados
                </Link>
                <Link to={createPageUrl("OrderTracking")} className="text-gray-600 hover:text-purple-600 transition">
                  Rastrear Pedido
                </Link>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleMobileMenuToggle}
                  className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                  type="button"
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>

                <button
                  onClick={handlePwaModalOpen}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <Download className="w-4 h-4" />
                  Aplicativo
                </button>

                <Link 
                  to={createPageUrl("AdminDashboard")}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Painel Admin</span>
                </Link>
              </div>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b shadow-lg">
                <div className="px-4 py-6 space-y-4">
                  <Link to={createPageUrl("Home")} className="block text-gray-700 hover:text-purple-600 transition-colors">
                    Início
                  </Link>
                  <Link to={createPageUrl("OrderTracking")} className="block text-gray-700 hover:text-purple-600 transition-colors">
                    Rastrear Pedido
                  </Link>
                  <Link to={createPageUrl("Faq")} className="block text-gray-700 hover:text-purple-600 transition-colors">
                    FAQ
                  </Link>
                  <Link to={createPageUrl("Affiliates")} className="block text-gray-700 hover:text-purple-600 transition-colors">
                    Programa de Afiliados
                  </Link>
                  <Link to={createPageUrl("Subscriptions")} className="block text-gray-700 hover:text-purple-600 transition-colors">
                    Planos
                  </Link>
                  <div className="pt-4 border-t">
                    <button
                      onClick={handlePwaModalOpen}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      type="button"
                    >
                      <Download className="w-4 h-4" />
                      Baixar Aplicativo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </header>

          <main className="flex-1">
            {children}
          </main>

          {!isPublicRoute && (
            <footer className="bg-gray-900 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-lg">{effectiveSettings?.brand_name || 'InstaFLY'}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {effectiveSettings?.site_description || 'Impulsione suas redes sociais com nossos serviços de alta qualidade.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Serviços</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><Link to={createPageUrl("instagram")} className="hover:text-white transition-colors">Instagram</Link></li>
                      <li><Link to={createPageUrl("youtube")} className="hover:text-white transition-colors">YouTube</Link></li>
                      <li><Link to={createPageUrl("tiktok")} className="hover:text-white transition-colors">TikTok</Link></li>
                      <li><Link to={createPageUrl("facebook")} className="hover:text-white transition-colors">Facebook</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Suporte</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><Link to={createPageUrl("OrderTracking")} className="hover:text-white transition-colors">Rastrear Pedido</Link></li>
                      <li><Link to={createPageUrl("Faq")} className="hover:text-white transition-colors">FAQ</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Empresa</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><Link to={createPageUrl("Affiliates")} className="hover:text-white transition-colors">Programa de Afiliados</Link></li>
                      <li><Link to={createPageUrl("Subscriptions")} className="hover:text-white transition-colors">Planos</Link></li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                  <p>&copy; 2024 {effectiveSettings?.brand_name || 'InstaFLY'}. Todos os direitos reservados.</p>
                </div>
              </div>
            </footer>
          )}

          {isPublicRoute && <WhatsAppSupport settings={effectiveSettings} />}
          {isPublicRoute && <SalesChatbot settings={effectiveSettings} currentPageName={currentPageName} />}

          <Dialog open={showPwaModal} onOpenChange={setShowPwaModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Instalar Aplicativo
                </DialogTitle>
                <DialogDescription>
                  Instale nosso app no seu celular para uma experiência ainda melhor e acesso rápido!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <h4 className="font-medium mb-2">Como instalar:</h4>
                  <p>Use o menu do seu navegador e procure pela opção "Instalar aplicativo" ou "Adicionar à tela inicial".</p>
                </div>
                <Button onClick={() => setShowPwaModal(false)} className="w-full">
                  Entendi
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
