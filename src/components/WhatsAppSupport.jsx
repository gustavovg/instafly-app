import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const WhatsAppSupport = ({ settings }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const supportNumber = settings?.whatsapp_support_number;
  const supportMessage = settings?.whatsapp_chat_message || 'Olá, preciso de ajuda!';
  const isEnabled = settings?.whatsapp_support_enabled !== false;

  if (!supportNumber || !isEnabled) {
    return null;
  }

  const handleSupportClick = () => {
    setDialogOpen(true);
  };

  const handleConfirmClick = () => {
    const whatsappUrl = `https://wa.me/${supportNumber}?text=${encodeURIComponent(supportMessage)}`;
    window.open(whatsappUrl, '_blank');
    setDialogOpen(false);
  };

  const customPulseKeyframes = `
    @keyframes pulse-whatsapp {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      }
      70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
      }
    }
  `;

  return (
    <>
      <style>{customPulseKeyframes}</style>
      <motion.div 
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={handleSupportClick}
          className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 text-white shadow-lg transition-transform duration-300"
          style={{ animation: 'pulse-whatsapp 2s infinite' }}
          aria-label="Fale conosco no WhatsApp"
        >
          <MessageSquare className="w-7 h-7" />
        </Button>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-6 h-6 text-green-500" />
              Suporte via WhatsApp
            </DialogTitle>
            <DialogDescription>
              Você será redirecionado para o WhatsApp para conversar com nossa equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0 space-y-4">
            <Button 
              onClick={handleConfirmClick} 
              className="w-full text-lg py-6" 
              style={{ backgroundColor: settings?.primary_color || '#3b82f6' }}
            >
              Iniciar Conversa <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppSupport;