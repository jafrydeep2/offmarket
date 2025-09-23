import React, { useEffect, useState } from 'react';
import { 
  Server, 
  Database, 
  Shield, 
  Settings, 
  Download, 
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  memoryUsage: number;
  diskUsage: number;
  cpuUsage: number;
  activeConnections: number;
  lastBackup: string;
  databaseSize: string;
  errorCount: number;
}

interface SystemSettings {
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  backupEnabled: boolean;
  backupFrequency: string;
  maxLoginAttempts: number;
  sessionTimeout: number;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export const SystemManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: '0d 0h 0m',
    memoryUsage: 0,
    diskUsage: 0,
    cpuUsage: 0,
    activeConnections: 0,
    lastBackup: 'Never',
    databaseSize: '0 MB',
    errorCount: 0
  });
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    analyticsEnabled: true,
    backupEnabled: true,
    backupFrequency: 'daily',
    maxLoginAttempts: 5,
    sessionTimeout: 3600,
    maxFileSize: 10485760,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
  });
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Load system settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('key, value');

      if (settingsError) {
        console.error('Error loading settings:', settingsError);
      } else {
        const settingsMap = settingsData?.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, any>) || {};

        setSettings({
          maintenanceMode: settingsMap.maintenance_mode === true,
          analyticsEnabled: settingsMap.analytics_enabled === true,
          backupEnabled: settingsMap.backup_enabled === true,
          backupFrequency: settingsMap.backup_frequency || 'daily',
          maxLoginAttempts: parseInt(settingsMap.max_login_attempts) || 5,
          sessionTimeout: parseInt(settingsMap.session_timeout) || 3600,
          maxFileSize: parseInt(settingsMap.max_file_size) || 10485760,
          allowedFileTypes: settingsMap.allowed_file_types || ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
        });
      }

      // Load system health (mock data for now)
      setSystemHealth({
        status: 'healthy',
        uptime: '15d 3h 42m',
        memoryUsage: 65,
        diskUsage: 42,
        cpuUsage: 23,
        activeConnections: 127,
        lastBackup: '2 hours ago',
        databaseSize: '2.4 GB',
        errorCount: 3
      });

    } catch (error) {
      console.error('Error loading system data:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Impossible de charger les données système' : 'Failed to load system data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value });

      if (error) {
        console.error('Error updating setting:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de mettre à jour le paramètre' : 'Failed to update setting',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? 'Paramètre mis à jour' : 'Setting updated'
      });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const createBackup = async () => {
    try {
      setBackupLoading(true);
      
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? 'Sauvegarde créée avec succès' : 'Backup created successfully'
      });
      
      // Update last backup time
      setSystemHealth(prev => ({
        ...prev,
        lastBackup: 'Just now'
      }));
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Impossible de créer la sauvegarde' : 'Failed to create backup',
        variant: 'destructive'
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const exportSettings = () => {
    const data = {
      settings,
      systemHealth,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('language') === 'fr' ? 'Gestion du système' : 'System Management'}
            </h1>
            <p className="text-gray-600">
              {t('language') === 'fr' 
                ? 'Surveillance et configuration du système'
                : 'System monitoring and configuration'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => loadSystemData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Exporter' : 'Export'}
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <div className="flex items-center mt-2">
                    <Badge className={`${getStatusColor(systemHealth.status)} flex items-center`}>
                      {getStatusIcon(systemHealth.status)}
                      <span className="ml-1 capitalize">{systemHealth.status}</span>
                    </Badge>
                  </div>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{systemHealth.uptime}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Connections</p>
                  <p className="text-2xl font-bold text-gray-900">{systemHealth.activeConnections}</p>
                </div>
                <Wifi className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Database Size</p>
                  <p className="text-2xl font-bold text-gray-900">{systemHealth.databaseSize}</p>
                </div>
                <Database className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MemoryStick className="h-5 w-5 mr-2 text-blue-600" />
                {t('language') === 'fr' ? 'Utilisation des ressources' : 'Resource Usage'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CPU Usage</span>
                  <span>{systemHealth.cpuUsage}%</span>
                </div>
                <Progress value={systemHealth.cpuUsage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>{systemHealth.memoryUsage}%</span>
                </div>
                <Progress value={systemHealth.memoryUsage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Disk Usage</span>
                  <span>{systemHealth.diskUsage}%</span>
                </div>
                <Progress value={systemHealth.diskUsage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-600" />
                {t('language') === 'fr' ? 'Sauvegarde' : 'Backup'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium">{systemHealth.lastBackup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto Backup</span>
                <Switch 
                  checked={settings.backupEnabled}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, backupEnabled: checked }));
                    updateSetting('backup_enabled', checked);
                  }}
                />
              </div>
              <Button 
                onClick={createBackup} 
                disabled={backupLoading}
                className="w-full"
              >
                {backupLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('language') === 'fr' ? 'Création...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {t('language') === 'fr' ? 'Créer une sauvegarde' : 'Create Backup'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              {t('language') === 'fr' ? 'Paramètres système' : 'System Settings'}
            </CardTitle>
            <CardDescription>
              {t('language') === 'fr' ? 'Configuration avancée du système' : 'Advanced system configuration'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Maintenance Mode</p>
                    <p className="text-xs text-gray-500">Enable maintenance mode</p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => {
                      setSettings(prev => ({ ...prev, maintenanceMode: checked }));
                      updateSetting('maintenance_mode', checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Analytics</p>
                    <p className="text-xs text-gray-500">Enable analytics tracking</p>
                  </div>
                  <Switch 
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) => {
                      setSettings(prev => ({ ...prev, analyticsEnabled: checked }));
                      updateSetting('analytics_enabled', checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto Backup</p>
                    <p className="text-xs text-gray-500">Enable automatic backups</p>
                  </div>
                  <Switch 
                    checked={settings.backupEnabled}
                    onCheckedChange={(checked) => {
                      setSettings(prev => ({ ...prev, backupEnabled: checked }));
                      updateSetting('backup_enabled', checked);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setSettings(prev => ({ ...prev, maxLoginAttempts: value }));
                      updateSetting('max_login_attempts', value);
                    }}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Session Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setSettings(prev => ({ ...prev, sessionTimeout: value }));
                      updateSetting('session_timeout', value);
                    }}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Max File Size (bytes)</label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setSettings(prev => ({ ...prev, maxFileSize: value }));
                      updateSetting('max_file_size', value);
                    }}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
