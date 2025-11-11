import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Bell, Globe, UploadCloud, Image as ImageIcon, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { LogoService } from '@/lib/logoService';

interface SystemSettings {
  site_name: string;
  site_tagline: string;
  default_language: string;
  logo_url: string | null;
  email_sender_name: string;
  email_sender_email: string;
  email_reply_to: string;
  maintenance_mode: boolean;
  analytics_enabled: boolean;
  backup_enabled: boolean;
  subscription_expiry_warning_days: number;
}

export const AdminSettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'Exclusimmo',
    site_tagline: 'Exclusive access to off-market properties',
    default_language: 'fr',
    logo_url: null,
    email_sender_name: 'Exclusimmo',
    email_sender_email: 'noreply@offmarket.ch',
    email_reply_to: 'support@offmarket.ch',
    maintenance_mode: false,
    analytics_enabled: true,
    backup_enabled: true,
    subscription_expiry_warning_days: 30
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');

      if (error) {
        console.error('Error loading settings:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de charger les paramètres' : 'Failed to load settings',
          variant: 'destructive'
        });
        return;
      }

      const settingsMap = data?.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, any>) || {};

      setSettings({
        site_name: settingsMap.site_name || 'Exclusimmo',
        site_tagline: settingsMap.site_tagline || 'Exclusive access to off-market properties',
        default_language: settingsMap.default_language || 'fr',
        logo_url: settingsMap.logo_url || null,
        email_sender_name: settingsMap.email_sender_name || 'Exclusimmo',
        email_sender_email: settingsMap.email_sender_email || 'noreply@offmarket.ch',
        email_reply_to: settingsMap.email_reply_to || 'support@offmarket.ch',
        maintenance_mode: settingsMap.maintenance_mode === true,
        analytics_enabled: settingsMap.analytics_enabled === true,
        backup_enabled: settingsMap.backup_enabled === true,
        subscription_expiry_warning_days: parseInt(settingsMap.subscription_expiry_warning_days) || 30
      });

      if (settingsMap.logo_url) {
        setLogoPreview(settingsMap.logo_url);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors du chargement' : 'Error loading settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Upload logo if changed
      let logoUrl = settings.logo_url;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo_${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logoFile);

        if (uploadError) {
          console.error('Error uploading logo:', uploadError);
          toast({
            title: t('language') === 'fr' ? 'Erreur' : 'Error',
            description: t('language') === 'fr' ? 'Impossible de télécharger le logo' : 'Failed to upload logo',
            variant: 'destructive'
          });
          return;
        }

        const { data: urlData } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath);

        logoUrl = urlData.publicUrl;
      }

      // Update settings in database
      const settingsToUpdate = [
        { key: 'site_name', value: settings.site_name },
        { key: 'site_tagline', value: settings.site_tagline },
        { key: 'default_language', value: settings.default_language },
        { key: 'logo_url', value: logoUrl },
        { key: 'email_sender_name', value: settings.email_sender_name },
        { key: 'email_sender_email', value: settings.email_sender_email },
        { key: 'email_reply_to', value: settings.email_reply_to },
        { key: 'maintenance_mode', value: settings.maintenance_mode },
        { key: 'analytics_enabled', value: settings.analytics_enabled },
        { key: 'backup_enabled', value: settings.backup_enabled },
        { key: 'subscription_expiry_warning_days', value: settings.subscription_expiry_warning_days }
      ];

      // Update each setting individually to avoid conflicts
      for (const setting of settingsToUpdate) {
        try {
          await updateSetting(setting.key, setting.value);
        } catch (error) {
          console.error(`Error updating setting ${setting.key}:`, error);
          toast({
            title: t('language') === 'fr' ? 'Erreur' : 'Error',
            description: t('language') === 'fr' ? `Impossible de sauvegarder ${setting.key}` : `Failed to save ${setting.key}`,
            variant: 'destructive'
          });
          return;
        }
      }

      // Update logo using the logo service
      LogoService.updateLogo(logoUrl);

      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? 'Paramètres sauvegardés' : 'Settings saved'
      });

      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      // First try to update existing record
      const { error: updateError } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (updateError) {
        // If update fails, try to insert new record
        const { error: insertError } = await supabase
          .from('system_settings')
          .insert({ key, value });

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('language') === 'fr' ? 'Paramètres' : 'Settings'}
            </h1>
            <p className="text-gray-600">
              {t('language') === 'fr' ? 'Configurez la plateforme et les préférences' : 'Configure the platform and preferences'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadSettings} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('language') === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
            <Button
              onClick={saveSettings}
              disabled={saving || loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? (t('language') === 'fr' ? 'Sauvegarde...' : 'Saving...') : (t('language') === 'fr' ? 'Sauvegarder' : 'Save Changes')}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="site" className="w-full">
          <TabsList>
            <TabsTrigger value="site">{t('language') === 'fr' ? 'Site' : 'Site'}</TabsTrigger>
            <TabsTrigger value="logo">{t('language') === 'fr' ? 'Logo' : 'Logo'}</TabsTrigger>
            <TabsTrigger value="notifications">{t('language') === 'fr' ? 'Notifications' : 'Notifications'}</TabsTrigger>
          </TabsList>

          <TabsContent value="site" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  {t('language') === 'fr' ? 'Paramètres du site' : 'Site Settings'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' ? 'Configuration de base du site' : 'Basic site configuration'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">{t('language') === 'fr' ? 'Nom du site' : 'Site Name'}</Label>
                    <Input
                      id="siteName"
                      value={settings.site_name}
                      onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                      placeholder="Exclusimmo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLang">{t('language') === 'fr' ? 'Langue par défaut' : 'Default Language'}</Label>
                    <Select 
                      value={settings.default_language} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, default_language: value }))}
                    >
                      <SelectTrigger id="defaultLang">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">{t('language') === 'fr' ? 'Slogan' : 'Tagline'}</Label>
                  <Input
                    id="tagline"
                    value={settings.site_tagline}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_tagline: e.target.value }))}
                    placeholder={t('language') === 'fr' ? 'Accès exclusif aux propriétés hors-marché' : 'Exclusive access to off-market properties'}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('language') === 'fr' ? 'Nom de l\'expéditeur' : 'Sender Name'}</Label>
                    <Input
                      value={settings.email_sender_name}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_sender_name: e.target.value }))}
                      placeholder="Exclusimmo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('language') === 'fr' ? 'Email expéditeur' : 'Sender Email'}</Label>
                    <Input
                      value={settings.email_sender_email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_sender_email: e.target.value }))}
                      placeholder="noreply@offmarket.ch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reply-To</Label>
                    <Input
                      value={settings.email_reply_to}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_reply_to: e.target.value }))}
                      placeholder="support@offmarket.ch"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{t('language') === 'fr' ? 'Mode maintenance' : 'Maintenance Mode'}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('language') === 'fr' ? 'Empêche l\'accès public pendant la maintenance' : 'Prevents public access during maintenance'}
                    </div>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenance_mode: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-pink-600" />
                  {t('language') === 'fr' ? 'Logo du site' : 'Site Logo'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' ? 'Téléchargez et gérez le logo du site' : 'Upload and manage the site logo'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain"
                        data-logo
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          {t('language') === 'fr' ? 'Télécharger un nouveau logo' : 'Upload new logo'}
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          {t('language') === 'fr' 
                            ? 'Formats supportés: JPG, PNG, SVG. Taille recommandée: 200x60px'
                            : 'Supported formats: JPG, PNG, SVG. Recommended size: 200x60px'
                          }
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="logo-upload"
                          onChange={handleLogoUpload}
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <UploadCloud className="h-4 w-4 mr-2" />
                          {t('language') === 'fr' ? 'Choisir un fichier' : 'Choose File'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {logoPreview && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-green-700">
                        {t('language') === 'fr' 
                          ? 'Nouveau logo sélectionné. Cliquez sur "Sauvegarder" pour l\'appliquer.'
                          : 'New logo selected. Click "Save" to apply it.'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-orange-600" />
                  {t('language') === 'fr' ? 'Centre de notifications' : 'Notification Center'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' ? 'Configurez les notifications système' : 'Configure system notifications'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{t('language') === 'fr' ? 'Analytics' : 'Analytics'}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Activer le suivi des analytics' : 'Enable analytics tracking'}
                      </div>
                    </div>
                    <Switch
                      checked={settings.analytics_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analytics_enabled: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{t('language') === 'fr' ? 'Sauvegarde automatique' : 'Auto Backup'}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('language') === 'fr' ? 'Activer les sauvegardes automatiques' : 'Enable automatic backups'}
                      </div>
                    </div>
                    <Switch
                      checked={settings.backup_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, backup_enabled: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warningDays">
                      {t('language') === 'fr' ? 'Jours d\'avertissement d\'expiration' : 'Subscription Expiry Warning Days'}
                    </Label>
                    <Input
                      id="warningDays"
                      type="number"
                      value={settings.subscription_expiry_warning_days}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        subscription_expiry_warning_days: parseInt(e.target.value) || 30 
                      }))}
                      min="1"
                      max="365"
                    />
                    <p className="text-sm text-gray-500">
                      {t('language') === 'fr' 
                        ? 'Nombre de jours avant l\'expiration pour envoyer un avertissement'
                        : 'Number of days before expiry to send a warning'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;


