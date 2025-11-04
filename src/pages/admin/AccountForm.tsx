import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus, Edit } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const AccountForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    subscriptionType: 'basic' as 'basic' | 'premium',
    subscriptionExpiry: '',
    isActive: true,
    isAdmin: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Load user data if editing
  React.useEffect(() => {
    if (isEdit && id) {
      setIsLoadingData(true);
      const loadUserData = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            console.error('Error loading user:', error);
            toast({
              title: t('language') === 'fr' ? 'Erreur' : 'Error',
              description: t('language') === 'fr' ? 'Impossible de charger les données utilisateur' : 'Failed to load user data',
              variant: 'destructive',
            });
            navigate('/admin/accounts');
            return;
          }

          if (data) {
            setFormData({
              email: data.email || '',
              password: '', // Don't load password
              username: data.username || '',
              subscriptionType: (data.subscription_type as 'basic' | 'premium') || 'basic',
              subscriptionExpiry: data.subscription_expiry || '',
              isActive: data.is_active ?? true,
              isAdmin: data.is_admin ?? false,
            });
          }
        } catch (err) {
          console.error('Error loading user:', err);
          toast({
            title: t('language') === 'fr' ? 'Erreur' : 'Error',
            description: t('language') === 'fr' ? 'Erreur lors du chargement' : 'Error loading data',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingData(false);
        }
      };

      loadUserData();
    } else {
      // Set default expiry to 1 year from now for new accounts
      if (!formData.subscriptionExpiry) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        setFormData(prev => ({
          ...prev,
          subscriptionExpiry: oneYearFromNow.toISOString().split('T')[0],
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!formData.email) {
      setError(t('language') === 'fr' 
        ? 'L\'email est requis'
        : 'Email is required'
      );
      setIsLoading(false);
      return;
    }

    // Password is required only for new accounts
    if (!isEdit && !formData.password) {
      setError(t('language') === 'fr' 
        ? 'Le mot de passe est requis'
        : 'Password is required'
      );
      setIsLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError(t('language') === 'fr' 
        ? 'Le mot de passe doit contenir au moins 6 caractères'
        : 'Password must be at least 6 characters long'
      );
      setIsLoading(false);
      return;
    }

    try {
      // Get Supabase URL and anon key from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error(t('language') === 'fr' ? 'Configuration Supabase manquante' : 'Missing Supabase configuration');
      }

      if (isEdit && id) {
        // Update existing user
        const response = await fetch(`${supabaseUrl}/functions/v1/update-admin-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: id,
            email: formData.email,
            password: formData.password || undefined, // Only include if provided
            username: formData.username || null,
            subscriptionType: formData.subscriptionType,
            subscriptionExpiry: formData.subscriptionExpiry,
            isActive: formData.isActive,
            isAdmin: formData.isAdmin,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || (t('language') === 'fr' ? 'Erreur lors de la mise à jour du compte' : 'Error updating account'));
        }

        if (!result.success) {
          throw new Error(result.error || (t('language') === 'fr' ? 'Échec de la mise à jour du compte' : 'Failed to update account'));
        }

        toast({
          title: t('language') === 'fr' ? 'Succès' : 'Success',
          description: t('language') === 'fr' 
            ? 'Compte mis à jour avec succès'
            : 'Account updated successfully',
        });
      } else {
        // Create new user
        const response = await fetch(`${supabaseUrl}/functions/v1/create-admin-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            username: formData.username || null,
            subscriptionType: formData.subscriptionType,
            subscriptionExpiry: formData.subscriptionExpiry,
            isActive: formData.isActive,
            isAdmin: formData.isAdmin,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || (t('language') === 'fr' ? 'Erreur lors de la création du compte' : 'Error creating account'));
        }

        if (!result.success) {
          throw new Error(result.error || (t('language') === 'fr' ? 'Échec de la création du compte' : 'Failed to create account'));
        }

        // Success message based on account status
        const successMessage = formData.isActive
          ? (t('language') === 'fr' 
              ? 'Compte créé avec succès. L\'email est confirmé et l\'utilisateur peut se connecter immédiatement.'
              : 'Account created successfully. Email is confirmed and user can log in immediately.')
          : (t('language') === 'fr' 
              ? 'Compte créé avec succès. L\'utilisateur devra confirmer son email pour se connecter.'
              : 'Account created successfully. User will need to confirm their email to log in.');

        toast({
          title: t('language') === 'fr' ? 'Succès' : 'Success',
          description: successMessage,
        });
      }

      // Navigate back to accounts list
      navigate('/admin/accounts');
    } catch (err: any) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} account:`, err);
      const errorMessage = err.message || (t('language') === 'fr' 
        ? `Erreur lors de ${isEdit ? 'la mise à jour' : 'la création'} du compte`
        : `Error ${isEdit ? 'updating' : 'creating'} account`);
      setError(errorMessage);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit 
                ? (t('language') === 'fr' ? 'Modifier le compte utilisateur' : 'Edit User Account')
                : (t('language') === 'fr' ? 'Créer un compte utilisateur' : 'Create User Account')
              }
            </h1>
            <p className="text-gray-600">
              {isEdit
                ? (t('language') === 'fr' 
                    ? 'Modifier les informations du compte utilisateur'
                    : 'Update user account information')
                : (t('language') === 'fr' 
                    ? 'Créer un nouveau compte utilisateur avec des paramètres personnalisés'
                    : 'Create a new user account with custom settings')
              }
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/admin/accounts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('language') === 'fr' ? 'Retour' : 'Back'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {isEdit ? <Edit className="h-5 w-5 mr-2" /> : <UserPlus className="h-5 w-5 mr-2" />}
              {t('language') === 'fr' ? 'Informations du compte' : 'Account Information'}
            </CardTitle>
            <CardDescription>
              {isEdit
                ? (t('language') === 'fr' 
                    ? 'Modifiez les informations du compte'
                    : 'Update the account information')
                : (t('language') === 'fr' 
                    ? 'Remplissez les informations pour créer un nouveau compte'
                    : 'Fill in the information to create a new account')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {t('language') === 'fr' ? 'Chargement...' : 'Loading...'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('language') === 'fr' ? 'Email' : 'Email'} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('language') === 'fr' ? 'email@example.com' : 'email@example.com'}
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t('language') === 'fr' ? 'Mot de passe' : 'Password'} {!isEdit && '*'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={isEdit 
                      ? (t('language') === 'fr' ? 'Laisser vide pour ne pas changer' : 'Leave empty to keep current')
                      : (t('language') === 'fr' ? 'Minimum 6 caractères' : 'Minimum 6 characters')
                    }
                    required={!isEdit}
                    minLength={isEdit ? 0 : 6}
                  />
                  {isEdit && (
                    <p className="text-xs text-muted-foreground">
                      {t('language') === 'fr' 
                        ? 'Laisser vide pour conserver le mot de passe actuel'
                        : 'Leave empty to keep the current password'}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">
                    {t('language') === 'fr' ? 'Nom d\'utilisateur' : 'Username'}
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder={t('language') === 'fr' ? 'Nom d\'utilisateur (optionnel)' : 'Username (optional)'}
                  />
                </div>

                {/* Subscription Type */}
                <div className="space-y-2">
                  <Label htmlFor="subscriptionType">
                    {t('language') === 'fr' ? 'Type d\'abonnement' : 'Subscription Type'}
                  </Label>
                  <Select
                    value={formData.subscriptionType}
                    onValueChange={(value: 'basic' | 'premium') => handleInputChange('subscriptionType', value)}
                  >
                    <SelectTrigger id="subscriptionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subscription Expiry */}
                <div className="space-y-2">
                  <Label htmlFor="subscriptionExpiry">
                    {t('language') === 'fr' ? 'Date d\'expiration' : 'Expiry Date'}
                  </Label>
                  <Input
                    id="subscriptionExpiry"
                    type="date"
                    value={formData.subscriptionExpiry}
                    onChange={(e) => handleInputChange('subscriptionExpiry', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">
                    {t('language') === 'fr' ? 'Compte actif' : 'Active Account'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('language') === 'fr' 
                      ? 'Les comptes inactifs ne peuvent pas se connecter'
                      : 'Inactive accounts cannot log in'
                    }
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>

              {/* Admin Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isAdmin">
                    {t('language') === 'fr' ? 'Accès administrateur' : 'Admin Access'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('language') === 'fr' 
                      ? 'Accorder les privilèges d\'administrateur à ce compte'
                      : 'Grant administrator privileges to this account'
                    }
                  </p>
                </div>
                <Switch
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) => handleInputChange('isAdmin', checked)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/accounts')}
                  disabled={isLoading}
                >
                  {t('language') === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isLoadingData}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading 
                    ? (isEdit 
                        ? (t('language') === 'fr' ? 'Mise à jour...' : 'Updating...')
                        : (t('language') === 'fr' ? 'Création...' : 'Creating...'))
                    : (isEdit 
                        ? (t('language') === 'fr' ? 'Mettre à jour le compte' : 'Update Account')
                        : (t('language') === 'fr' ? 'Créer le compte' : 'Create Account'))
                  }
                </Button>
              </div>
            </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

