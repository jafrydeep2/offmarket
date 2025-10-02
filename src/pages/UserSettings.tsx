import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Bell, 
  Globe, 
  Shield, 
  Trash2, 
  Download,
  ArrowLeft,
  Save,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export const UserSettings: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
      propertyAlerts: true,
      priceUpdates: true,
      newProperties: false,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      dataSharing: false
    },
    preferences: {
      language: 'en',
      timezone: 'Europe/Zurich',
      currency: 'CHF',
      dateFormat: 'DD/MM/YYYY'
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    // Only redirect to login if we're definitely not authenticated
    // Don't redirect during state updates or if we have user data
    if (!isAuthenticated && !user) {
      navigate('/login');
      return;
    }

    // Only initialize settings if we have a valid user
    if (user) {
      // Load settings from database
      loadUserSettings();
      
      // Initialize settings with current language
      setSettings(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          language: language
        }
      }));
    }
  }, [isAuthenticated, user, navigate, language]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    setMessage(null);
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
    setMessage(null);
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
    setMessage(null);
  };

  // Load settings from database
  const loadUserSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences, privacy_settings, user_preferences')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user settings:', error);
        return;
      }

      if (data) {
        setSettings(prev => ({
          notifications: data.notification_preferences || prev.notifications,
          privacy: data.privacy_settings || prev.privacy,
          preferences: data.user_preferences || prev.preferences
        }));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Save notification preferences to database
      const { error: settingsError } = await supabase
        .from('profiles')
        .update({
          notification_preferences: settings.notifications,
          privacy_settings: settings.privacy,
          user_preferences: settings.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (settingsError) {
        throw new Error(settingsError.message);
      }
      
      // Update language if changed
      if (settings.preferences.language !== language) {
        setLanguage(settings.preferences.language as 'en' | 'fr');
      }
      
      setMessage({ 
        type: 'success', 
        text: t('language') === 'fr' ? 'Paramètres sauvegardés avec succès' : 'Settings saved successfully' 
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ 
        type: 'error', 
        text: t('language') === 'fr' ? 'Erreur lors de la sauvegarde des paramètres' : 'Error saving settings' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual data export
      // const data = await exportUserData();
      
      // Simulate data export
      const data = {
        user: user,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offmarket-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ 
        type: 'success', 
        text: t('language') === 'fr' ? 'Données exportées avec succès' : 'Data exported successfully' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: t('language') === 'fr' ? 'Erreur lors de l\'export des données' : 'Error exporting data' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage({ 
        type: 'error', 
        text: t('language') === 'fr' ? 'Veuillez entrer votre mot de passe' : 'Please enter your password' 
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual account deletion
      // const result = await deleteAccount(deletePassword);
      
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Logout and redirect
      await logout();
      navigate('/');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: t('language') === 'fr' ? 'Erreur lors de la suppression du compte' : 'Error deleting account' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show loading or redirect if we truly have no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('language') === 'fr' ? 'Retour' : 'Back'}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                {t('language') === 'fr' ? 'Paramètres' : 'Settings'}
              </h1>
              <p className="text-muted-foreground">
                {t('language') === 'fr' 
                  ? 'Personnalisez votre expérience et gérez vos préférences'
                  : 'Customize your experience and manage your preferences'
                }
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  {t('language') === 'fr' ? 'Notifications' : 'Notifications'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' 
                    ? 'Choisissez comment vous souhaitez être notifié'
                    : 'Choose how you want to be notified'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {t('language') === 'fr' ? 'Notifications par email' : 'Email Notifications'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Recevoir des notifications par email' : 'Receive notifications via email'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(value) => handleNotificationChange('email', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {t('language') === 'fr' ? 'Alertes de propriétés' : 'Property Alerts'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Être alerté des nouvelles propriétés correspondant à vos critères' : 'Get alerted about new properties matching your criteria'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.propertyAlerts}
                      onCheckedChange={(value) => handleNotificationChange('propertyAlerts', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {t('language') === 'fr' ? 'Mises à jour de prix' : 'Price Updates'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Être notifié des changements de prix' : 'Get notified about price changes'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.priceUpdates}
                      onCheckedChange={(value) => handleNotificationChange('priceUpdates', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {t('language') === 'fr' ? 'Résumé hebdomadaire' : 'Weekly Digest'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Recevoir un résumé hebdomadaire de l\'activité' : 'Receive a weekly summary of activity'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyDigest}
                      onCheckedChange={(value) => handleNotificationChange('weeklyDigest', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  {t('language') === 'fr' ? 'Confidentialité' : 'Privacy'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' 
                    ? 'Contrôlez la visibilité de vos informations'
                    : 'Control the visibility of your information'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">
                      {t('language') === 'fr' ? 'Visibilité du profil' : 'Profile Visibility'}
                    </Label>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          {t('language') === 'fr' ? 'Privé' : 'Private'}
                        </SelectItem>
                        <SelectItem value="public">
                          {t('language') === 'fr' ? 'Public' : 'Public'}
                        </SelectItem>
                        <SelectItem value="friends">
                          {t('language') === 'fr' ? 'Amis seulement' : 'Friends Only'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {t('language') === 'fr' ? 'Autoriser les messages' : 'Allow Messages'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Permettre aux autres utilisateurs de vous envoyer des messages' : 'Allow other users to send you messages'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowMessages}
                      onCheckedChange={(value) => handlePrivacyChange('allowMessages', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {t('language') === 'fr' ? 'Partage de données' : 'Data Sharing'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Partager des données anonymisées pour améliorer le service' : 'Share anonymized data to improve the service'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onCheckedChange={(value) => handlePrivacyChange('dataSharing', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div> */}

          {/* Preferences */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {t('language') === 'fr' ? 'Préférences' : 'Preferences'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' 
                    ? 'Personnalisez l\'affichage et la langue'
                    : 'Customize display and language'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">
                      {t('language') === 'fr' ? 'Langue' : 'Language'}
                    </Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => handlePreferenceChange('language', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">
                      {t('language') === 'fr' ? 'Devise' : 'Currency'}
                    </Label>
                    <Select
                      value={settings.preferences.currency}
                      onValueChange={(value) => handlePreferenceChange('currency', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHF">CHF (Franc Suisse)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="USD">USD (Dollar US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div> */}

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              {/* <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  {t('language') === 'fr' ? 'Gestion des données' : 'Data Management'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' 
                    ? 'Exportez ou supprimez vos données'
                    : 'Export or delete your data'
                  }
                </CardDescription>
              </CardHeader> */}
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {t('language') === 'fr' ? 'Exporter mes données' : 'Export My Data'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Télécharger une copie de toutes vos données' : 'Download a copy of all your data'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('language') === 'fr' ? 'Exporter' : 'Export'}
                    </Button>
                  </div>

                  <Separator /> */}

                  <div className="space-y-4 mt-5">
                    <div className="space-y-0.5">
                      <Label className="text-base text-red-600">
                        {t('language') === 'fr' ? 'Supprimer mon compte' : 'Delete My Account'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Cette action est irréversible et supprimera définitivement votre compte' : 'This action is irreversible and will permanently delete your account'}
                      </p>
                    </div>
                    
                    {!showDeleteConfirm ? (
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('language') === 'fr' ? 'Supprimer le compte' : 'Delete Account'}
                      </Button>
                    ) : (
                      <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                        <p className="text-sm text-red-800">
                          {t('language') === 'fr' 
                            ? 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
                            : 'Are you sure you want to delete your account? This action is irreversible.'
                          }
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="deletePassword">
                            {t('language') === 'fr' ? 'Confirmez avec votre mot de passe' : 'Confirm with your password'}
                          </Label>
                          <Input
                            id="deletePassword"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder={t('language') === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            disabled={isLoading || !deletePassword}
                          >
                            {isLoading 
                              ? (t('language') === 'fr' ? 'Suppression...' : 'Deleting...')
                              : (t('language') === 'fr' ? 'Confirmer la suppression' : 'Confirm Deletion')
                            }
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeletePassword('');
                            }}
                          >
                            {t('language') === 'fr' ? 'Annuler' : 'Cancel'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-end"
          >
            {message && (
              <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-4">
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </div>
              </Alert>
            )}
            
            <Button 
              onClick={handleSaveSettings} 
              disabled={isLoading}
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading 
                ? (t('language') === 'fr' ? 'Sauvegarde...' : 'Saving...')
                : (t('language') === 'fr' ? 'Sauvegarder les paramètres' : 'Save Settings')
              }
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
