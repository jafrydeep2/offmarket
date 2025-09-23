import { supabase } from './supabaseClient';

export type ActivityType = 
  | 'property_view'
  | 'search'
  | 'favorite_add'
  | 'favorite_remove'
  | 'inquiry'
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'alert_create'
  | 'alert_delete';

interface ActivityData {
  activityType: ActivityType;
  propertyId?: string;
  searchQuery?: string;
  searchFilters?: Record<string, any>;
  metadata?: Record<string, any>;
}

class UserActivityTracker {
  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  async trackActivity(data: ActivityData): Promise<void> {
    if (!this.userId) {
      console.log('No user ID set, skipping activity tracking');
      return;
    }

    try {
      const activityData = {
        user_id: this.userId,
        activity_type: data.activityType,
        property_id: data.propertyId || null,
        search_query: data.searchQuery || null,
        search_filters: data.searchFilters || null,
        metadata: data.metadata || {},
        ip_address: null, // Could be added if needed
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('user_activities')
        .insert(activityData);

      if (error) {
        console.error('Error tracking activity:', error);
      } else {
        console.log('Activity tracked:', data.activityType);
      }
    } catch (error) {
      console.error('Error in activity tracking:', error);
    }
  }

  // Convenience methods for common activities
  async trackPropertyView(propertyId: string, propertyTitle?: string): Promise<void> {
    await this.trackActivity({
      activityType: 'property_view',
      propertyId,
      metadata: { propertyTitle }
    });
  }

  async trackSearch(query: string, filters?: Record<string, any>, resultsCount?: number): Promise<void> {
    await this.trackActivity({
      activityType: 'search',
      searchQuery: query,
      searchFilters: filters,
      metadata: { resultsCount }
    });
  }

  async trackFavoriteAdd(propertyId: string, propertyTitle?: string): Promise<void> {
    await this.trackActivity({
      activityType: 'favorite_add',
      propertyId,
      metadata: { propertyTitle }
    });
  }

  async trackFavoriteRemove(propertyId: string, propertyTitle?: string): Promise<void> {
    await this.trackActivity({
      activityType: 'favorite_remove',
      propertyId,
      metadata: { propertyTitle }
    });
  }

  async trackInquiry(propertyId: string, propertyTitle?: string): Promise<void> {
    await this.trackActivity({
      activityType: 'inquiry',
      propertyId,
      metadata: { propertyTitle }
    });
  }

  async trackLogin(): Promise<void> {
    await this.trackActivity({
      activityType: 'login'
    });
  }

  async trackLogout(): Promise<void> {
    await this.trackActivity({
      activityType: 'logout'
    });
  }

  async trackProfileUpdate(): Promise<void> {
    await this.trackActivity({
      activityType: 'profile_update'
    });
  }

  async trackAlertCreate(alertType: string, criteria: Record<string, any>): Promise<void> {
    await this.trackActivity({
      activityType: 'alert_create',
      metadata: { alertType, criteria }
    });
  }

  async trackAlertDelete(alertId: string): Promise<void> {
    await this.trackActivity({
      activityType: 'alert_delete',
      metadata: { alertId }
    });
  }
}

export const userActivityTracker = new UserActivityTracker();
