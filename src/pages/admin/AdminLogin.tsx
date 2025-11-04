import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearLoginSuccess } from '@/store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AdminLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { login, user: ctxUser, isAuthenticated, isAdmin: ctxIsAdmin } = useAuth();
  const { loginSuccess, redirectPath, isAdmin: reduxIsAdmin } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check admin status from both sources
  const isAdmin = ctxIsAdmin || reduxIsAdmin || ctxUser?.isAdmin;

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated && ctxUser) {
      console.log('User already logged in, checking admin status...', { isAdmin, ctxIsAdmin, reduxIsAdmin, userIsAdmin: ctxUser?.isAdmin });
      
      // If user is admin, redirect to admin dashboard
      if (isAdmin) {
        console.log('User is admin, redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('User is not admin, redirecting to home page');
        navigate('/');
      }
    }
  }, [isAuthenticated, ctxUser, isAdmin, ctxIsAdmin, reduxIsAdmin, navigate]);

  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess) {
      console.log('Admin login successful, checking admin status...', { isAdmin, ctxIsAdmin, reduxIsAdmin, userIsAdmin: ctxUser?.isAdmin });
      // Check if user is admin from any source
      if (isAdmin) {
        const targetPath = redirectPath || '/admin/dashboard';
        console.log('User is admin, redirecting to:', targetPath);
        navigate(targetPath);
        dispatch(clearLoginSuccess());
      } else {
        console.log('User is not admin, showing error');
        setError(t('language') === 'fr' ? "Accès administrateur requis. Vous n'êtes pas autorisé à accéder à cette zone." : 'Administrator access required. You are not authorized to access this area.');
        dispatch(clearLoginSuccess());
      }
    }
  }, [loginSuccess, redirectPath, isAdmin, ctxIsAdmin, reduxIsAdmin, ctxUser, navigate, dispatch, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError(t('language') === 'fr' 
        ? 'Veuillez remplir tous les champs'
        : 'Please fill in all fields'
      );
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password, '/admin/dashboard');
      if (!result.success) {
        if (result.needsConfirmation) {
          setError(t('language') === 'fr' 
            ? "Veuillez vérifier votre email et cliquer sur le lien de confirmation avant de vous connecter."
            : result.error || 'Please check your email and click the confirmation link before logging in.'
          );
        } else {
          setError(t('language') === 'fr' 
            ? result.error || "Échec de la connexion. Vérifiez vos identifiants ou votre abonnement."
            : result.error || 'Login failed. Check your credentials or subscription.'
          );
        }
        return;
      }
      // Redux will handle the redirect via useEffect
    } catch (err) {
      setError(t('language') === 'fr' 
        ? 'Une erreur est survenue lors de la connexion'
        : 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" /> */}
      
      <div className="relative w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('language') === 'fr' ? 'Retour au site' : 'Back to site'}
        </Link>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-heading bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t('language') === 'fr' ? 'Administration' : 'Admin Panel'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('language') === 'fr' 
                    ? "Accès sécurisé à l'espace d'administration"
                    : 'Secure access to administration panel'
                  }
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      {t('language') === 'fr' ? 'Email' : 'Email'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('language') === 'fr' ? 'Entrez votre email' : 'Enter your email'}
                        className="pl-10 h-12 border-2 focus:border-purple-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      {t('auth.password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={t('language') === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                        className="pl-10 pr-10 h-12 border-2 focus:border-purple-500 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>{t('language') === 'fr' ? 'Se connecter' : 'Sign In'}</span>
                    </div>
                  )}
                </Button>
              </form>

            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/60 text-sm"
        >
          <p>© 2024 OffMarket. {t('language') === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
        </motion.div>
      </div>
    </div>
  );
};
