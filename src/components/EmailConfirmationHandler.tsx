import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const EmailConfirmationHandler: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleConfirmation = async () => {
      // Check if this is a confirmation URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (type === 'signup' && accessToken && refreshToken) {
        // This is a confirmation URL, wait for auth state to update
        setStatus('loading');
        setMessage('Confirming your email...');
        
        // Wait a bit for the auth state to update
        setTimeout(() => {
          if (isAuthenticated) {
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting...');
            
            // Redirect based on user type
            setTimeout(() => {
              if (isAdmin) {
                navigate('/admin/dashboard');
              } else {
                navigate('/properties');
              }
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Email confirmation failed. Please try again.');
          }
        }, 2000);
      } else {
        // Not a confirmation URL, redirect to home
        navigate('/');
      }
    };

    if (!isLoading) {
      handleConfirmation();
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'success' ? 'Email Confirmed!' : status === 'error' ? 'Confirmation Failed' : 'Confirming Email'}
          </CardTitle>
          <CardDescription>
            {status === 'success' 
              ? 'Your email has been successfully confirmed.'
              : status === 'error'
              ? 'There was an issue confirming your email.'
              : 'Please wait while we confirm your email...'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className={status === 'success' ? 'border-green-200 bg-green-50' : status === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : status === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
            <AlertDescription className={status === 'success' ? 'text-green-800' : status === 'error' ? 'text-red-800' : 'text-blue-800'}>
              {message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
