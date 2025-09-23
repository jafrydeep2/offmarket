import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already logged in, redirecting to home page');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 6) return { strength: 1, text: t('language') === 'fr' ? 'Très faible' : 'Very weak' };
    if (password.length < 8) return { strength: 2, text: t('language') === 'fr' ? 'Faible' : 'Weak' };
    if (password.length < 10) return { strength: 3, text: t('language') === 'fr' ? 'Moyen' : 'Medium' };
    if (password.length < 12) return { strength: 4, text: t('language') === 'fr' ? 'Fort' : 'Strong' };
    return { strength: 5, text: t('language') === 'fr' ? 'Très fort' : 'Very strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!email || !password) {
      setError(t('language') === 'fr' 
        ? 'Veuillez remplir tous les champs obligatoires'
        : 'Please fill in all required fields'
      );
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('language') === 'fr' 
        ? 'Le mot de passe doit contenir au moins 6 caractères'
        : 'Password must be at least 6 characters long'
      );
      setIsLoading(false);
      return;
    }

    try {
      console.log('Starting signup...');
      const res = await signup(email, password, username);
      console.log('Signup result:', res);
      
      if (!res.success) {
        console.log('Signup failed:', res.error);
        setError(res.error || (t('language') === 'fr' ? 'Échec de l\'inscription' : 'Registration failed'));
        setIsLoading(false); // Reset loading state
        return;
      }
      
      if (res.needsConfirmation) {
        setSuccess(t('language') === 'fr' 
          ? 'Inscription réussie ! Veuillez vérifier votre email et cliquer sur le lien de confirmation pour activer votre compte.'
          : 'Registration successful! Please check your email and click the confirmation link to activate your account.'
        );
        setIsLoading(false); // Reset loading state
        // Don't navigate immediately, let user see the success message
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // User is already confirmed and logged in
        setIsLoading(false); // Reset loading state
        navigate('/properties');
      }
    } catch (err) {
      setError(t('language') === 'fr' ? 'Une erreur est survenue' : 'An error occurred');
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

        {/* Register Card */}
        <Card className="border-border">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-heading">
              {t('language') === 'fr' ? 'Créer un compte' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {t('language') === 'fr' 
                ? 'Accédez aux propriétés exclusives'
                : 'Access exclusive properties'
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
            
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="form-label">
                  {t('language') === 'fr' ? "Nom d'utilisateur (optionnel)" : 'Username (optional)'}
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('language') === 'fr' ? "Choisissez un nom d'utilisateur" : 'Choose a username'}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="form-label">
                  {t('language') === 'fr' ? 'Email' : 'Email'}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('language') === 'fr' ? 'Créez un mot de passe' : 'Create a password'}
                  className="form-input"
                  required
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength.strength
                              ? level <= 2
                                ? 'bg-red-500'
                                : level <= 3
                                ? 'bg-yellow-500'
                                : level <= 4
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength.text}
                    </p>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading 
                  ? t('common.loading') 
                  : (t('language') === 'fr' ? "S'inscrire" : 'Register')
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {t('language') === 'fr' 
                  ? 'Déjà un compte ? '
                  : 'Already have an account? '
                }
                <Link to="/login" className="text-primary underline">{t('auth.login')}</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
