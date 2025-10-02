import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearLoginSuccess } from '@/store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loginSuccess, redirectPath, user: reduxUser } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already logged in, redirecting to home page');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess) {
      const targetPath = redirectPath || '/';
      console.log('Login successful, redirecting to:', targetPath);
      navigate(targetPath);
      dispatch(clearLoginSuccess());
    }
  }, [loginSuccess, redirectPath, navigate, dispatch]);

  // Debug: Check if login function is available
  console.log('LoginPage rendered, login function:', typeof login);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', { email, password: password ? '***' : 'empty' });
    setIsLoading(true);
    setError('');
    
    // Basic validation
    if (!email || !password) {
      console.log('Validation failed: missing fields');
      setError(t('language') === 'fr' 
        ? 'Veuillez remplir tous les champs'
        : 'Please fill in all fields'
      );
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Starting login with:', { email, passwordLength: password.length });
      const result = await login(email, password, '/');
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, Redux will handle redirect...');
        // Redux will handle the redirect via useEffect
      } else {
        if (result.needsConfirmation) {
          setError(t('language') === 'fr' 
            ? "Veuillez vérifier votre email et cliquer sur le lien de confirmation avant de vous connecter."
            : result.error || 'Please check your email and click the confirmation link before logging in.'
          );
        } else {
          setError(t('language') === 'fr' 
            ? result.error || "Email ou mot de passe incorrect, ou abonnement expiré"
            : result.error || 'Invalid email or password, or subscription expired'
          );
        }
      }
    } catch (err) {
      setError(t('language') === 'fr' 
        ? 'Une erreur est survenue lors de la connexion'
        : 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('language') === 'fr' ? "Retour à l'accueil" : 'Back to Home'}
        </Link>

        {/* Login Card */}
        <Card className="border-border">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-heading">
              {t('auth.login')}
            </CardTitle>
            <CardDescription>
              {t('language') === 'fr' 
                ? 'Accédez à votre espace membre privilégié'
                : 'Access your privileged member area'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="form-label">
                  {t('language') === 'fr' ? 'Email' : 'Email'}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    console.log('Email changed:', e.target.value);
                    setEmail(e.target.value);
                  }}
                  placeholder={t('language') === 'fr' ? 'Entrez votre email' : 'Enter your email'}
                  className="form-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="form-label">
                  {t('auth.password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    console.log('Password changed, length:', e.target.value.length);
                    setPassword(e.target.value);
                  }}
                  placeholder={t('language') === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                  className="form-input"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={isLoading}
                onClick={() => console.log('Button clicked!')}
              >
                {isLoading 
                  ? t('common.loading') 
                  : t('auth.submit')
                }
              </Button>

            </form>

            <div className="mt-4 text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                {t('language') === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {t('language') === 'fr' 
                  ? 'Pas de compte ? '
                  : "Don't have an account? "
                }
                <Link to="/register" className="text-primary underline">{t('language') === 'fr' ? 'Créer un compte' : 'Create one'}</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};