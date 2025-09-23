import { supabase } from './supabaseClient';

export interface UserStats {
  favoritesCount: number;
  viewedProperties: number;
  searchesCount: number;
  alertsCount: number;
  recentActivity: Array<{
    id: string;
    type: string;
    property: string;
    timestamp: string;
    icon: string;
  }>;
  subscriptionStatus: {
    status: 'active' | 'expiring' | 'expired';
    daysLeft: number;
  };
}

class UserStatsService {
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      console.log('Fetching user stats for user:', userId);
      
      // First, let's test if we can access the favorites table at all
      const { data: testFavorites, error: testError } = await supabase
        .from('favorites')
        .select('*')
        .limit(5);
      
      console.log('Test favorites query:', { testFavorites, testError });
      
      // Test with the specific user ID
      const { data: userFavorites, error: userFavoritesError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId);
      
      console.log('User-specific favorites query:', { userFavorites, userFavoritesError });
      
      // Check if the user ID format is correct
      console.log('User ID type and value:', { userId, type: typeof userId, length: userId?.length });
      
      // Let's also check what the current auth user is
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('Current auth user:', { authUser: authUser?.id, type: typeof authUser?.id });
      
      const [
        favoritesResult,
        viewsResult,
        searchesResult,
        alertsResult,
        activityResult
      ] = await Promise.all([
        // Get favorites count
        supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', userId),
        
        // Get viewed properties count
        supabase
          .from('property_views')
          .select('id')
          .eq('user_id', userId),
        
        // Get searches count
        supabase
          .from('search_queries')
          .select('id')
          .eq('user_id', userId),
        
        // Get alerts count (property_alerts doesn't have is_active column, so we get all)
        supabase
          .from('property_alerts')
          .select('id')
          .eq('user_id', userId),
        
        // Get recent activity
        supabase
          .from('user_activities')
          .select(`
            id,
            activity_type,
            created_at,
            properties!user_activities_property_id_fkey(title)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Log detailed results for debugging
      console.log('User stats query results:', {
        favorites: {
          data: favoritesResult.data,
          error: favoritesResult.error,
          count: favoritesResult.data?.length || 0
        },
        views: {
          data: viewsResult.data,
          error: viewsResult.error,
          count: viewsResult.data?.length || 0
        },
        searches: {
          data: searchesResult.data,
          error: searchesResult.error,
          count: searchesResult.data?.length || 0
        },
        alerts: {
          data: alertsResult.data,
          error: alertsResult.error,
          count: alertsResult.data?.length || 0
        },
        activities: {
          data: activityResult.data,
          error: activityResult.error,
          count: activityResult.data?.length || 0
        }
      });

      const favoritesCount = favoritesResult.data?.length || 0;
      const viewedProperties = viewsResult.data?.length || 0;
      const searchesCount = searchesResult.data?.length || 0;
      const alertsCount = alertsResult.data?.length || 0;

      // Process recent activity
      const recentActivity = (activityResult.data || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type,
        property: activity.properties?.title || 'Unknown Property',
        timestamp: this.formatTimestamp(activity.created_at),
        icon: this.getActivityIcon(activity.activity_type)
      }));

      // Get subscription status
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_expiry')
        .eq('id', userId)
        .single();

      const subscriptionStatus = this.calculateSubscriptionStatus(profile?.subscription_expiry);

      const stats = {
        favoritesCount,
        viewedProperties,
        searchesCount,
        alertsCount,
        recentActivity,
        subscriptionStatus
      };

      console.log('Final user stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        favoritesCount: 0,
        viewedProperties: 0,
        searchesCount: 0,
        alertsCount: 0,
        recentActivity: [],
        subscriptionStatus: { status: 'active', daysLeft: 365 }
      };
    }
  }

  async getUserActivityHistory(userId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          id,
          activity_type,
          created_at,
          search_query,
          properties!user_activities_property_id_fkey(title, city)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type,
        description: this.getActivityDescription(activity),
        timestamp: activity.created_at,
        property: activity.properties?.title,
        city: activity.properties?.city
      }));
    } catch (error) {
      console.error('Error fetching user activity history:', error);
      return [];
    }
  }

  async getUserPropertyViews(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('property_views')
        .select(`
          id,
          viewed_at,
          properties!property_views_property_id_fkey(
            id,
            title,
            city,
            price,
            property_type,
            images
          )
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(view => ({
        id: view.id,
        property: view.properties,
        viewedAt: view.viewed_at
      }));
    } catch (error) {
      console.error('Error fetching user property views:', error);
      return [];
    }
  }

  async getUserSearchHistory(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('search_queries')
        .select('id, query, filters, results_count, searched_at')
        .eq('user_id', userId)
        .order('searched_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(search => ({
        id: search.id,
        query: search.query,
        filters: search.filters,
        resultsCount: search.results_count,
        searchedAt: search.searched_at
      }));
    } catch (error) {
      console.error('Error fetching user search history:', error);
      return [];
    }
  }

  private formatTimestamp(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  private getActivityIcon(activityType: string): string {
    switch (activityType) {
      case 'property_view':
        return 'Eye';
      case 'search':
        return 'Search';
      case 'favorite_add':
        return 'Heart';
      case 'favorite_remove':
        return 'HeartOff';
      case 'inquiry':
        return 'MessageCircle';
      case 'login':
        return 'LogIn';
      case 'logout':
        return 'LogOut';
      default:
        return 'Activity';
    }
  }

  private getActivityDescription(activity: any): string {
    switch (activity.activity_type) {
      case 'property_view':
        return `Viewed property: ${activity.properties?.title || 'Unknown'}`;
      case 'search':
        return `Searched for: ${activity.search_query || 'Unknown'}`;
      case 'favorite_add':
        return `Added to favorites: ${activity.properties?.title || 'Unknown'}`;
      case 'favorite_remove':
        return `Removed from favorites: ${activity.properties?.title || 'Unknown'}`;
      case 'inquiry':
        return `Made inquiry about: ${activity.properties?.title || 'Unknown'}`;
      case 'login':
        return 'Logged in';
      case 'logout':
        return 'Logged out';
      default:
        return 'Unknown activity';
    }
  }

  private calculateSubscriptionStatus(expiryDate?: string): { status: 'active' | 'expiring' | 'expired'; daysLeft: number } {
    if (!expiryDate) {
      return { status: 'active', daysLeft: 365 };
    }

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { status: 'expired', daysLeft: 0 };
    } else if (daysLeft < 30) {
      return { status: 'expiring', daysLeft };
    } else {
      return { status: 'active', daysLeft };
    }
  }
}

export const userStatsService = new UserStatsService();
