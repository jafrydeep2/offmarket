import { supabase } from './supabaseClient';

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications: number;
  notificationsByType: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
  notificationsByDay: Array<{
    date: string;
    count: number;
    read: number;
    unread: number;
  }>;
  topNotificationTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  userEngagement: {
    totalUsers: number;
    usersWithNotifications: number;
    averageNotificationsPerUser: number;
  };
}

export class NotificationAnalytics {
  /**
   * Get comprehensive notification analytics
   */
  static async getNotificationStats(adminId?: string): Promise<NotificationStats | null> {
    try {
      // Base query
      let query = supabase
        .from('notifications')
        .select('*');

      // Filter by admin if provided
      if (adminId) {
        query = query.eq('admin_id', adminId);
      }

      const { data: notifications, error } = await query;

      if (error) {
        console.error('Error fetching notification stats:', error);
        return null;
      }

      if (!notifications) return null;

      // Calculate basic stats
      const totalNotifications = notifications.length;
      const unreadNotifications = notifications.filter(n => !n.is_read).length;
      const readNotifications = notifications.filter(n => n.is_read).length;

      // Notifications by type
      const notificationsByType = {
        info: notifications.filter(n => n.type === 'info').length,
        success: notifications.filter(n => n.type === 'success').length,
        warning: notifications.filter(n => n.type === 'warning').length,
        error: notifications.filter(n => n.type === 'error').length,
      };

      // Notifications by day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const notificationsByDay = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayNotifications = notifications.filter(n => 
          n.created_at.startsWith(dateStr)
        );
        
        notificationsByDay.push({
          date: dateStr,
          count: dayNotifications.length,
          read: dayNotifications.filter(n => n.is_read).length,
          unread: dayNotifications.filter(n => !n.is_read).length,
        });
      }

      // Top notification types
      const typeCounts = Object.entries(notificationsByType)
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalNotifications > 0 ? (count / totalNotifications) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      // User engagement stats
      const uniqueUsers = new Set(notifications.map(n => n.user_id).filter(Boolean));
      const totalUsers = uniqueUsers.size;
      const usersWithNotifications = uniqueUsers.size;
      const averageNotificationsPerUser = totalUsers > 0 ? totalNotifications / totalUsers : 0;

      return {
        totalNotifications,
        unreadNotifications,
        readNotifications,
        notificationsByType,
        notificationsByDay: notificationsByDay.reverse(), // Most recent first
        topNotificationTypes: typeCounts,
        userEngagement: {
          totalUsers,
          usersWithNotifications,
          averageNotificationsPerUser: Math.round(averageNotificationsPerUser * 100) / 100
        }
      };
    } catch (error) {
      console.error('Error calculating notification stats:', error);
      return null;
    }
  }

  /**
   * Get notification performance metrics
   */
  static async getNotificationPerformance(adminId?: string) {
    try {
      let query = supabase
        .from('notifications')
        .select('*');

      if (adminId) {
        query = query.eq('admin_id', adminId);
      }

      const { data: notifications, error } = await query;

      if (error || !notifications) return null;

      // Calculate read rate
      const totalNotifications = notifications.length;
      const readNotifications = notifications.filter(n => n.is_read).length;
      const readRate = totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;

      // Calculate average time to read (for read notifications)
      const readNotificationsWithTime = notifications
        .filter(n => n.is_read)
        .map(n => {
          const created = new Date(n.created_at);
          const read = new Date(n.updated_at || n.created_at);
          return read.getTime() - created.getTime();
        });

      const averageTimeToRead = readNotificationsWithTime.length > 0
        ? readNotificationsWithTime.reduce((a, b) => a + b, 0) / readNotificationsWithTime.length
        : 0;

      // Convert to hours
      const averageTimeToReadHours = averageTimeToRead / (1000 * 60 * 60);

      // Calculate notification frequency by type
      const typeFrequency = notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        readRate: Math.round(readRate * 100) / 100,
        averageTimeToReadHours: Math.round(averageTimeToReadHours * 100) / 100,
        typeFrequency,
        totalNotifications,
        readNotifications,
        unreadNotifications: totalNotifications - readNotifications
      };
    } catch (error) {
      console.error('Error calculating notification performance:', error);
      return null;
    }
  }

  /**
   * Get user notification preferences analytics
   */
  static async getUserNotificationPreferences() {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('notification_preferences, is_admin')
        .not('notification_preferences', 'is', null);

      if (error || !profiles) return null;

      const preferences = {
        email: 0,
        push: 0,
        sms: 0,
        propertyAlerts: 0,
        priceUpdates: 0,
        newProperties: 0,
        weeklyDigest: 0,
        totalUsers: profiles.length,
        adminUsers: profiles.filter(p => p.is_admin).length,
        regularUsers: profiles.filter(p => !p.is_admin).length
      };

      profiles.forEach(profile => {
        const prefs = profile.notification_preferences;
        if (prefs) {
          if (prefs.email) preferences.email++;
          if (prefs.push) preferences.push++;
          if (prefs.sms) preferences.sms++;
          if (prefs.propertyAlerts) preferences.propertyAlerts++;
          if (prefs.priceUpdates) preferences.priceUpdates++;
          if (prefs.newProperties) preferences.newProperties++;
          if (prefs.weeklyDigest) preferences.weeklyDigest++;
        }
      });

      // Calculate percentages
      const percentages = {
        email: Math.round((preferences.email / preferences.totalUsers) * 100),
        push: Math.round((preferences.push / preferences.totalUsers) * 100),
        sms: Math.round((preferences.sms / preferences.totalUsers) * 100),
        propertyAlerts: Math.round((preferences.propertyAlerts / preferences.totalUsers) * 100),
        priceUpdates: Math.round((preferences.priceUpdates / preferences.totalUsers) * 100),
        newProperties: Math.round((preferences.newProperties / preferences.totalUsers) * 100),
        weeklyDigest: Math.round((preferences.weeklyDigest / preferences.totalUsers) * 100),
      };

      return {
        counts: preferences,
        percentages
      };
    } catch (error) {
      console.error('Error calculating user notification preferences:', error);
      return null;
    }
  }

  /**
   * Get notification trends over time
   */
  static async getNotificationTrends(days: number = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error || !notifications) return null;

      // Group by day
      const trends = notifications.reduce((acc, notification) => {
        const date = notification.created_at.split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
            read: 0,
            unread: 0,
            byType: { info: 0, success: 0, warning: 0, error: 0 }
          };
        }
        
        acc[date].total++;
        if (notification.is_read) {
          acc[date].read++;
        } else {
          acc[date].unread++;
        }
        const typeKey = notification.type as 'info' | 'success' | 'warning' | 'error';
        if (typeKey in acc[date].byType) {
          acc[date].byType[typeKey]++;
        }

        return acc;
      }, {} as Record<string, any>);

      return Object.values(trends).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Error calculating notification trends:', error);
      return null;
    }
  }
}
