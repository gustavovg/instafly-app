
import React, { useState, useEffect } from "react";
import { Settings } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye } from "lucide-react";

const defaultEmailTemplate = `<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1 style="color: white; margin: 0; font-size: 28px;">InstaFLY</h1><p style="color: #f0f0f0; margin: 10px 0 0 0;">Seu pedido foi criado com sucesso!</p></div><div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;"><h2 style="color: #333; margin-top: 0;">Olá!</h2><p>Seu pedido para o serviço <strong>{{service_name}}</strong> foi criado com sucesso.</p><div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;"><p style="margin: 0; font-size: 16px;"><strong>ID do Pedido:</strong></p><p style="margin-top: 5px; font-size: 20px; font-family: monospace; background: #e9ecef; padding: 8px 12px; border-radius: 4px; display: inline-block;">{{order_id}}</p></div><p>Você pode acompanhar o status do seu pedido a qualquer momento clicando no botão abaixo:</p><div style="text-align: center; margin: 30px 0;"><a href="{{tracking_link}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Acompanhar meu Pedido</a></div><hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"><p style="color: #666; font-size: 14px; text-align: center;">Obrigado por escolher nossos serviços!<br>Equipe InstaFLY</p></div></body></html>`;

export default function AdminEmailSettings() {
  const [settings, setSettings] = useState({
    email_subject_template: "",
    email_body_template: "",
  });
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const data = await Settings.list();
      if (data.length > 0) {
        setSettings({
          ...data[0], // Load existing settings, if any
          email_subject_template: data[0].email_subject_template || "Confirmação do seu Pedido #{{order_id}}",
          email_body_template: data[0].email_body_template || defaultEmailTemplate
        });
        setSettingsId(data[0].id);
      } else {
         setSettings({
          email_subject_template: "Confirmação do seu Pedido #{{order_id}}",
          email_body_template: defaultEmailTemplate
        });
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    // Update preview whenever the template changes
    let html = settings.email_body_template;
    html = html.replace(/{{order_id}}/g, 'ABC-123456');
    html = html.replace(/{{service_name}}/g, '1.000 Seguidores Brasileiros');
    html = html.replace(/{{tracking_link}}/g, '#'); // Use '#' for preview link
    setPreviewHtml(html);
  }, [settings.email_body_template]);

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      if (settingsId) {
        // Only update the email fields
        await Settings.update(settingsId, {
          email_subject_template: settings.email_subject_template,
          email_body_template: settings.email_body_template,
        });
      } else {
        // If no settings exist, create a new record
        const newSettings = await Settings.create({
          email_subject_template: settings.email_subject_template,
          email_body_template: settings.email_body_template,
        });
        setSettingsId(newSettings.id);
      }
      setAlert({ type: "success", message: "Template de e-mail salvo com sucesso!" });
    } catch (e) {
      setAlert({ type: "error", message: "Erro ao salvar template." });
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };
  
  if (loading) {
    return (
        <div className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p>Carregando configurações...</p>
        </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                  <CardTitle>Templates de E-mail</CardTitle>
                  <CardDescription>
                    Configure o e-mail automático enviado aos clientes após a criação do pedido.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {alert && <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}><AlertDescription>{alert.message}</AlertDescription></Alert>}
                  <div className="space-y-2">
                    <Label htmlFor="email_subject_template">Assunto do E-mail</Label>
                    <Input id="email_subject_template" value={settings.email_subject_template} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_body_template">Corpo do E-mail (HTML)</Label>
                    <Textarea 
                      id="email_body_template" 
                      value={settings.email_body_template} 
                      onChange={handleChange} 
                      rows={15}
                      className="font-mono text-xs"
                    />
                  </div>
                  <Card className="bg-gray-100">
                    <CardContent className="p-4 text-sm">
                        <p className="font-bold mb-2">Variáveis disponíveis:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><code className="bg-gray-200 px-1 rounded-sm">{"{{order_id}}"}</code> - ID do pedido.</li>
                            <li><code className="bg-gray-200 px-1 rounded-sm">{"{{service_name}}"}</code> - Nome do serviço comprado.</li>
                            <li><code className="bg-gray-200 px-1 rounded-sm">{"{{tracking_link}}"}</code> - Link para a página de rastreio do pedido.</li>
                        </ul>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Salvando...</> : "Salvar Template"}
                    </Button>
                  </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Eye/> Pré-visualização do E-mail</CardTitle>
                    <CardDescription>
                        É assim que seu cliente verá o e-mail.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-100 text-sm text-gray-600">
                            <p><strong>De:</strong> InstaFLY</p>
                            <p><strong>Assunto:</strong> {settings.email_subject_template.replace('{{order_id}}', 'ABC-123456')}</p>
                        </div>
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full h-[500px] border-t"
                            title="Pré-visualização do E-mail"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
