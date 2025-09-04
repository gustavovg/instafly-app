
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Facebook, Youtube, Twitter, Music, Linkedin, X } from 'lucide-react';

const platformIcons = {
  Instagram: Instagram,
  Facebook: Facebook,
  YouTube: Youtube,
  Twitter: Twitter,
  TikTok: Music,
  LinkedIn: Linkedin
};

const platformColors = {
  Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  Facebook: 'bg-blue-600',
  YouTube: 'bg-red-600',
  Twitter: 'bg-sky-500',
  TikTok: 'bg-black',
  LinkedIn: 'bg-blue-700'
};

// Lista de nomes brasileiros realistas
const brazilianNames = [
  'Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Pereira', 'Fernanda Costa',
  'Ricardo Lima', 'Juliana Alves', 'Pedro Rodrigues', 'Camila Ferreira', 'Lucas Martins',
  'Beatriz Souza', 'Gabriel Carvalho', 'Amanda Ribeiro', 'Bruno Araújo', 'Larissa Mendes',
  'Felipe Barbosa', 'Isabela Dias', 'Thiago Nascimento', 'Letícia Cardoso', 'Diego Moura',
  'Natália Freitas', 'Mateus Castro', 'Vanessa Ramos', 'André Vieira', 'Priscila Cunha',
  'Rodrigo Campos', 'Daniela Monteiro', 'Gustavo Reis', 'Carolina Pinto', 'Eduardo Gomes',
  'Mariana Teixeira', 'Victor Hugo', 'Renata Macedo', 'Alexandre Rocha', 'Patrícia Lopes',
  'Marcelo Silva', 'Tatiana Correia', 'Rafael Nunes', 'Adriana Fonseca', 'Leonardo Torres'
];

// Serviços e quantidades realistas
const mockPurchases = [
  { service: 'seguidores', platform: 'Instagram', quantities: [500, 1000, 1500, 2000, 2500, 3000, 5000] },
  { service: 'curtidas', platform: 'Instagram', quantities: [100, 250, 500, 750, 1000, 1500, 2000] },
  { service: 'visualizações', platform: 'Instagram', quantities: [1000, 2500, 5000, 10000, 15000, 25000] },
  { service: 'seguidores', platform: 'Facebook', quantities: [250, 500, 1000, 1500, 2000, 3000] },
  { service: 'curtidas', platform: 'Facebook', quantities: [50, 100, 250, 500, 750, 1000] },
  { service: 'visualizações', platform: 'YouTube', quantities: [1000, 2500, 5000, 10000, 25000, 50000] },
  { service: 'seguidores', platform: 'TikTok', quantities: [500, 1000, 2000, 3000, 5000] },
  { service: 'curtidas', platform: 'TikTok', quantities: [100, 250, 500, 1000, 2000, 3000] },
  { service: 'seguidores', platform: 'Twitter', quantities: [250, 500, 1000, 2000, 3000] },
  { service: 'conexões', platform: 'LinkedIn', quantities: [100, 250, 500, 1000] }
];

const timeTexts = ['Agora', '1 min', '2 min', '3 min', '5 min', '8 min', '10 min', '15 min'];

export default function SocialProofNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [nextId, setNextId] = useState(1);

  const generateRandomNotification = () => {
    const randomName = brazilianNames[Math.floor(Math.random() * brazilianNames.length)];
    const randomPurchase = mockPurchases[Math.floor(Math.random() * mockPurchases.length)];
    const randomQuantity = randomPurchase.quantities[Math.floor(Math.random() * randomPurchase.quantities.length)];
    const randomTime = timeTexts[Math.floor(Math.random() * timeTexts.length)];
    
    const PlatformIcon = platformIcons[randomPurchase.platform];
    
    return {
      id: nextId,
      name: randomName,
      service: randomPurchase.service,
      platform: randomPurchase.platform,
      quantity: randomQuantity,
      time: randomTime,
      icon: PlatformIcon,
      color: platformColors[randomPurchase.platform]
    };
  };

  const addNotification = () => {
    const newNotification = generateRandomNotification();
    setNotifications(prev => [newNotification, ...prev.slice(0, 2)]); // Keep max 3 notifications
    setNextId(prev => prev + 1);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Show first notification after 3 seconds
    const firstTimeout = setTimeout(() => {
      addNotification();
    }, 3000);

    // Then show notifications every 8-15 seconds randomly
    const interval = setInterval(() => {
      const randomDelay = Math.random() * 7000 + 8000; // 8-15 seconds
      setTimeout(() => {
        addNotification();
      }, randomDelay);
    }, 15000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  const formatQuantity = (quantity) => {
    return quantity.toLocaleString('pt-BR');
  };

  const getServiceText = (service, quantity) => {
    const texts = {
      'seguidores': `${formatQuantity(quantity)} seguidores`,
      'curtidas': `${formatQuantity(quantity)} curtidas`,
      'visualizações': `${formatQuantity(quantity)} visualizações`,
      'conexões': `${formatQuantity(quantity)} conexões`
    };
    return texts[service] || `${formatQuantity(quantity)} ${service}`;
  };

  return (
    <div className="fixed top-24 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-sm pointer-events-auto"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${notification.color} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {notification.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{notification.time}</span>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-tight">
                    Comprou <span className="font-medium text-gray-900">
                      {getServiceText(notification.service, notification.quantity)}
                    </span> para seu {notification.platform}
                  </p>
                </div>
              </div>
              
              {/* Subtle pulse animation */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse"></div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
