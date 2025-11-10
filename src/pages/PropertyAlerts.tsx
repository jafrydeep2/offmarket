import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Filter,
  MapPin,
  Home,
  Calendar,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabaseClient';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import { CitySuggestion } from '@/lib/cityService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Removed unused Select imports - now using NativeSelect
import { NativeSelect, NativeSelectItem } from '@/components/ui/NativeSelect';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface PropertyAlert {
  id: string;
  user_id: string;
  transaction_type: 'rent' | 'sale';
  property_type: 'apartment' | 'house' | 'villa' | 'land';
  max_budget?: number;
  min_budget?: number;
  location?: string;
  min_rooms?: number;
  max_rooms?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PropertyAlertsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { user: currentUser, isLoading: authLoading } = useAppSelector((state) => state.auth);

  const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingAlert, setEditingAlert] = useState<PropertyAlert | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState('manage');
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'create') {
      setSuccess('');
      setError('');
    }
  };
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);

  // Handle city selection
  const handleCitySelect = (suggestion: CitySuggestion) => {
    setSelectedCity(suggestion);
    setFormData(prev => ({ ...prev, location: suggestion.name }));
  };

  // Handle input change for location
  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    // Clear selected city when user types manually
    if (!value) {
      setSelectedCity(null);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    transaction_type: '' as 'rent' | 'sale' | '',
    property_type: '' as 'apartment' | 'house' | 'villa' | 'land' | '',
    min_budget: '',
    max_budget: '',
    location: '',
    min_rooms: '',
    max_rooms: ''
  });

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) {
      return;
    }

    // Only redirect to login if we're definitely not authenticated
    // Don't redirect during state updates or if we have user data
    if (!isAuthenticated && !currentUser) {
      console.log('PropertyAlerts: Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // Only fetch alerts if we have a valid user
    if (currentUser) {
      console.log('PropertyAlerts: User authenticated, fetching alerts');
      fetchAlerts();
    }
  }, [isAuthenticated, currentUser, authLoading, navigate]);

  // Separate effect to handle auth state changes without causing redirects
  useEffect(() => {
    // Only fetch alerts when we have a user and are not loading
    if (currentUser && !authLoading && !isLoading) {
      fetchAlerts();
    }
  }, [currentUser, authLoading]);

  const fetchAlerts = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(''); // Clear any previous errors
    try {
      const { data, error } = await supabase
        .from('property_alerts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        // Don't throw error, just set it in state to prevent logout
        setError(t('alerts.errorLoading'));
        return;
      }
      setAlerts(data || []);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      setError(t('alerts.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError('');
    setSuccess('');

    if (!formData.transaction_type || !formData.property_type) {
      setError(t('alerts.selectTransactionType'));
      return;
    }

    setIsCreating(true);
    try {
      const payload: any = {
        user_id: currentUser.id,
        transaction_type: formData.transaction_type,
        property_type: formData.property_type,
        is_active: true
      };

      if (formData.min_budget) {
        const minBudget = Number(formData.min_budget.replace(/[^0-9.]/g, ''));
        if (!Number.isFinite(minBudget) || minBudget <= 0) {
          throw new Error(t('alerts.invalidMinBudget'));
        }
        payload.min_budget = minBudget;
      }

      if (formData.max_budget) {
        const maxBudget = Number(formData.max_budget.replace(/[^0-9.]/g, ''));
        if (!Number.isFinite(maxBudget) || maxBudget <= 0) {
          throw new Error(t('alerts.invalidMaxBudget'));
        }
        payload.max_budget = maxBudget;
      }

      if (formData.location) {
        payload.location = formData.location;
      }

      // Handle room range
      if (formData.min_rooms || formData.max_rooms) {
        if (formData.min_rooms) {
          const minRooms = Number(formData.min_rooms);
          if (!Number.isFinite(minRooms) || minRooms < 1) {
            throw new Error(t('alerts.invalidMinRooms'));
          }
          payload.min_rooms = minRooms;
        }
        
        if (formData.max_rooms) {
          const maxRooms = Number(formData.max_rooms);
          if (!Number.isFinite(maxRooms) || maxRooms < 1) {
            throw new Error(t('alerts.invalidMaxRooms'));
          }
          payload.max_rooms = maxRooms;
        }
        
        // Validate range
        if (formData.min_rooms && formData.max_rooms) {
          const minRooms = Number(formData.min_rooms);
          const maxRooms = Number(formData.max_rooms);
          if (minRooms > maxRooms) {
            throw new Error(t('alerts.invalidRoomRange'));
          }
        }
      }

      const { error: insertError } = await supabase
        .from('property_alerts')
        .insert(payload);

      if (insertError) throw insertError;

      setSuccess(t('alerts.createdSuccess'));
      setFormData({
        transaction_type: '',
        property_type: '',
        min_budget: '',
        max_budget: '',
        location: '',
        min_rooms: '',
        max_rooms: ''
      });
      setActiveTab('manage');
      setSelectedCity(null);
      fetchAlerts();
    } catch (err: any) {
      console.error('Error creating alert:', err);
      setError(err.message || t('alerts.errorCreating'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('property_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, is_active: isActive } : alert
      ));
    } catch (err: any) {
      console.error('Error toggling alert:', err);
      setError(t('alerts.errorUpdating'));
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm(t('alerts.deleteConfirm'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('property_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setSuccess(t('alerts.deletedSuccess'));
    } catch (err: any) {
      console.error('Error deleting alert:', err);
      setError(t('alerts.errorDeleting'));
    }
  };

  const handleEditAlert = (alert: PropertyAlert) => {
    setEditingAlert(alert);
    setIsEditing(alert.id);
    setFormData({
      transaction_type: alert.transaction_type,
      property_type: alert.property_type,
      min_budget: alert.min_budget ? alert.min_budget.toString() : '',
      max_budget: alert.max_budget ? alert.max_budget.toString() : '',
      location: alert.location || '',
      min_rooms: alert.min_rooms ? alert.min_rooms.toString() : '',
      max_rooms: alert.max_rooms ? alert.max_rooms.toString() : ''
    });
    handleTabChange('create');
  };

  const handleUpdateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editingAlert) return;

    setError('');
    setSuccess('');

    if (!formData.transaction_type || !formData.property_type) {
      setError(t('alerts.selectTransactionType'));
      return;
    }

    setIsCreating(true);
    try {
      const payload: any = {
        transaction_type: formData.transaction_type,
        property_type: formData.property_type,
        is_active: editingAlert.is_active
      };

      if (formData.min_budget) {
        const minBudget = Number(formData.min_budget.replace(/[^0-9.]/g, ''));
        if (!Number.isFinite(minBudget) || minBudget <= 0) {
          throw new Error(t('alerts.invalidMinBudget'));
        }
        payload.min_budget = minBudget;
      } else {
        payload.min_budget = null;
      }

      if (formData.max_budget) {
        const maxBudget = Number(formData.max_budget.replace(/[^0-9.]/g, ''));
        if (!Number.isFinite(maxBudget) || maxBudget <= 0) {
          throw new Error(t('alerts.invalidMaxBudget'));
        }
        payload.max_budget = maxBudget;
      } else {
        payload.max_budget = null;
      }

      if (formData.location) {
        payload.location = formData.location;
      } else {
        payload.location = null;
      }

      // Handle room range
      if (formData.min_rooms || formData.max_rooms) {
        if (formData.min_rooms) {
          const minRooms = Number(formData.min_rooms);
          if (!Number.isFinite(minRooms) || minRooms < 1) {
            throw new Error(t('alerts.invalidMinRooms'));
          }
          payload.min_rooms = minRooms;
        } else {
          payload.min_rooms = null;
        }
        
        if (formData.max_rooms) {
          const maxRooms = Number(formData.max_rooms);
          if (!Number.isFinite(maxRooms) || maxRooms < 1) {
            throw new Error(t('alerts.invalidMaxRooms'));
          }
          payload.max_rooms = maxRooms;
        } else {
          payload.max_rooms = null;
        }
        
        // Validate range
        if (formData.min_rooms && formData.max_rooms) {
          const minRooms = Number(formData.min_rooms);
          const maxRooms = Number(formData.max_rooms);
          if (minRooms > maxRooms) {
            throw new Error(t('alerts.invalidRoomRange'));
          }
        }
      } else {
        payload.min_rooms = null;
        payload.max_rooms = null;
      }

      const { error: updateError } = await supabase
        .from('property_alerts')
        .update(payload)
        .eq('id', editingAlert.id);

      if (updateError) throw updateError;

      setSuccess(t('alerts.updatedSuccess'));
      setFormData({
        transaction_type: '',
        property_type: '',
        min_budget: '',
        max_budget: '',
        location: '',
        min_rooms: '',
        max_rooms: ''
      });
      setEditingAlert(null);
      setIsEditing(null);
      setActiveTab('manage');
      setSelectedCity(null);
      fetchAlerts();
    } catch (err: any) {
      console.error('Error updating alert:', err);
      setError(err.message || t('alerts.errorUpdating'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAlert(null);
    setIsEditing(null);
    setFormData({
      transaction_type: '',
      property_type: '',
      min_budget: '',
      max_budget: '',
      location: '',
      min_rooms: '',
      max_rooms: ''
    });
    setSelectedCity(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      apartment: t('alerts.apartment'),
      house: t('alerts.house'),
      villa: t('alerts.villa'),
      land: t('alerts.land')
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      rent: t('alerts.rent'),
      sale: t('alerts.sale')
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return (
    <ErrorBoundary>
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
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('language') === 'fr' ? 'Retour' : 'Back'}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground flex items-center">
                <Bell className="h-8 w-8 mr-3 text-primary" />
                {t('alerts.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('alerts.subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>{t('alerts.manage')}</span>
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>{t('alerts.create')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Manage Alerts Tab */}
            <TabsContent value="manage" className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                  </div>
                </div>
              ) : alerts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t('alerts.noAlerts')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('alerts.noAlertsSubtitle')}
                    </p>
                    <Button onClick={() => handleTabChange('create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('alerts.createFirstAlert')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="relative group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardHeader className="relative pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="relative">
                                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl shadow-sm">
                                  <Home className="h-6 w-6 text-primary" />
                                </div>
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${alert.is_active ? 'bg-green-500' : 'bg-gray-400'} shadow-sm`} />
                              </div>
                              <div className="space-y-1">
                                <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                  {getPropertyTypeLabel(alert.property_type)} - {getTransactionTypeLabel(alert.transaction_type)}
                                </CardTitle>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>{t('alerts.createdOn')} {new Date(alert.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={alert.is_active ? 'default' : 'secondary'}
                                  className={`px-3 py-1 text-xs font-medium ${alert.is_active
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                  {alert.is_active ? t('alerts.active') : t('alerts.inactive')}
                                </Badge>
                                <Switch
                                  checked={alert.is_active}
                                  onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                                  className="data-[state=checked]:bg-primary"
                                />
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="relative space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alert.location && (
                              <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('alerts.location')}</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.location}</p>
                                </div>
                              </div>
                            )}
                            {(alert.min_rooms || alert.max_rooms) && (
                              <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                  <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('alerts.rooms')}</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {alert.min_rooms && alert.max_rooms 
                                      ? `${alert.min_rooms} - ${alert.max_rooms} rooms`
                                      : alert.min_rooms 
                                        ? `${alert.min_rooms}+ rooms`
                                        : `Up to ${alert.max_rooms} rooms`
                                    }
                                  </p>
                                </div>
                              </div>
                            )}
                            {(alert.min_budget || alert.max_budget) && (
                              <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                  <Home className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('property.price')}</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {alert.min_budget && alert.max_budget
                                      ? `${formatCurrency(alert.min_budget)} - ${formatCurrency(alert.max_budget)}`
                                      : alert.min_budget
                                        ? `Min: ${formatCurrency(alert.min_budget)}`
                                        : `Max: ${formatCurrency(alert.max_budget)}`
                                    }
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {t('alerts.lastUpdated')} {new Date(alert.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAlert(alert)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {t('alerts.edit')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAlert(alert.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('alerts.delete')}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Create Alert Tab */}
            <TabsContent value="create" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                      {isEditing ? <Edit className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {isEditing ? t('alerts.editAlert') : t('alerts.createNew')}
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        {isEditing ? t('alerts.editSubtitle') : t('alerts.createSubtitle')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <form onSubmit={isEditing ? handleUpdateAlert : handleCreateAlert} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="transaction_type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('alerts.transactionType')} *
                        </Label>
                        <NativeSelect
                          value={formData.transaction_type}
                          onValueChange={(value: 'rent' | 'sale') => setFormData(prev => ({ ...prev, transaction_type: value }))}
                          className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-colors"
                          placeholder={t('alerts.select')}
                        >
                          <NativeSelectItem value="rent">{t('alerts.rent')}</NativeSelectItem>
                          <NativeSelectItem value="sale">{t('alerts.sale')}</NativeSelectItem>
                        </NativeSelect>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="property_type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('alerts.propertyType')} *
                        </Label>
                        <NativeSelect
                          value={formData.property_type}
                          onValueChange={(value: 'apartment' | 'house' | 'villa' | 'land') => setFormData(prev => ({ ...prev, property_type: value }))}
                          className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-colors"
                          placeholder={t('alerts.select')}
                        >
                          <NativeSelectItem value="apartment">{t('alerts.apartment')}</NativeSelectItem>
                          <NativeSelectItem value="house">{t('alerts.house')}</NativeSelectItem>
                          <NativeSelectItem value="villa">{t('alerts.villa')}</NativeSelectItem>
                          <NativeSelectItem value="land">{t('alerts.land')}</NativeSelectItem>
                        </NativeSelect>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="location" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('alerts.location')}
                        </Label>
                        <CityAutocomplete
                          value={formData.location || ''}
                          onChange={handleLocationChange}
                          onSelect={handleCitySelect}
                          placeholder={t('alerts.searchCity')}
                          variant="alert"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('alerts.rooms')}
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="min_rooms"
                              type="number"
                              min="1"
                              step="0.5"
                              placeholder={t('alerts.minRoomsPlaceholder') || 'Min rooms'}
                              value={formData.min_rooms}
                              onChange={(e) => setFormData(prev => ({ ...prev, min_rooms: e.target.value }))}
                              className="h-12 pl-10 border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="relative">
                            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="max_rooms"
                              type="number"
                              min="1"
                              step="0.5"
                              placeholder={t('alerts.maxRoomsPlaceholder') || 'Max rooms'}
                              value={formData.max_rooms}
                              onChange={(e) => setFormData(prev => ({ ...prev, max_rooms: e.target.value }))}
                              className="h-12 pl-10 border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-colors"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('alerts.roomsHelpText') || 'Leave empty to search all room counts'}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="min_budget" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('alerts.minBudget')}
                        </Label>
                        <div className="relative">
                          <Input
                            id="min_budget"
                            placeholder={t('alerts.minBudgetPlaceholder')}
                            value={formData.min_budget}
                            onChange={(e) => setFormData(prev => ({ ...prev, min_budget: e.target.value }))}
                            className="h-12 pl-4 border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="max_budget" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t('alerts.maxBudget')}
                        </Label>
                        <div className="relative">
                          <Input
                            id="max_budget"
                            placeholder={t('alerts.maxBudgetPlaceholder')}
                            value={formData.max_budget}
                            onChange={(e) => setFormData(prev => ({ ...prev, max_budget: e.target.value }))}
                            className="h-12 pl-4 border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={isEditing ? handleCancelEdit : () => setActiveTab('manage')}
                      >
                        {t('alerts.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isCreating}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        {isCreating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {isEditing ? t('alerts.updating') : t('alerts.creating')}
                          </>
                        ) : (
                          <>
                            {isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            {isEditing ? t('alerts.updateAlert') : t('alerts.createAlert')}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PropertyAlertsPage;