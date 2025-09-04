import React, { createContext, useContext, useState, useEffect } from 'react';

const AffiliateAuthContext = createContext();

export const useAffiliateAuth = () => {
  const context = useContext(AffiliateAuthContext);
  if (!context) {
    throw new Error('useAffiliateAuth must be used within an AffiliateAuthProvider');
  }
  return context;
};

export const AffiliateAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está logado (localStorage)
    const userData = localStorage.getItem('affiliate_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('affiliate_user');
      }
    }
    setIsLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      // Simular validação de email único
      const existingUsers = JSON.parse(localStorage.getItem('affiliate_users') || '[]');
      const emailExists = existingUsers.find(u => u.email === userData.email);
      
      if (emailExists) {
        return { success: false, error: 'Este email já está cadastrado.' };
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        full_name: userData.full_name,
        password: userData.password, // Em produção, usar hash
        role: 'affiliate',
        created_at: new Date().toISOString()
      };

      // Salvar na lista de usuários
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('affiliate_users', JSON.stringify(updatedUsers));

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta.' };
    }
  };

  const login = async (email, password) => {
    try {
      // Buscar usuário na lista
      const existingUsers = JSON.parse(localStorage.getItem('affiliate_users') || '[]');
      const user = existingUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return { success: false, error: 'Email ou senha incorretos.' };
      }

      // Fazer login
      const userToStore = { ...user };
      delete userToStore.password; // Não armazenar senha no estado
      
      localStorage.setItem('affiliate_user', JSON.stringify(userToStore));
      setUser(userToStore);
      setIsAuthenticated(true);

      return { success: true, user: userToStore };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('affiliate_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Simular User.me() do Base44
  const me = async () => {
    if (isAuthenticated && user) {
      return user;
    }
    throw new Error('User not authenticated');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    me
  };

  return (
    <AffiliateAuthContext.Provider value={value}>
      {children}
    </AffiliateAuthContext.Provider>
  );
};