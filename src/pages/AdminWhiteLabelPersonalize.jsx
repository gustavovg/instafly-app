
import React, { useState, useEffect } from 'react';
import { WhiteLabelSite } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Palette, Eye, Loader2, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { UploadFile } from '@/api/integrations';

export default function AdminWhiteLabelPersonalize() {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const siteId = urlParams.get('id');

  useEffect(() => {
    if (siteId) {
      loadSite();
    }
  }, [siteId]);

  const loadSite = async () => {
    try {
      const sites = await WhiteLabelSite.list();
      const foundSite = sites.find(s => s.id === siteId);
      setSite(foundSite);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar dados do site' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSite(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    if (type === 'logo') setUploadingLogo(true);
    
    try {
      const { file_url } = await UploadFile({ file });
      setSite(prev => ({ ...prev, [`${type}_url`]: file_url }));
      setAlert({ type: 'success', message: `Logo enviado com sucesso!` });
    } catch (error) {
      console.error("Upload error:", error);
      setAlert({ type: 'error', message: 'Erro ao fazer upload do arquivo. Por favor, cole a URL da imagem no campo indicado.' });
    } finally {
      if (type === 'logo') setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await WhiteLabelSite.update(siteId, site);
      setAlert({ type: 'success', message: 'Personalização salva com sucesso!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao salvar personalização' });
    } finally {
      setSaving(false);
    }
  };

  const getPreviewUrl = () => {
    if (!site) return createPageUrl('Home');
    // No ambiente de desenvolvimento, usamos um parâmetro para simular
    return createPageUrl('Home') + `?test_domain=${site.site_domain}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!site) {
    return <div className="text-center p-8">Site não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = createPageUrl('AdminWhiteLabel')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Personalizar Site White-Label</h1>
          <p className="text-gray-600">{site.brand_name} - {site.site_domain}</p>
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>Personalize o logo e as cores do site revendedor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="brand_name">Nome da Marca</Label>
                <Input
                  id="brand_name"
                  value={site.brand_name || ''}
                  onChange={(e) => handleInputChange('brand_name', e.target.value)}
                  placeholder="Marca do Cliente"
                />
              </div>

              {/* UPLOAD DE LOGO */}
              <div>
                <Label htmlFor="logo_url">Logo da Marca</Label>
                <div className="flex items-center gap-4 mt-2">
                  {site.logo_url ? (
                    <img src={site.logo_url} alt="Logo" className="h-12 w-auto bg-gray-100 rounded-md p-1 object-contain" />
                  ) : (
                    <div className="w-24 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                      <Sparkles />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Input
                      id="logo_url"
                      value={site.logo_url || ''}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      placeholder="Cole a URL do logo aqui"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Cole a URL de uma imagem já hospedada. O upload de arquivos está em manutenção.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primary_color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={site.primary_color || '#3b82f6'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={site.primary_color || '#3b82f6'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary_color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={site.secondary_color || '#8b5cf6'}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={site.secondary_color || '#8b5cf6'}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp_number">WhatsApp de Suporte</Label>
                <Input
                  id="whatsapp_number"
                  value={site.whatsapp_number || ''}
                  onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                  placeholder="5511999999999"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Personalização
            </Button>
            <Button variant="outline" onClick={() => window.open(getPreviewUrl(), '_blank')}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="flex items-center space-x-4 mb-4">
                  {site.logo_url ? (
                    <img src={site.logo_url} alt="Logo" className="h-8 object-contain" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(to right, ${site.primary_color || '#3b82f6'}, ${site.secondary_color || '#8b5cf6'})` }}
                    >
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span 
                    className="text-lg font-bold bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(to right, ${site.primary_color || '#3b82f6'}, ${site.secondary_color || '#8b5cf6'})` }}
                  >
                    {site.brand_name}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>URL:</strong> {site.site_domain}</p>
                  <p><strong>Tipo:</strong> {site.plan_type === 'starter' ? 'Subdomínio' : 'Domínio Próprio'}</p>
                  <p><strong>WhatsApp:</strong> {site.whatsapp_number || 'Não configurado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {site.plan_type !== 'starter' && (
            <Card>
              <CardHeader>
                <CardTitle>Configuração DNS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Instruções para o Cliente:</h4>
                  <div className="text-sm text-yellow-700 space-y-2">
                    <p>1. Acesse o painel do seu provedor de domínio (GoDaddy, Hostgator, etc.).</p>
                    <p>2. Crie um registro do tipo **CNAME** com os seguintes valores:</p>
                    <div className="bg-yellow-100 p-2 rounded font-mono text-xs my-2">
                      <strong>Tipo:</strong> CNAME<br/>
                      <strong>Nome/Host:</strong> www<br/>
                      <strong>Destino/Valor:</strong> {import.meta.env.VITE_MAIN_DOMAIN || 'seu-dominio-principal.com'}
                    </div>
                    <p className="font-semibold">Importante: O domínio do seu cliente deve ser configurado para usar `www`, por exemplo, `www.paineldojoao.com`.</p>
                    <p>3. Aguarde a propagação do DNS, que pode levar de alguns minutos a algumas horas.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
