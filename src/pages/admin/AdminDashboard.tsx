import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  MapPin,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { useProperties } from '@/contexts/PropertyContext';
import { analyticsService, type AnalyticsData } from '@/lib/analyticsService';

// Properties Chart Component
const PropertiesChart: React.FC<{ data?: Array<{ date: string; count: number }> }> = ({ data = [] }) => {
  // Convert analytics data to chart format - limit to last 12 months
  const chartData = data.length > 0 ? data.slice(-12).map(item => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    year: new Date(item.date).getFullYear(),
    properties: item.count
  })) : [];
  
  // If no data, generate empty data for last 12 months
  if (chartData.length === 0) {
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      chartData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        properties: 0
      });
    }
  }

  const maxValue = Math.max(...chartData.map(d => d.properties));
  const minValue = Math.min(...chartData.map(d => d.properties));

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-end justify-between h-full space-x-1">
        {chartData.map((data, index) => {
          const height = ((data.properties - minValue) / (maxValue - minValue)) * 100;
          return (
            <motion.div 
              key={index} 
              className="flex flex-col items-center flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-full bg-gray-200 rounded-t-sm relative" style={{ height: '200px' }}>
                <motion.div 
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm transition-all duration-500 hover:from-purple-700 hover:to-purple-500 cursor-pointer"
                  style={{ height: `${height}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2 font-medium">
                {data.month}
              </div>
              <div className="text-xs text-gray-500">
                {data.properties}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};



const getUserStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-available text-available-foreground">Active</Badge>;
    case 'expired':
      return <Badge className="bg-sold text-sold-foreground">Expired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

interface DashboardStats {
  totalProperties: number;
  totalUsers: number;
  totalViews: number;
  totalInquiries: number;
  recentProperties: any[];
  recentUsers: any[];
  analyticsData?: AnalyticsData;
}

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { properties } = useProperties();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalUsers: 0,
    totalViews: 0,
    totalInquiries: 0,
    recentProperties: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load analytics data
        const analyticsData = await analyticsService.getAnalyticsData('30d');
        
        // Load users data
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, email, subscription_type, subscription_expiry, is_active, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (usersError) {
          console.error('Error loading users:', usersError);
        }

        // Load recent properties
        const recentProperties = properties
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 3)
          .map(prop => ({
            id: prop.id,
            title: prop.title,
            price: prop.price,
            views: prop.views || 0,
            date: prop.createdAt ? new Date(prop.createdAt).toLocaleDateString() : '—'
          }));

        // Load recent users
        const recentUsers = (usersData || []).map(user => ({
          id: user.id,
          name: user.username || 'No username',
          email: user.email,
          status: user.is_active ? 'active' : 'inactive',
          joinDate: new Date(user.created_at).toLocaleDateString(),
          propertiesViewed: 0 // This would need to be calculated from user activity
        }));

        setStats({
          totalProperties: analyticsData.totalProperties,
          totalUsers: analyticsData.totalUsers,
          totalViews: analyticsData.totalViews,
          totalInquiries: analyticsData.totalInquiries,
          recentProperties,
          recentUsers,
          analyticsData
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to basic data if analytics fails
        const totalProperties = properties.length;
        const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalInquiries = properties.reduce((sum, p) => sum + (p.inquiries || 0), 0);
        
        setStats({
          totalProperties,
          totalUsers: 0,
          totalViews,
          totalInquiries,
          recentProperties: [],
          recentUsers: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [properties]);

  const statsData = [
    {
      title: 'Total Properties',
      value: stats.totalProperties.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Building2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.totalUsers.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toString(),
      change: '+23%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries.toString(),
      change: '+15%',
      changeType: 'positive' as const,
      icon: DollarSign,
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
              {t('admin.dashboard.title')}
            </h1>
            <p className="text-gray-600">
              {t('language') === 'fr' 
                ? 'Vue d\'ensemble de votre plateforme immobilière'
                : 'Overview of your real estate platform'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/admin/properties/new">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.properties.add')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
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
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-destructive" />
                        )}
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {t('language') === 'fr' ? 'vs mois dernier' : 'vs last month'}
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

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Properties Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                {t('language') === 'fr' ? 'Propriétés par mois' : 'Properties by Month'}
              </CardTitle>
              <CardDescription>
                {t('language') === 'fr' ? 'Évolution du nombre de propriétés ajoutées' : 'Evolution of properties added'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <PropertiesChart data={stats.analyticsData?.propertyGrowth} />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                {t('language') === 'fr' ? 'Actions rapides' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/admin/properties/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.properties.add')}
                </Button>
              </Link>
              <Link to="/admin/accounts/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  {t('admin.accounts.add')}
                </Button>
              </Link>
              <Link to="/admin/properties" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  {t('language') === 'fr' ? 'Gérer les propriétés' : 'Manage Properties'}
                </Button>
              </Link>
              <Link to="/admin/accounts" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  {t('language') === 'fr' ? 'Gérer les comptes' : 'Manage Accounts'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Properties and Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-success" />
                  {t('language') === 'fr' ? 'Propriétés récentes' : 'Recent Properties'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' ? 'Dernières propriétés ajoutées' : 'Latest properties added'}
                </CardDescription>
              </div>
              <Link to="/admin/properties">
                <Button variant="ghost" size="sm">
                  {t('language') === 'fr' ? 'Voir tout' : 'View all'}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">{property.price}</span>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-3 w-3 mr-1" />
                          {property.views}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {property.price}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  {t('language') === 'fr' ? 'Utilisateurs récents' : 'Recent Users'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr' ? 'Nouveaux utilisateurs inscrits' : 'Newly registered users'}
                </CardDescription>
              </div>
              <Link to="/admin/accounts">
                <Button variant="ghost" size="sm">
                  {t('language') === 'fr' ? 'Voir tout' : 'View all'}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {t('language') === 'fr' ? 'Inscrit le' : 'Joined'} {user.joinDate}
                        </span>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Building2 className="h-3 w-3 mr-1" />
                          {user.propertiesViewed} {t('language') === 'fr' ? 'vues' : 'views'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getUserStatusBadge(user.status)}
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
