import React, { useState, useEffect } from "react";
import { useAffiliateAuth } from "@/contexts/AffiliateAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Users, LogIn, UserPlus } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AffiliateLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    confirmPassword: ""
  });

  const { login, register, isAuthenticated, isLoading } = useAffiliateAuth();

  // Redirecionar se já estiver logado
  if (isAuthenticated) {
    return <Navigate to="/Affiliates" replace />;
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      if (isLogin) {
        // Login logic
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          // Redirecionamento será feito automaticamente pelo Navigate acima
        } else {
          setAlert({ type: "error", message: result.error });
        }
      } else {
        // Registration logic
        if (formData.password !== formData.confirmPassword) {
          setAlert({ type: "error", message: "As senhas não coincidem." });
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setAlert({ type: "error", message: "A senha deve ter pelo menos 6 caracteres." });
          setLoading(false);
          return;
        }

        if (!formData.full_name.trim()) {
          setAlert({ type: "error", message: "Nome completo é obrigatório." });
          setLoading(false);
          return;
        }

        // Create new affiliate account
        const result = await register({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password
        });

        if (result.success) {
          setAlert({ 
            type: "success", 
            message: "Conta criada com sucesso! Faça login para continuar." 
          });
          setIsLogin(true);
          setFormData({
            email: formData.email, // Manter email preenchido
            password: "",
            full_name: "",
            confirmPassword: ""
          });
        } else {
          setAlert({ type: "error", message: result.error });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setAlert({ 
        type: "error", 
        message: isLogin ? "Erro ao fazer login." : "Erro ao criar conta." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SocialBoost
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Login de Afiliado" : "Cadastro de Afiliado"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? "Acesse sua conta de afiliado" : "Crie sua conta e comece a ganhar"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alert && (
              <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      required={!isLogin}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Digite a senha novamente"
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? "Processando..." : (isLogin ? "Entrar" : "Criar Conta")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAlert(null);
                  setFormData({
                    email: "",
                    password: "",
                    full_name: "",
                    confirmPassword: ""
                  });
                }}
                className="text-sm"
              >
                {isLogin ? "Não tem conta? Criar uma" : "Já tem conta? Fazer login"}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" className="text-sm text-gray-500">
                  ← Voltar ao site
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}