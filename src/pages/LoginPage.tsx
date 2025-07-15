
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';

const LoginPage = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleToggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pulse-50 via-white to-pulse-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-gradient opacity-10"></div>
      <div className="relative z-10 w-full">
        <AuthForm mode={mode} onToggleMode={handleToggleMode} />
      </div>
    </div>
  );
};

export default LoginPage;
