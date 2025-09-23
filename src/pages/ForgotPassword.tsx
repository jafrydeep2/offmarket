import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already logged in, redirecting to home page');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) setMsg(error.message);
    else setMsg('Check your email for a reset link.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={submit} className="space-y-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" required />
        <Button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
