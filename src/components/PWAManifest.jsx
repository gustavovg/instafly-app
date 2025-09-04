import React, { useEffect } from 'react';

const PWAManifest = ({ settings }) => {
  useEffect(() => {
    // Usar configurações específicas do PWA se disponíveis, senão usar configurações gerais
    const appName = settings?.pwa_app_name || settings?.brand_name || 'InstaFLY';
    const shortName = settings?.pwa_short_name || settings?.brand_name || 'InstaFLY';
    const description = settings?.pwa_description || settings?.meta_description || `${appName} - Impulsione suas redes sociais de forma rápida e segura`;
    const iconUrl = settings?.pwa_icon_url || settings?.logo_url;
    const icon192 = settings?.pwa_icon_192 || iconUrl;
    const icon512 = settings?.pwa_icon_512 || iconUrl;
    const themeColor = settings?.pwa_theme_color || settings?.primary_color || '#8b5cf6';
    const backgroundColor = settings?.pwa_background_color || '#ffffff';
    const displayMode = settings?.pwa_display_mode || 'standalone';
    const orientation = settings?.pwa_orientation || 'portrait-primary';
    const startUrl = settings?.pwa_start_url || '/';
    const scope = settings?.pwa_scope || '/';
    const categories = settings?.pwa_categories ? settings.pwa_categories.split(',').map(c => c.trim()) : ['social', 'business', 'marketing'];
    
    const manifest = {
      name: appName,
      short_name: shortName,
      description: description,
      start_url: startUrl,
      scope: scope,
      display: displayMode,
      orientation: orientation,
      background_color: backgroundColor,
      theme_color: themeColor,
      icons: [
        {
          src: icon192 || '/favicon.ico',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: icon512 || '/favicon.ico',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      categories: categories,
      lang: 'pt-BR',
      dir: 'ltr'
    };

    // Remove existing manifest link if it exists
    const existingLink = document.querySelector('link[rel="manifest"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Create new manifest link
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = `data:application/manifest+json;base64,${btoa(JSON.stringify(manifest))}`;
    document.head.appendChild(link);

    // Update theme color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = themeColor;

    // Update app title
    document.title = settings?.site_title || appName;

    // Update favicon
    if (iconUrl) {
      let faviconLink = document.querySelector('link[rel="icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = iconUrl;
    }

    // Update apple touch icon
    if (iconUrl) {
      let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleTouchIcon);
      }
      appleTouchIcon.href = iconUrl;
    }

    // Cleanup function
    return () => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.remove();
      }
    };
  }, [settings]);

  return null;
};

export default PWAManifest;