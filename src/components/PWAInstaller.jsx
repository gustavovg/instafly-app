import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Smartphone, X, MoreVertical, Share } from "lucide-react";

export default function PWAInstaller({ open, onOpenChange }) {
  const [platform, setPlatform] = useState(null); // 'ios', 'android', or null

  useEffect(() => {
    // Detect OS for showing correct instructions
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
    }
  }, []);

  const handleDismiss = () => {
    onOpenChange(false);
    // Mark as dismissed for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Instalar Aplicativo
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleDismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            Instale nosso app no seu celular para uma experiência ainda melhor e acesso rápido!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Como instalar:</h4>
            {platform === 'ios' && (
              <p className="text-sm text-gray-600">
                1. Toque no ícone de <strong>Compartilhar</strong> (<Share className="inline w-4 h-4" />) na barra do Safari.
                <br />
                2. Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
              </p>
            )}
            {platform === 'android' && (
              <p className="text-sm text-gray-600">
                1. Toque no ícone de menu (<MoreVertical className="inline w-4 h-4" />) no canto superior direito.
                <br />
                2. Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </p>
            )}
            {!platform && (
                 <p className="text-sm text-gray-600">
                    Use o menu do seu navegador e procure pela opção "Instalar aplicativo" ou "Adicionar à tela inicial".
                 </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleDismiss} className="w-full">
              Entendi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}