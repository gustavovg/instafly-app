import Layout from "./Layout.jsx";
import AdminLogin from "./AdminLogin";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "./Home";

import OrderTracking from "./OrderTracking";

import AdminDashboard from "./AdminDashboard";

import AdminOrders from "./AdminOrders";

import AdminSettings from "./AdminSettings";

import AdminServices from "./AdminServices";

import AdminEmailSettings from "./AdminEmailSettings";

import AdminUsers from "./AdminUsers";

import AdminWhatsAppTemplates from "./AdminWhatsAppTemplates";

import AdminCoupons from "./AdminCoupons";

import AdminTheme from "./AdminTheme";

import Affiliates from "./Affiliates";

import AdminAffiliates from "./AdminAffiliates";

import AffiliateLogin from "./AffiliateLogin";

import CustomerDashboard from "./CustomerDashboard";

import AdminWalletPayments from "./AdminWalletPayments";

import AdminSubscriptionPlans from "./AdminSubscriptionPlans";

import AdminCustomerSubscriptions from "./AdminCustomerSubscriptions";

import Subscriptions from "./Subscriptions";

import AdminMarketing from "./AdminMarketing";

import AdminTickets from "./AdminTickets";

import AdminTicketView from "./AdminTicketView";

import CustomerTickets from "./CustomerTickets";

import CustomerTicketView from "./CustomerTicketView";

import AdminFaqs from "./AdminFaqs";

import Faq from "./Faq";

import AdminDiagnostics from "./AdminDiagnostics";

import AdminApiManagement from "./AdminApiManagement";

import AdminWhiteLabel from "./AdminWhiteLabel";

import AdminServiceRatings from "./AdminServiceRatings";

import AdminDripFeed from "./AdminDripFeed";

import AdminApiDocumentation from "./AdminApiDocumentation";

import AdminWhiteLabelPersonalize from "./AdminWhiteLabelPersonalize";

import AdminWhiteLabelBilling from "./AdminWhiteLabelBilling";

import Instagram from "./Instagram";

import YouTube from "./YouTube";

import TikTok from "./TikTok";

import instagram from "./instagram";

import youtube from "./youtube";

import tiktok from "./tiktok";

import facebook from "./facebook";

import kwai from "./kwai";

import AdminChatbot from "./AdminChatbot";

import AdminPwaSettings from "./AdminPwaSettings";

import MigrationGuide from "./MigrationGuide";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AffiliateAuthProvider } from '@/contexts/AffiliateAuthContext';

const PAGES = {
    
    Home: Home,
    
    OrderTracking: OrderTracking,
    
    AdminLogin: AdminLogin,
    
    AdminDashboard: AdminDashboard,
    
    AdminOrders: AdminOrders,
    
    AdminSettings: AdminSettings,
    
    AdminServices: AdminServices,
    
    AdminEmailSettings: AdminEmailSettings,
    
    AdminUsers: AdminUsers,
    
    AdminWhatsAppTemplates: AdminWhatsAppTemplates,
    
    AdminCoupons: AdminCoupons,
    
    AdminTheme: AdminTheme,
    
    Affiliates: Affiliates,
    
    AdminAffiliates: AdminAffiliates,
    
    AffiliateLogin: AffiliateLogin,
    
    CustomerDashboard: CustomerDashboard,
    
    AdminWalletPayments: AdminWalletPayments,
    
    AdminSubscriptionPlans: AdminSubscriptionPlans,
    
    AdminCustomerSubscriptions: AdminCustomerSubscriptions,
    
    Subscriptions: Subscriptions,
    
    AdminMarketing: AdminMarketing,
    
    AdminTickets: AdminTickets,
    
    AdminTicketView: AdminTicketView,
    
    CustomerTickets: CustomerTickets,
    
    CustomerTicketView: CustomerTicketView,
    
    AdminFaqs: AdminFaqs,
    
    Faq: Faq,
    
    AdminDiagnostics: AdminDiagnostics,
    
    AdminApiManagement: AdminApiManagement,
    
    AdminWhiteLabel: AdminWhiteLabel,
    
    AdminServiceRatings: AdminServiceRatings,
    
    AdminDripFeed: AdminDripFeed,
    
    AdminApiDocumentation: AdminApiDocumentation,
    
    AdminWhiteLabelPersonalize: AdminWhiteLabelPersonalize,
    
    AdminWhiteLabelBilling: AdminWhiteLabelBilling,
    
    Instagram: Instagram,
    
    YouTube: YouTube,
    
    TikTok: TikTok,
    
    instagram: instagram,
    
    youtube: youtube,
    
    tiktok: tiktok,
    
    facebook: facebook,
    
    kwai: kwai,
    
    AdminChatbot: AdminChatbot,
    
    AdminPwaSettings: AdminPwaSettings,
    
    MigrationGuide: MigrationGuide,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/OrderTracking" element={<OrderTracking />} />
                
                {/* Rota de login do admin */}
                <Route path="/AdminLogin" element={<AdminLogin />} />
                
                {/* Rotas protegidas do admin */}
                <Route path="/AdminDashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                
                <Route path="/AdminOrders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                
                <Route path="/AdminSettings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                
                <Route path="/AdminServices" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
                
                <Route path="/AdminEmailSettings" element={<ProtectedRoute><AdminEmailSettings /></ProtectedRoute>} />
                
                <Route path="/AdminUsers" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
                
                <Route path="/AdminWhatsAppTemplates" element={<ProtectedRoute><AdminWhatsAppTemplates /></ProtectedRoute>} />
                
                <Route path="/AdminCoupons" element={<ProtectedRoute><AdminCoupons /></ProtectedRoute>} />
                
                <Route path="/AdminTheme" element={<ProtectedRoute><AdminTheme /></ProtectedRoute>} />
                
                <Route path="/Affiliates" element={<Affiliates />} />
                
                <Route path="/AdminAffiliates" element={<ProtectedRoute><AdminAffiliates /></ProtectedRoute>} />
                
                <Route path="/AffiliateLogin" element={<AffiliateLogin />} />
                
                <Route path="/CustomerDashboard" element={<CustomerDashboard />} />
                
                <Route path="/AdminWalletPayments" element={<ProtectedRoute><AdminWalletPayments /></ProtectedRoute>} />
                
                <Route path="/AdminSubscriptionPlans" element={<ProtectedRoute><AdminSubscriptionPlans /></ProtectedRoute>} />
                
                <Route path="/AdminCustomerSubscriptions" element={<ProtectedRoute><AdminCustomerSubscriptions /></ProtectedRoute>} />
                
                <Route path="/Subscriptions" element={<Subscriptions />} />
                
                <Route path="/AdminMarketing" element={<ProtectedRoute><AdminMarketing /></ProtectedRoute>} />
                
                <Route path="/AdminTickets" element={<ProtectedRoute><AdminTickets /></ProtectedRoute>} />
                
                <Route path="/AdminTicketView" element={<ProtectedRoute><AdminTicketView /></ProtectedRoute>} />
                
                <Route path="/CustomerTickets" element={<CustomerTickets />} />
                
                <Route path="/CustomerTicketView" element={<CustomerTicketView />} />
                
                <Route path="/AdminFaqs" element={<ProtectedRoute><AdminFaqs /></ProtectedRoute>} />
                
                <Route path="/Faq" element={<Faq />} />
                
                <Route path="/AdminDiagnostics" element={<ProtectedRoute><AdminDiagnostics /></ProtectedRoute>} />
                
                <Route path="/AdminApiManagement" element={<ProtectedRoute><AdminApiManagement /></ProtectedRoute>} />
                
                <Route path="/AdminWhiteLabel" element={<ProtectedRoute><AdminWhiteLabel /></ProtectedRoute>} />
                
                <Route path="/AdminServiceRatings" element={<ProtectedRoute><AdminServiceRatings /></ProtectedRoute>} />
                
                <Route path="/AdminDripFeed" element={<ProtectedRoute><AdminDripFeed /></ProtectedRoute>} />
                
                <Route path="/AdminApiDocumentation" element={<ProtectedRoute><AdminApiDocumentation /></ProtectedRoute>} />
                
                <Route path="/AdminWhiteLabelPersonalize" element={<ProtectedRoute><AdminWhiteLabelPersonalize /></ProtectedRoute>} />
                
                <Route path="/AdminWhiteLabelBilling" element={<ProtectedRoute><AdminWhiteLabelBilling /></ProtectedRoute>} />
                
                <Route path="/Instagram" element={<Instagram />} />
                
                <Route path="/YouTube" element={<YouTube />} />
                
                <Route path="/TikTok" element={<TikTok />} />
                
                <Route path="/instagram" element={<instagram />} />
                
                <Route path="/youtube" element={<youtube />} />
                
                <Route path="/tiktok" element={<tiktok />} />
                
                <Route path="/facebook" element={<facebook />} />
                
                <Route path="/kwai" element={<kwai />} />
                
                <Route path="/AdminChatbot" element={<ProtectedRoute><AdminChatbot /></ProtectedRoute>} />
                
                <Route path="/AdminPwaSettings" element={<ProtectedRoute><AdminPwaSettings /></ProtectedRoute>} />
                
                <Route path="/MigrationGuide" element={<MigrationGuide />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <AuthProvider>
            <AffiliateAuthProvider>
                <Router>
                    <PagesContent />
                </Router>
            </AffiliateAuthProvider>
        </AuthProvider>
    );
}