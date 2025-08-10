'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ログイン状態を確認するAPIのエンドポイント
const LOGIN_STATUS_API_URL = '/backend/check-login.php';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
 const pathname = usePathname();

   useEffect(() => {
    if(pathname != "/login"){
      localStorage.setItem('redirectPath', pathname);
    }
  }, [pathname]);

  // ログイン状態をチェックするロジックをここに移す
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(LOGIN_STATUS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('ログイン状態の確認中にエラーが発生しました:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// コンテキストを使用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};