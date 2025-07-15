
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobotSpinner from './RobotSpinner';
import { useAuth } from '@/context/AuthContext';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

const AuthForm = ({ mode, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signIn, signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signin') {
      await signIn(email, password);
    } else {
      await signUp(email, password, fullName);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-elegant">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pulse-400 to-pulse-600 rounded-2xl flex items-center justify-center mb-4 animate-float">
          🤖
        </div>
        <CardTitle className="text-2xl font-display">
          {mode === 'signin' ? 'Welcome Back!' : 'Join the Robot Revolution!'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin' 
            ? 'Sign in to your Pulse Robot account' 
            : 'Create your account and meet your new robot friend'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your awesome name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="transition-all duration-200 focus:ring-2 focus:ring-pulse-500"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="transition-all duration-200 focus:ring-2 focus:ring-pulse-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="transition-all duration-200 focus:ring-2 focus:ring-pulse-500"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pulse-500 to-pulse-600 hover:from-pulse-600 hover:to-pulse-700 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <RobotSpinner size="sm" />
                <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              mode === 'signin' ? 'Sign In 🚀' : 'Create Account ✨'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onToggleMode}
            disabled={loading}
            className="text-pulse-600 hover:text-pulse-700 hover:bg-pulse-50"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up!" 
              : "Already have an account? Sign in!"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
