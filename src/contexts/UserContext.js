import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const USER_TOKEN_KEY = 'user_token';
const USER_INFO_KEY = 'user_info';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const newAuthState = !!userToken;
    
    setIsAuthenticated(newAuthState);
  }, [userToken]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
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

  const login = async (token, userData) => {
    try {
      setIsLoading(true);
      
      localStorage.setItem(USER_TOKEN_KEY, token);
      setUserToken(token);
      
      if (userData) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
        setUserInfo(userData);
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      
      setIsLoading(true);
      
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      
      setUserToken(null);
      setUserInfo(null);
      setIsAuthenticated(false);
      

      
      const checkToken = localStorage.getItem(USER_TOKEN_KEY);
      const checkUserInfo = localStorage.getItem(USER_INFO_KEY);

      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!userInfo) return 'Usuário';
    
    if (userInfo.name) return userInfo.name;
    if (userInfo.given_name && userInfo.family_name) {
      return `${userInfo.given_name} ${userInfo.family_name}`;
    }
    if (userInfo.given_name) return userInfo.given_name;
    
    return 'Usuário';
  };

  const getDisplayEmail = () => {
    return userInfo?.email || 'email@exemplo.com';
  };

  const getProfilePicture = () => {
    return userInfo?.picture || userInfo?.photo || null;
  };

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