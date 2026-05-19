import { useState, useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { getUserInfo } from '../utils/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('console_token');
    if (!token) {
      setIsLoggedIn(false);
      setChecking(false);
      return;
    }

    getUserInfo()
      .then(res => {
        if (res.data.success) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('console_token');
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        localStorage.removeItem('console_token');
        setIsLoggedIn(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}