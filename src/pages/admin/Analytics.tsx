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
import { supabase } from '@/lib/supabaseClient';
import { useProperties } from '@/contexts/PropertyContext';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalViews: number;
  totalInquiries: number;
  userGrowth: Array<{ date: string; count: number }>;
  propertyViews: Array<{ property: string; views: number }>;
  topCities: Array<{ city: string; count: number }>;
  userActivity: Array<{ date: string; logins: number; views: number }>;
  conversionRate: number;
  averageSessionDuration: number;
}

export const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const { properties } = useProperties();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    userGrowth: [],
    propertyViews: [],
    topCities: [],
    userActivity: [],
    conversionRate: 0,
    averageSessionDuration: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load users data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, is_active, created_at');

      if (usersError) {
        console.error('Error loading users:', usersError);
      }

      // Load user activity
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity')
        .select('activity_type, created_at')
        .gte('created_at', getDateRangeStart(dateRange));

      if (activityError) {
        console.error('Error loading activity:', activityError);
      }

      // Calculate analytics
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => u.is_active).length || 0;
      const totalProperties = properties.length;
      const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalInquiries = properties.reduce((sum, p) => sum + (p.inquiries || 0), 0);

      // User growth data (last 30 days)
      const userGrowth = calculateUserGrowth(usersData || [], dateRange);
      
      // Property views data
      const propertyViews = properties
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 10)
        .map(p => ({ property: p.title, views: p.views || 0 }));

      // Top cities
      const cityCounts = properties.reduce((acc, p) => {
        acc[p.city] = (acc[p.city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topCities = Object.entries(cityCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([city, count]) => ({ city, count }));

      // User activity data
      const userActivity = calculateUserActivity(activityData || [], dateRange);

      // Conversion rate (inquiries / views)
      const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

      setAnalyticsData({
        totalUsers,
        activeUsers,
        totalProperties,
        totalViews,
        totalInquiries,
        userGrowth,
        propertyViews,
        topCities,
        userActivity,
        conversionRate,
        averageSessionDuration: 0 // Would need session tracking
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeStart = (range: string) => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const calculateUserGrowth = (users: any[], range: string) => {
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const growth = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = users.filter(u => 
        new Date(u.created_at).toISOString().split('T')[0] <= dateStr
      ).length;
      
      growth.push({ date: dateStr, count });
    }
    
    return growth;
  };

  const calculateUserActivity = (activities: any[], range: string) => {
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const activity = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = activities.filter(a => 
        new Date(a.created_at).toISOString().split('T')[0] === dateStr
      );
      
      const logins = dayActivities.filter(a => a.activity_type === 'login').length;
      const views = dayActivities.filter(a => a.activity_type === 'property_view').length;
      
      activity.push({ date: dateStr, logins, views });
    }
    
    return activity;
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', analyticsData.totalUsers],
      ['Active Users', analyticsData.activeUsers],
      ['Total Properties', analyticsData.totalProperties],
      ['Total Views', analyticsData.totalViews],
      ['Total Inquiries', analyticsData.totalInquiries],
      ['Conversion Rate', `${analyticsData.conversionRate.toFixed(2)}%`]
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [properties, dateRange, refreshKey]);

  const statsCards = [
    {
      title: 'Total Users',
      value: analyticsData.totalUsers,
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Users',
      value: analyticsData.activeUsers,
      change: '+8%',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Views',
      value: analyticsData.totalViews,
      change: '+23%',
      icon: Eye,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Conversion Rate',
      value: `${analyticsData.conversionRate.toFixed(1)}%`,
      change: '+5%',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    }
  ];

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
                ? 'Analyse des performances et des tendances'
                : 'Performance analysis and trends'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setRefreshKey(k => k + 1)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
            <Button onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Exporter' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-500 ml-1">
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {t('language') === 'fr' ? 'vs période précédente' : 'vs previous period'}
                        </span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                {t('language') === 'fr' ? 'Croissance des utilisateurs' : 'User Growth'}
              </CardTitle>
              <CardDescription>
                {t('language') === 'fr' ? 'Évolution du nombre d\'utilisateurs' : 'User count evolution'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-1">
                {analyticsData.userGrowth.map((data, index) => {
                  const maxValue = Math.max(...analyticsData.userGrowth.map(d => d.count));
                  const height = maxValue > 0 ? (data.count / maxValue) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full bg-gray-200 rounded-t-sm relative" style={{ height: '200px' }}>
                        <motion.div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        {new Date(data.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">{data.count}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                {t('language') === 'fr' ? 'Propriétés les plus vues' : 'Most Viewed Properties'}
              </CardTitle>
              <CardDescription>
                {t('language') === 'fr' ? 'Top 10 des propriétés' : 'Top 10 properties'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.propertyViews.map((property, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.property}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{property.views}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.max(10, (property.views / Math.max(...analyticsData.propertyViews.map(p => p.views))) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                {t('language') === 'fr' ? 'Villes populaires' : 'Popular Cities'}
              </CardTitle>
              <CardDescription>
                {t('language') === 'fr' ? 'Répartition par ville' : 'Distribution by city'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.topCities.map((city, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{city.city}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{city.count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.max(10, (city.count / Math.max(...analyticsData.topCities.map(c => c.count))) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                {t('language') === 'fr' ? 'Activité des utilisateurs' : 'User Activity'}
              </CardTitle>
              <CardDescription>
                {t('language') === 'fr' ? 'Connexions et vues par jour' : 'Logins and views per day'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.userActivity.slice(-7).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(activity.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-gray-500">{activity.logins}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3 text-purple-500" />
                        <span className="text-xs text-gray-500">{activity.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
