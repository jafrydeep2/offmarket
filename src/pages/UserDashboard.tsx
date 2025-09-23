import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  Eye,
  Search,
  Settings,
  Bell,
  Calendar,
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
  Edit,
  Shield,
  CreditCard,
  MessageCircle,
  LogIn,
  LogOut,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';
import { userStatsService, type UserStats } from '@/lib/userStatsService';
import { userActivityTracker } from '@/lib/userActivityTracker';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load real user stats
  useEffect(() => {
    const loadUserStats = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true);
          // Set user ID for activity tracking
          userActivityTracker.setUserId(user.id);
          
          // Debug: Let's also test a direct query
          console.log('Testing direct favorites query...');
          const { data: directFavorites, error: directError } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id);
          
          console.log('Direct favorites query result:', { directFavorites, directError });
          
          const userStats = await userStatsService.getUserStats(user.id);
          setStats(userStats);
        } catch (error) {
          console.error('Error loading user stats:', error);
          // Fallback to empty stats
          setStats({
            favoritesCount: 0,
            viewedProperties: 0,
            searchesCount: 0,
            alertsCount: 0,
            recentActivity: [],
            subscriptionStatus: { status: 'active', daysLeft: 365 }
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserStats();
  }, [isAuthenticated, user]);

  // Show loading state
  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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

  const subscriptionStatus = stats.subscriptionStatus;

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                {t('language') === 'fr'
                  ? `Bonjour, ${user.username || user.email?.split('@')[0] || 'Utilisateur'} !`
                  : `Welcome back, ${user.username || user.email?.split('@')[0] || 'User'}!`
                }
              </h1>
              <p className="text-muted-foreground text-lg">
                {t('language') === 'fr'
                  ? 'Voici un aperçu de votre activité sur OffMarket'
                  : 'Here\'s an overview of your activity on OffMarket'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
                <Badge
                  variant={subscriptionStatus.status === 'expired' ? 'destructive' : 'default'}
                  className="text-sm px-3 py-1"
                >
                  {user.subscriptionType.toUpperCase()}
                </Badge>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {t('language') === 'fr' ? 'Modifier le profil' : 'Edit Profile'}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('language') === 'fr' ? 'Favoris' : 'Favorites'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.favoritesCount}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('language') === 'fr' ? 'Propriétés vues' : 'Properties Viewed'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.viewedProperties}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('language') === 'fr' ? 'Recherches' : 'Searches'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.searchesCount}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('language') === 'fr' ? 'Alertes' : 'Alerts'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stats.alertsCount}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  {t('language') === 'fr' ? 'Abonnement' : 'Subscription'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr'
                    ? 'Gérez votre abonnement et vos factures'
                    : 'Manage your subscription and billing'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('language') === 'fr' ? 'Plan actuel' : 'Current Plan'}
                  </span>
                  <Badge variant="outline">{user.subscriptionType}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {t('language') === 'fr' ? 'Expire le' : 'Expires on'}
                    </span>
                    <span className="font-medium">
                      {new Date(user.subscriptionExpiry).toLocaleDateString()}
                    </span>
                  </div>

                  {subscriptionStatus.status === 'expiring' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {t('language') === 'fr' ? 'Jours restants' : 'Days remaining'}
                        </span>
                        <span className="font-medium">{subscriptionStatus.daysLeft}</span>
                      </div>
                      <Progress value={(subscriptionStatus.daysLeft / 30) * 100} className="h-2" />
                    </div>
                  )}
                </div>

                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  {t('language') === 'fr' ? 'Gérer l\'abonnement' : 'Manage Subscription'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {t('language') === 'fr' ? 'Activité récente' : 'Recent Activity'}
                </CardTitle>
                <CardDescription>
                  {t('language') === 'fr'
                    ? 'Vos dernières actions sur la plateforme'
                    : 'Your latest actions on the platform'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.slice(0,3).map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {activity.icon === 'Heart' && <Heart className="h-5 w-5 text-red-600" />}
                          {activity.icon === 'Eye' && <Eye className="h-5 w-5 text-blue-600" />}
                          {activity.icon === 'Search' && <Search className="h-5 w-5 text-green-600" />}
                          {activity.icon === 'MessageCircle' && <MessageCircle className="h-5 w-5 text-purple-600" />}
                          {activity.icon === 'LogIn' && <LogIn className="h-5 w-5 text-green-600" />}
                          {activity.icon === 'LogOut' && <LogOut className="h-5 w-5 text-red-600" />}
                          {activity.icon === 'Activity' && <Activity className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.property}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('language') === 'fr' 
                          ? 'Aucune activité récente' 
                          : 'No recent activity'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('language') === 'fr' 
                          ? 'Commencez à explorer des propriétés pour voir votre activité ici' 
                          : 'Start exploring properties to see your activity here'
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link to="/activity">
                    <Button variant="ghost" className="w-full">
                      {t('language') === 'fr' ? 'Voir toute l\'activité' : 'View All Activity'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                {t('language') === 'fr' ? 'Actions rapides' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/properties">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Search className="h-6 w-6" />
                    <span className="text-sm">
                      {t('language') === 'fr' ? 'Rechercher des propriétés' : 'Search Properties'}
                    </span>
                  </Button>
                </Link>

                <Link to="/favorites">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Heart className="h-6 w-6" />
                    <span className="text-sm">
                      {t('language') === 'fr' ? 'Mes favoris' : 'My Favorites'}
                    </span>
                  </Button>
                </Link>

                <Link to="/alerts">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Bell className="h-6 w-6" />
                    <span className="text-sm">
                      {t('language') === 'fr' ? 'Gérer les alertes' : 'Manage Alerts'}
                    </span>
                  </Button>
                </Link>

                <Link to="/settings">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">
                      {t('language') === 'fr' ? 'Paramètres' : 'Settings'}
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
