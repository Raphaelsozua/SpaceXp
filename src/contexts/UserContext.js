// src/contexts/UserContext.js - Versão simples para web
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Chaves para armazenamento
const USER_TOKEN_KEY = 'user_token';
const USER_INFO_KEY = 'user_info';

// Criar contexto
const UserContext = createContext(null);

// Hook para usar o contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

// Provider do contexto
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar dados do usuário ao inicializar
  useEffect(() => {
    loadUserData();
  }, []);

  // Atualizar estado de autenticação quando o token mudar
  useEffect(() => {
    const newAuthState = !!userToken;
    console.log('🔄 Token mudou:', {
      hasToken: !!userToken,
      wasAuthenticated: isAuthenticated,
      willBeAuthenticated: newAuthState
    });
    setIsAuthenticated(newAuthState);
  }, [userToken]);

  // Carregar dados do usuário do armazenamento
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Usar localStorage para web (temporariamente)
      const token = localStorage.getItem(USER_TOKEN_KEY);
      const storedUserInfo = localStorage.getItem(USER_INFO_KEY);

      if (token) {
        setUserToken(token);
      }

      if (storedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          setUserInfo(parsedUserInfo);
        } catch (parseError) {
          console.error('Erro ao fazer parse das informações do usuário:', parseError);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fazer login (salvar token e informações do usuário)
  const login = async (token, userData) => {
    try {
      setIsLoading(true);
      console.log('🔑 Iniciando login...', { hasToken: !!token, hasUserData: !!userData });
      
      // Usar localStorage para web (temporariamente)
      localStorage.setItem(USER_TOKEN_KEY, token);
      setUserToken(token);
      
      // Salvar informações do usuário
      if (userData) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
        setUserInfo(userData);
      }
      
      setIsAuthenticated(true);
      console.log('✅ Login realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fazer logout
  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      console.log('📊 Estado antes do logout:', {
        hasToken: !!userToken,
        hasUserInfo: !!userInfo,
        isAuthenticated
      });
      
      setIsLoading(true);
      
      // Remover dados do armazenamento
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      console.log('🗑️ Dados removidos do localStorage');
      
      // Limpar estado
      setUserToken(null);
      setUserInfo(null);
      setIsAuthenticated(false);
      
      console.log('📊 Estado após o logout:', {
        hasToken: false,
        hasUserInfo: false,
        isAuthenticated: false
      });
      
      // Verificar se localStorage foi realmente limpo
      const checkToken = localStorage.getItem(USER_TOKEN_KEY);
      const checkUserInfo = localStorage.getItem(USER_INFO_KEY);
      console.log('🔍 Verificação localStorage:', {
        tokenLimpo: checkToken === null,
        userInfoLimpo: checkUserInfo === null
      });
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Obter nome de exibição do usuário
  const getDisplayName = () => {
    if (!userInfo) return 'Usuário';
    
    if (userInfo.name) return userInfo.name;
    if (userInfo.given_name && userInfo.family_name) {
      return `${userInfo.given_name} ${userInfo.family_name}`;
    }
    if (userInfo.given_name) return userInfo.given_name;
    
    return 'Usuário';
  };

  // Obter email do usuário
  const getDisplayEmail = () => {
    return userInfo?.email || 'email@exemplo.com';
  };

  // Obter foto do perfil
  const getProfilePicture = () => {
    return userInfo?.picture || userInfo?.photo || null;
  };

  // Valor do contexto
  const contextValue = {
    userInfo,
    userToken,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getDisplayName,
    getDisplayEmail,
    getProfilePicture,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};