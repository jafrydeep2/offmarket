import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Mail, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { analyticsService, type AnalyticsData, type UserStats, type PropertyStats, type ActivityStats } from '@/lib/analyticsService';

export const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [analytics, users, properties, activity] = await Promise.all([
        analyticsService.getAnalyticsData(dateRange),
        analyticsService.getUserStats(),
        analyticsService.getPropertyStats(),
        analyticsService.getActivityStats()
      ]);

      setAnalyticsData(analytics);
      setUserStats(users);
      setPropertyStats(properties);
      setActivityStats(activity);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = () => {
    // TODO: Implement data export functionality
    console.log('Export analytics data');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('language') === 'fr' ? 'Analytiques' : 'Analytics'}
            </h1>
            <p className="text-gray-600">
              {t('language') === 'fr' 
                ? 'Analyse des performances de votre plateforme'
                : 'Performance analysis of your platform'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={dateRange} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setDateRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Exporter' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('language') === 'fr' ? 'Utilisateurs totaux' : 'Total Users'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('language') === 'fr' ? 'Utilisateurs actifs' : 'Active Users'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.activeUsers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('language') === 'fr' ? 'Vues totales' : 'Total Views'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.totalViews || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t('language') === 'fr' ? 'Demandes' : 'Inquiries'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.totalInquiries || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  {t('language') === 'fr' ? 'Croissance des utilisateurs' : 'User Growth'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' ? 'Évolution du nombre d\'utilisateurs' : 'User count evolution'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      {t('language') === 'fr' ? 'Graphique en cours de développement' : 'Chart in development'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Properties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  {t('language') === 'fr' ? 'Propriétés populaires' : 'Top Properties'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' ? 'Propriétés les plus consultées' : 'Most viewed properties'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {propertyStats?.topPerformingProperties.slice(0, 5).map((property, index) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {property.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {property.views} {t('language') === 'fr' ? 'vues' : 'views'}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {property.inquiries} {t('language') === 'fr' ? 'demandes' : 'inquiries'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  {t('language') === 'fr' ? 'Taux de conversion' : 'Conversion Rate'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {analyticsData?.conversionRate.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('language') === 'fr' ? 'Vues vers demandes' : 'Views to inquiries'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Average Session Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  {t('language') === 'fr' ? 'Durée moyenne' : 'Avg Session Duration'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {Math.round((analyticsData?.averageSessionDuration || 0) / 60)}m
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('language') === 'fr' ? 'Par session' : 'Per session'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Cities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  {t('language') === 'fr' ? 'Villes populaires' : 'Top Cities'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData?.topCities.slice(0, 5).map((city, index) => (
                    <div key={city.city} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{city.city}</span>
                      <span className="text-sm font-medium text-gray-500">{city.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        {analyticsData?.recentActivity && analyticsData.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  {t('language') === 'fr' ? 'Activité récente' : 'Recent Activity'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' ? 'Dernières actions des utilisateurs' : 'Latest user actions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.recentActivity.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.user && `by ${activity.user} • `}
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};