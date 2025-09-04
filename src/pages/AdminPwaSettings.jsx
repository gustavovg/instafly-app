import React, { useState, useEffect } from 'react';
import { Settings } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  Settings as SettingsIcon, 
  Image as ImageIcon, 
  Palette,
  Monitor,
  Save,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminPwaSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    pwa_app_name: '',
    pwa_short_name: '',
    pwa_description: '',
    pwa_icon_url: '',
    pwa_icon_192: '',
    pwa_icon_512: '',
    pwa_theme_color: '#8b5cf6',
    pwa_background_color: '#ffffff',
    pwa_display_mode: 'standalone',
    pwa_orientation: 'portrait-primary',
    pwa_start_url: '/',
    pwa_scope: '/',
    pwa_categories: 'social,business,marketing'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsList = await Settings.list();
      const currentSettings = settingsList.length > 0 ? settingsList[0] : {};
      setSettings(currentSettings);
      
      // Preencher formulário com dados existentes ou valores padrão
      setFormData({
        pwa_app_name: currentSettings.pwa_app_name || currentSettings.brand_name || 'InstaFLY',
        pwa_short_name: currentSettings.pwa_short_name || currentSettings.brand_name || 'InstaFLY',
        pwa_description: currentSettings.pwa_description || 'Impulsione suas redes sociais de forma rápida e segura',
        pwa_icon_url: currentSettings.pwa_icon_url || currentSettings.logo_url || '',
        pwa_icon_192: currentSettings.pwa_icon_192 || currentSettings.logo_url || '',
        pwa_icon_512: currentSettings.pwa_icon_512 || currentSettings.logo_url || '',
        pwa_theme_color: currentSettings.pwa_theme_color || currentSettings.primary_color || '#8b5cf6',
        pwa_background_color: currentSettings.pwa_background_color || '#ffffff',
        pwa_display_mode: currentSettings.pwa_display_mode || 'standalone',
        pwa_orientation: currentSettings.pwa_orientation || 'portrait-primary',
        pwa_start_url: currentSettings.pwa_start_url || '/',
        pwa_scope: currentSettings.pwa_scope || '/',
        pwa_categories: currentSettings.pwa_categories || 'social,business,marketing'
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setAlert({ type: 'error', message: 'Erro ao carregar configurações.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    
    try {
      if (settings?.id) {
        await Settings.update(settings.id, formData);
      } else {
        await Settings.create(formData);
      }
      
      setAlert({ type: 'success', message: 'Configurações do aplicativo atualizadas com sucesso!' });
      await loadSettings(); // Recarregar para pegar os dados atualizados
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setAlert({ type: 'error', message: 'Erro ao salvar configurações.' });
    } finally {
      setSaving(false);
    }
  };

  const generateManifest = () => {
    return {
      name: formData.pwa_app_name,
      short_name: formData.pwa_short_name,
      description: formData.pwa_description,
      start_url: formData.pwa_start_url,
      scope: formData.pwa_scope,
      display: formData.pwa_display_mode,
      orientation: formData.pwa_orientation,
      background_color: formData.pwa_background_color,
      theme_color: formData.pwa_theme_color,
      categories: formData.pwa_categories.split(',').map(c => c.trim()),
      icons: [
        {
          src: formData.pwa_icon_192 || formData.pwa_icon_url,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: formData.pwa_icon_512 || formData.pwa_icon_url,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Smartphone className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configurações do Aplicativo PWA</h1>
            <p className="text-gray-600">Configure como seu site aparecerá quando instalado como aplicativo</p>
          </div>
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulário de Configurações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="app-name">Nome do Aplicativo</Label>
                <Input
                  id="app-name"
                  value={formData.pwa_app_name}
                  onChange={(e) => handleInputChange('pwa_app_name', e.target.value)}
                  placeholder="Nome completo do aplicativo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nome que aparece na tela inicial e nas lojas de apps
                </p>
              </div>
              
              <div>
                <Label htmlFor="short-name">Nome Curto</Label>
                <Input
                  id="short-name"
                  value={formData.pwa_short_name}
                  onChange={(e) => handleInputChange('pwa_short_name', e.target.value)}
                  placeholder="Nome abreviado"
                  maxLength={12}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usado quando há pouco espaço (máx. 12 caracteres)
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.pwa_description}
                  onChange={(e) => handleInputChange('pwa_description', e.target.value)}
                  placeholder="Descrição do que o aplicativo faz"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Ícones do Aplicativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="icon-main">Ícone Principal</Label>
                <Input
                  id="icon-main"
                  value={formData.pwa_icon_url}
                  onChange={(e) => handleInputChange('pwa_icon_url', e.target.value)}
                  placeholder="URL do ícone principal (PNG, mín. 192x192)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ícone padrão usado em todas as situações
                </p>
              </div>
              
              <div>
                <Label htmlFor="icon-192">Ícone 192x192 (Opcional)</Label>
                <Input
                  id="icon-192"
                  value={formData.pwa_icon_192}
                  onChange={(e) => handleInputChange('pwa_icon_192', e.target.value)}
                  placeholder="URL do ícone 192x192 (se diferente do principal)"
                />
              </div>
              
              <div>
                <Label htmlFor="icon-512">Ícone 512x512 (Opcional)</Label>
                <Input
                  id="icon-512"
                  value={formData.pwa_icon_512}
                  onChange={(e) => handleInputChange('pwa_icon_512', e.target.value)}
                  placeholder="URL do ícone 512x512 (se diferente do principal)"
                />
              </div>

              {formData.pwa_icon_url && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview do Ícone:</p>
                  <img 
                    src={formData.pwa_icon_url} 
                    alt="Preview do ícone" 
                    className="w-16 h-16 rounded-lg border shadow-sm object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência e Comportamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme-color">Cor do Tema</Label>
                <div className="flex gap-2">
                  <Input
                    id="theme-color"
                    type="color"
                    value={formData.pwa_theme_color}
                    onChange={(e) => handleInputChange('pwa_theme_color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.pwa_theme_color}
                    onChange={(e) => handleInputChange('pwa_theme_color', e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Cor da barra de status e elementos do sistema
                </p>
              </div>
              
              <div>
                <Label htmlFor="bg-color">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={formData.pwa_background_color}
                    onChange={(e) => handleInputChange('pwa_background_color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.pwa_background_color}
                    onChange={(e) => handleInputChange('pwa_background_color', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Cor de fundo durante o carregamento
                </p>
              </div>
              
              <div>
                <Label htmlFor="display-mode">Modo de Exibição</Label>
                <Select value={formData.pwa_display_mode} onValueChange={(value) => handleInputChange('pwa_display_mode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standalone">Standalone (Aplicativo Completo)</SelectItem>
                    <SelectItem value="fullscreen">Tela Cheia</SelectItem>
                    <SelectItem value="minimal-ui">Interface Mínima</SelectItem>
                    <SelectItem value="browser">Navegador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="orientation">Orientação</Label>
                <Select value={formData.pwa_orientation} onValueChange={(value) => handleInputChange('pwa_orientation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait-primary">Retrato</SelectItem>
                    <SelectItem value="landscape-primary">Paisagem</SelectItem>
                    <SelectItem value="any">Qualquer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Configurações Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="start-url">URL de Início</Label>
                <Input
                  id="start-url"
                  value={formData.pwa_start_url}
                  onChange={(e) => handleInputChange('pwa_start_url', e.target.value)}
                  placeholder="/"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Página que abre quando o app é iniciado
                </p>
              </div>
              
              <div>
                <Label htmlFor="scope">Escopo</Label>
                <Input
                  id="scope"
                  value={formData.pwa_scope}
                  onChange={(e) => handleInputChange('pwa_scope', e.target.value)}
                  placeholder="/"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URLs que fazem parte do aplicativo
                </p>
              </div>
              
              <div>
                <Label htmlFor="categories">Categorias</Label>
                <Input
                  id="categories"
                  value={formData.pwa_categories}
                  onChange={(e) => handleInputChange('pwa_categories', e.target.value)}
                  placeholder="social,business,marketing"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Categorias separadas por vírgula para lojas de apps
                </p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <SettingsIcon className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        {/* Preview e Informações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview do Aplicativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
                  {formData.pwa_icon_url ? (
                    <img 
                      src={formData.pwa_icon_url}
                      alt="Ícone do app"
                      className="w-16 h-16 mx-auto rounded-2xl mb-4 shadow"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto rounded-2xl mb-4 bg-gray-300 flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <h3 className="font-bold text-lg">{formData.pwa_app_name || 'Nome do App'}</h3>
                  <Badge variant="secondary" className="mt-2">Aplicativo</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Assim seu app aparecerá na tela inicial dos dispositivos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Manifest Gerado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(generateManifest(), null, 2)}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                Este é o manifest.json que será gerado automaticamente para seu PWA
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💡 Dicas para um Bom PWA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Ícones em Alta Resolução:</strong>
                  <p className="text-gray-600">Use ícones PNG de pelo menos 512x512 pixels para melhor qualidade</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Nome Curto:</strong>
                  <p className="text-gray-600">Mantenha o nome curto com até 12 caracteres para aparecer completo</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Cores Consistentes:</strong>
                  <p className="text-gray-600">Use as mesmas cores do seu site para uma experiência uniforme</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Teste em Dispositivos:</strong>
                  <p className="text-gray-600">Teste a instalação em diferentes celulares e tablets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}