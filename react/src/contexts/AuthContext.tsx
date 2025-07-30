import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// 1. AuthContext에서 제공할 값들의 타입을 정의합니다.
//    isLoggedIn: 현재 로그인 상태 (true/false)
//    login: 사용자가 로그인했을 때 호출할 함수
//    logout: 사용자가 로그아웃했을 때 호출할 함수
interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

// 2. AuthContext를 생성합니다.
//    초기값은 undefined로 설정하고, useAuth 훅에서 이 값이 undefined가 아닐 때만 사용하도록 강제합니다.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. AuthProvider 컴포넌트의 props 타입을 정의합니다.
//    children: AuthProvider로 감싸질 React 자식 요소들
interface AuthProviderProps {
  children: ReactNode;
}

// 4. AuthProvider 컴포넌트를 정의합니다.
//    이 컴포넌트는 모든 자식 컴포넌트에 AuthContext의 값을 제공합니다.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 로그인 상태를 관리하는 state.
  // 초기값은 localStorage에서 가져와서 페이지를 새로고침해도 상태가 유지되도록 합니다.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // 앱이 처음 로드될 때 localStorage에서 'isLoggedIn' 값을 확인합니다.
    const storedStatus = localStorage.getItem('isLoggedIn');
    console.log("AuthProvider useState init: storedStatus =", storedStatus);
    // 'true' 문자열인 경우에만 true를 반환하고, 아니면 false를 반환합니다.
    return storedStatus === 'true';
  });

  // login 함수: 로그인 상태를 true로 설정하고 localStorage에도 저장합니다.
  const login = () => {
    console.log("AuthContext: login() 함수 호출 시작"); // <-- 추가
    setIsLoggedIn(true); // React 상태 업데이트 (비동기적) 
    localStorage.setItem('isLoggedIn', 'true');
    console.log("AuthContext: localStorage에 'isLoggedIn' 저장 시도 완료.");
    console.log("AuthContext: localStorage.getItem('isLoggedIn') 결과:", localStorage.getItem('isLoggedIn')); // 저장 후 즉시 읽기
  };

  // logout 함수: 로그인 상태를 false로 설정하고 localStorage에서도 제거합니다.
  const logout = () => {
    console.log("AuthContext: logout() 함수 호출됨"); // <-- 디버깅용 console.log 추가
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    console.log("AuthContext: isLoggedIn 값 제거됨", localStorage.getItem('isLoggedIn')); // <-- 디버깅용 console.log 추가
    console.log("AuthContext: 현재 isLoggedIn 상태:", isLoggedIn); // <-- 추가
  };

  // AuthContext.Provider를 통해 isLoggedIn 상태와 login/logout 함수를 자식 컴포넌트에 제공합니다.
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. useAuth 커스텀 훅을 정의합니다.
//    이 훅을 사용하면 어떤 컴포넌트에서든 AuthContext의 값에 쉽게 접근할 수 있습니다.
export const useAuth = () => {
  const context = useContext(AuthContext); // React의 useContext 훅을 사용하여 AuthContext의 현재 값을 가져옵니다.

  // context가 undefined라면 (즉, AuthProvider로 감싸지지 않았다면) 에러를 발생시킵니다.
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // AuthContext에서 제공하는 값(isLoggedIn, login, logout)을 반환합니다.
  return context;
};