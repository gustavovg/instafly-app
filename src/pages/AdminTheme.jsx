import React, { useState, useEffect } from "react";
import { Settings } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Upload, Eye, Sun, Moon, Monitor, Sparkles } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function AdminTheme() {
  const [settings, setSettings] = useState({
    theme_mode: "light",
    primary_color: "#3b82f6",
    secondary_color: "#8b5cf6",
    logo_url: "",
    favicon_url: "",
    brand_name: "SocialBoost",
    site_title: "PainelSMM Pro"
  });
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, favicon: false });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await Settings.list();
      if (data.length > 0) {
        setSettings(prev => ({ ...prev, ...data[0] }));
        setSettingsId(data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setAlert({ type: "error", message: "Erro ao carregar configurações." });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      if (settingsId) {
        await Settings.update(settingsId, settings);
      } else {
        const newSettings = await Settings.create(settings);
        setSettingsId(newSettings.id);
      }
      setAlert({ type: "success", message: "Tema salvo com sucesso! Recarregue a página para ver as mudanças." });
      
      // Apply changes immediately to document
      applyThemeChanges();
      
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
      setAlert({ type: "error", message: "Erro ao salvar configurações do tema." });
    } finally {
      setSaving(false);
    }
  };

  const applyThemeChanges = () => {
    const root = document.documentElement;
    
    // Update CSS custom properties
    root.style.setProperty('--primary-color', settings.primary_color);
    root.style.setProperty('--secondary-color', settings.secondary_color);
    
    // Update favicon if provided
    if (settings.favicon_url) {
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = settings.favicon_url;
    }
    
    // Update page title
    if (settings.site_title) {
      document.title = settings.site_title;
    }
  };

  const handleFileUpload = async (file, type) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    setAlert(null);
    
    try {
      const { file_url } = await UploadFile({ file });
      
      if (type === 'logo') {
        setSettings(prev => ({ ...prev, logo_url: file_url }));
      } else if (type === 'favicon') {
        setSettings(prev => ({ ...prev, favicon_url: file_url }));
      }
      
      setAlert({ type: "success", message: `${type === 'logo' ? 'Logo' : 'Favicon'} enviado com sucesso!` });
    } catch (error) {
      console.error(`Erro ao enviar ${type}:`, error);
      setAlert({ type: "error", message: `Erro ao enviar ${type === 'logo' ? 'logo' : 'favicon'}.` });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const previewColors = [
    { name: "Azul Padrão", primary: "#3b82f6", secondary: "#8b5cf6" },
    { name: "Verde Esmeralda", primary: "#10b981", secondary: "#06d6a0" },
    { name: "Roxo Vibrante", primary: "#8b5cf6", secondary: "#ec4899" },
    { name: "Laranja Energia", primary: "#f59e0b", secondary: "#ef4444" },
    { name: "Rosa Moderno", primary: "#ec4899", secondary: "#8b5cf6" },
    { name: "Azul Oceano", primary: "#0ea5e9", secondary: "#06b6d4" }
  ];

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Palette className="w-8 h-8 text-purple-600" />
            Personalizador Visual
          </h1>
          <p className="text-gray-600 mt-2">Customize a aparência do seu site e painel administrativo</p>
        </div>

        {alert && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Marca
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualizar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Modo do Tema</CardTitle>
                <CardDescription>Escolha entre tema claro, escuro ou automático</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${settings.theme_mode === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSettings({...settings, theme_mode: 'light'})}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Sun className="w-6 h-6 text-yellow-500" />
                      <span className="font-semibold">Claro</span>
                    </div>
                    <div className="bg-white p-3 rounded border shadow-sm">
                      <div className="h-2 bg-blue-500 rounded mb-2"></div>
                      <div className="h-1 bg-gray-300 rounded mb-1"></div>
                      <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${settings.theme_mode === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSettings({...settings, theme_mode: 'dark'})}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Moon className="w-6 h-6 text-purple-500" />
                      <span className="font-semibold">Escuro</span>
                    </div>
                    <div className="bg-gray-800 p-3 rounded border shadow-sm">
                      <div className="h-2 bg-blue-400 rounded mb-2"></div>
                      <div className="h-1 bg-gray-600 rounded mb-1"></div>
                      <div className="h-1 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${settings.theme_mode === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSettings({...settings, theme_mode: 'auto'})}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Monitor className="w-6 h-6 text-green-500" />
                      <span className="font-semibold">Automático</span>
                    </div>
                    <div className="bg-gradient-to-r from-white to-gray-800 p-3 rounded border shadow-sm">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded mb-2"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-600 rounded mb-1"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paleta de Cores</CardTitle>
                <CardDescription>Personalize as cores principais do seu site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.primary_color}
                        onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={settings.secondary_color}
                        onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.secondary_color}
                        onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                        placeholder="#8b5cf6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Paletas Predefinidas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                    {previewColors.map((palette) => (
                      <div 
                        key={palette.name}
                        className="p-3 rounded-lg border-2 cursor-pointer hover:border-gray-400 transition-all"
                        onClick={() => setSettings({...settings, primary_color: palette.primary, secondary_color: palette.secondary})}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: palette.primary }}
                          ></div>
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: palette.secondary }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{palette.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Identidade da Marca</CardTitle>
                  <CardDescription>Configure o nome e título do seu site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="brand_name">Nome da Marca</Label>
                    <Input
                      id="brand_name"
                      value={settings.brand_name}
                      onChange={(e) => setSettings({...settings, brand_name: e.target.value})}
                      placeholder="SocialBoost"
                    />
                  </div>

                  <div>
                    <Label htmlFor="site_title">Título do Site</Label>
                    <Input
                      id="site_title"
                      value={settings.site_title}
                      onChange={(e) => setSettings({...settings, site_title: e.target.value})}
                      placeholder="PainelSMM Pro"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo e Favicon</CardTitle>
                  <CardDescription>Faça upload dos arquivos da sua marca</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Logo Principal</Label>
                    <div className="mt-2 space-y-3">
                      {settings.logo_url && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img src={settings.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                          <span className="text-sm text-gray-600">Logo atual</span>
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'logo')}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('logo-upload').click()}
                          disabled={uploading.logo}
                          className="w-full"
                        >
                          {uploading.logo ? "Enviando..." : <><Upload className="w-4 h-4 mr-2" /> Enviar Logo</>}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Favicon (16x16 ou 32x32px)</Label>
                    <div className="mt-2 space-y-3">
                      {settings.favicon_url && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img src={settings.favicon_url} alt="Favicon" className="w-8 h-8 object-contain" />
                          <span className="text-sm text-gray-600">Favicon atual</span>
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'favicon')}
                          className="hidden"
                          id="favicon-upload"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('favicon-upload').click()}
                          disabled={uploading.favicon}
                          className="w-full"
                        >
                          {uploading.favicon ? "Enviando..." : <><Upload className="w-4 h-4 mr-2" /> Enviar Favicon</>}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
                <CardDescription>Veja como ficará seu site com as configurações atuais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-white">
                  <div 
                    className="h-16 rounded-lg mb-4 flex items-center px-6"
                    style={{ 
                      background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` 
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {settings.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="text-xl font-bold text-white">
                        {settings.brand_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Serviços Populares</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div 
                          className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                          style={{ backgroundColor: settings.primary_color }}
                        >
                          <span className="text-white font-bold">1K</span>
                        </div>
                        <h4 className="font-semibold mb-2">Seguidores Instagram</h4>
                        <p className="text-2xl font-bold" style={{ color: settings.primary_color }}>
                          R$ 59,90
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div 
                          className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                          style={{ backgroundColor: settings.secondary_color }}
                        >
                          <span className="text-white font-bold">500</span>
                        </div>
                        <h4 className="font-semibold mb-2">Curtidas Instagram</h4>
                        <p className="text-2xl font-bold" style={{ color: settings.secondary_color }}>
                          R$ 24,90
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        style={{ 
                          background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})`,
                          border: 'none'
                        }}
                        className="text-white"
                      >
                        Comprar Agora
                      </Button>
                      <Button variant="outline" style={{ borderColor: settings.primary_color, color: settings.primary_color }}>
                        Ver Mais
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}