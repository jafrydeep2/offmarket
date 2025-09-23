import { supabase } from './supabaseClient';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalViews: number;
  totalInquiries: number;
  userGrowth: Array<{ date: string; count: number }>;
  propertyGrowth: Array<{ date: string; count: number }>;
  propertyViews: Array<{ property: string; views: number }>;
  topCities: Array<{ city: string; count: number }>;
  userActivity: Array<{ date: string; logins: number; views: number }>;
  conversionRate: number;
  averageSessionDuration: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
    property?: string;
  }>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersBySubscription: Array<{ type: string; count: number }>;
  userRetention: number;
}

export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  featuredProperties: number;
  totalViews: number;
  totalInquiries: number;
  averageViewsPerProperty: number;
  topPerformingProperties: Array<{
    id: string;
    title: string;
    views: number;
    inquiries: number;
  }>;
  propertiesByCity: Array<{ city: string; count: number }>;
  propertiesByType: Array<{ type: string; count: number }>;
}

export interface ActivityStats {
  totalSessions: number;
  averageSessionDuration: number;
  totalPageViews: number;
  totalSearches: number;
  topSearchQueries: Array<{ query: string; count: number }>;
  userEngagement: number;
  bounceRate: number;
}

class AnalyticsService {
  async getAnalyticsData(dateRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    try {
      // Get basic counts
      const [usersResult, propertiesResult, viewsResult, inquiriesResult] = await Promise.all([
        supabase.from('profiles').select('id, is_active, created_at'),
        supabase.from('properties').select('id, views, inquiries, city, property_type, title, created_at'),
        supabase.from('property_views').select('id, viewed_at').gte('viewed_at', startDate.toISOString()),
        supabase.from('inquiries').select('id, created_at').gte('created_at', startDate.toISOString())
      ]);

      const users = usersResult.data || [];
      const properties = propertiesResult.data || [];
      const views = viewsResult.data || [];
      const inquiries = inquiriesResult.data || [];

      // Calculate user growth
      const userGrowth = this.calculateUserGrowth(users, startDate, endDate);
      
      // Calculate property growth by month
      const propertyGrowth = this.calculatePropertyGrowth(properties, startDate, endDate);
      
      // Calculate property views
      const propertyViews = properties
        .map(p => ({ property: p.title, views: p.views || 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Calculate top cities
      const topCities = this.calculateTopCities(properties);

      // Calculate user activity
      const userActivity = await this.calculateUserActivity(startDate, endDate);

      // Calculate conversion rate
      const conversionRate = views.length > 0 ? (inquiries.length / views.length) * 100 : 0;

      // Calculate average session duration
      const averageSessionDuration = await this.calculateAverageSessionDuration(startDate, endDate);

      // Get recent activity
      const recentActivity = await this.getRecentActivity();

      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalProperties: properties.length,
        totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0),
        totalInquiries: inquiries.length,
        userGrowth,
        propertyGrowth,
        propertyViews,
        topCities,
        userActivity,
        conversionRate,
        averageSessionDuration,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const [usersResult, todayUsers, weekUsers, monthUsers] = await Promise.all([
        supabase.from('profiles').select('id, is_active, subscription_type, created_at'),
        supabase.from('profiles').select('id').gte('created_at', this.getStartOfDay().toISOString()),
        supabase.from('profiles').select('id').gte('created_at', this.getStartOfWeek().toISOString()),
        supabase.from('profiles').select('id').gte('created_at', this.getStartOfMonth().toISOString())
      ]);

      const users = usersResult.data || [];
      const today = todayUsers.data || [];
      const week = weekUsers.data || [];
      const month = monthUsers.data || [];

      // Calculate users by subscription type
      const usersBySubscription = users.reduce((acc, user) => {
        const type = user.subscription_type || 'basic';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const subscriptionArray = Object.entries(usersBySubscription).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count
      }));

      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        newUsersToday: today.length,
        newUsersThisWeek: week.length,
        newUsersThisMonth: month.length,
        usersBySubscription: subscriptionArray,
        userRetention: 0 // TODO: Calculate retention rate
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async getPropertyStats(): Promise<PropertyStats> {
    try {
      const [propertiesResult, viewsResult, inquiriesResult] = await Promise.all([
        supabase.from('properties').select('id, title, views, inquiries, city, property_type, featured'),
        supabase.from('property_views').select('property_id'),
        supabase.from('inquiries').select('property_id')
      ]);

      const properties = propertiesResult.data || [];
      const views = viewsResult.data || [];
      const inquiries = inquiriesResult.data || [];

      const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalInquiries = inquiries.length;

      // Top performing properties
      const topPerformingProperties = properties
        .map(p => ({
          id: p.id,
          title: p.title,
          views: p.views || 0,
          inquiries: inquiries.filter(i => i.property_id === p.id).length
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Properties by city
      const propertiesByCity = this.calculateTopCities(properties);

      // Properties by type
      const propertiesByType = properties.reduce((acc, p) => {
        const type = p.property_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const typeArray = Object.entries(propertiesByType).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count
      }));

      return {
        totalProperties: properties.length,
        activeProperties: properties.length, // All properties are considered active
        featuredProperties: properties.filter(p => p.featured).length,
        totalViews,
        totalInquiries,
        averageViewsPerProperty: properties.length > 0 ? totalViews / properties.length : 0,
        topPerformingProperties,
        propertiesByCity,
        propertiesByType: typeArray
      };
    } catch (error) {
      console.error('Error fetching property stats:', error);
      throw error;
    }
  }

  async getActivityStats(): Promise<ActivityStats> {
    try {
      const [sessionsResult, searchesResult] = await Promise.all([
        supabase.from('user_sessions').select('duration_seconds, page_views, properties_viewed'),
        supabase.from('search_queries').select('query, searched_at')
      ]);

      const sessions = sessionsResult.data || [];
      const searches = searchesResult.data || [];

      const totalSessions = sessions.length;
      const totalPageViews = sessions.reduce((sum, s) => sum + (s.page_views || 0), 0);
      const totalSearches = searches.length;

      const averageSessionDuration = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length 
        : 0;

      // Top search queries
      const searchCounts = searches.reduce((acc, search) => {
        const query = search.query.toLowerCase().trim();
        if (query) {
          acc[query] = (acc[query] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topSearchQueries = Object.entries(searchCounts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalSessions,
        averageSessionDuration: Math.round(averageSessionDuration),
        totalPageViews,
        totalSearches,
        topSearchQueries,
        userEngagement: 0, // TODO: Calculate engagement rate
        bounceRate: 0 // TODO: Calculate bounce rate
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  }

  async trackUserActivity(
    userId: string,
    activityType: string,
    propertyId?: string,
    searchQuery?: string,
    searchFilters?: any,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase.rpc('track_user_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_property_id: propertyId,
        p_search_query: searchQuery,
        p_search_filters: searchFilters,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  async trackPropertyView(propertyId: string, userId?: string): Promise<void> {
    try {
      await supabase.rpc('track_property_view', {
        p_property_id: propertyId,
        p_user_id: userId
      });
    } catch (error) {
      console.error('Error tracking property view:', error);
    }
  }

  async trackSearchQuery(
    userId: string,
    query: string,
    filters?: any,
    resultsCount: number = 0
  ): Promise<void> {
    try {
      await supabase.rpc('track_search_query', {
        p_user_id: userId,
        p_query: query,
        p_filters: filters,
        p_results_count: resultsCount
      });
    } catch (error) {
      console.error('Error tracking search query:', error);
    }
  }

  private calculateUserGrowth(users: any[], startDate: Date, endDate: Date) {
    const growth: Array<{ date: string; count: number }> = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const count = users.filter(u => 
        new Date(u.created_at).toISOString().split('T')[0] <= dateStr
      ).length;
      
      growth.push({ date: dateStr, count });
      current.setDate(current.getDate() + 1);
    }
    
    return growth;
  }

  private calculatePropertyGrowth(properties: any[], startDate: Date, endDate: Date) {
    // Get the last 12 months from the end date
    const months: Array<{ date: string; count: number }> = [];
    const current = new Date(endDate);
    
    // Go back 12 months
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      
      // Count properties created in this month
      const count = properties.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;
      
      months.unshift({
        date: monthStart.toISOString().split('T')[0],
        count
      });
      
      // Move to previous month
      current.setMonth(current.getMonth() - 1);
    }
    
    return months;
  }

  private calculateTopCities(properties: any[]): Array<{ city: string; count: number }> {
    const cityCounts = properties.reduce((acc, p) => {
      const city = p.city || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private async calculateUserActivity(startDate: Date, endDate: Date) {
    // This would typically query user_activities table
    // For now, return mock data structure
    return [
      { date: '2024-01-01', logins: 10, views: 25 },
      { date: '2024-01-02', logins: 15, views: 30 },
      // ... more data
    ];
  }

  private async calculateAverageSessionDuration(startDate: Date, endDate: Date) {
    try {
      const { data } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .gte('session_start', startDate.toISOString())
        .lte('session_start', endDate.toISOString())
        .not('duration_seconds', 'is', null);

      if (!data || data.length === 0) return 0;

      const totalDuration = data.reduce((sum, session) => sum + (session.duration_seconds || 0), 0);
      return Math.round(totalDuration / data.length);
    } catch (error) {
      console.error('Error calculating average session duration:', error);
      return 0;
    }
  }

  private async getRecentActivity() {
    try {
      const { data } = await supabase
        .from('user_activities')
        .select(`
          id,
          activity_type,
          created_at,
          user_id,
          property_id,
          search_query,
          profiles!user_activities_user_id_fkey(username, email),
          properties!user_activities_property_id_fkey(title)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      return (data || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type,
        description: this.getActivityDescription(activity),
        timestamp: activity.created_at,
        user: Array.isArray(activity.profiles) ? (activity.profiles[0]?.username || activity.profiles[0]?.email) : (activity.profiles?.username || activity.profiles?.email),
        property: Array.isArray(activity.properties) ? activity.properties[0]?.title : activity.properties?.title
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
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

  private getStartOfDay(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getStartOfWeek(): Date {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getStartOfMonth(): Date {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}

export const analyticsService = new AnalyticsService();
