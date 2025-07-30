import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supabase에서 가져올 사용자 데이터의 타입을 정의합니다.
// 실제 DB 스키마에 맞게 필드를 추가하거나 수정하세요.
interface User {
  employee_name: string;
  employee_email: string;
  employee_department: string;
  employee_created_at: Date;
  // 예: 'admin', 'manager', 'employee'
  // 기타 필요한 사용자 정보 필드
}

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: User | null; // 현재 로그인된 사용자 정보 (초기값 null)
  login: (userData: User) => void; // 로그인 시 사용자 데이터를 받도록 수정
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // 초기 로드 시 localStorage에서 로그인 상태를 가져옴
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // 초기 로드 시 localStorage에서 사용자 데이터를 가져옴
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 로그인 함수: 사용자 데이터를 받아 상태와 localStorage에 저장
  const login = (userData: User) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userData)); // 사용자 데이터를 JSON 문자열로 저장
  };

  // 로그아웃 함수: 상태와 localStorage에서 모두 제거
  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser'); // 사용자 데이터도 제거
  };

  // isLoggedIn 또는 currentUser가 변경될 때마다 localStorage를 동기화할 필요는 없음.
  // login/logout 함수에서 직접 처리하므로 useEffect는 필요 없음.
  // 만약 isLoggedIn만 localStorage에 저장한다면, Dashboard의 useEffect 로직을 살려야 합니다.
  // 여기서는 currentUser까지 Context에서 직접 관리하므로 Dashboard의 useEffect는 제거하거나 수정해야 합니다.

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};