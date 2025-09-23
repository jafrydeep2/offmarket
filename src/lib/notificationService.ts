import { supabase } from './supabaseClient';

export interface CreateNotificationParams {
  userId?: string;
  adminId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  actionUrl?: string;
}

export class NotificationService {
  /**
   * Create a notification for a user or admin
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      console.log('Creating notification with params:', params);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.userId || null,
          admin_id: params.adminId || null,
          title: params.title,
          message: params.message,
          type: params.type,
          action_url: params.actionUrl || null,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      console.log('Notification created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Create notification for property alerts
   */
  static async createPropertyAlertNotification(userId: string, propertyTitle: string, propertyId: string) {
    return this.createNotification({
      userId,
      title: 'New Property Match',
      message: `A new property "${propertyTitle}" matches your alert criteria`,
      type: 'info',
      actionUrl: `/property/${propertyId}`
    });
  }

  /**
   * Create notification for subscription expiry
   */
  static async createSubscriptionExpiryNotification(userId: string, daysLeft: number) {
    return this.createNotification({
      userId,
      title: 'Subscription Expiring Soon',
      message: `Your subscription expires in ${daysLeft} days. Please renew to continue enjoying our services.`,
      type: 'warning',
      actionUrl: '/settings'
    });
  }

  /**
   * Create notification for subscription expired
   */
  static async createSubscriptionExpiredNotification(userId: string) {
    return this.createNotification({
      userId,
      title: 'Subscription Expired',
      message: 'Your subscription has expired. Please renew to regain access to our services.',
      type: 'error',
      actionUrl: '/settings'
    });
  }

  /**
   * Create notification for new property added (admin)
   */
  static async createNewPropertyNotification(adminId: string, propertyTitle: string, propertyId: string) {
    return this.createNotification({
      adminId,
      title: 'New Property Added',
      message: `Property "${propertyTitle}" has been successfully added to the platform`,
      type: 'success',
      actionUrl: `/admin/properties/${propertyId}`
    });
  }

  /**
   * Create notification for new user registration (admin)
   */
  static async createNewUserNotification(adminId: string, username: string, userId: string) {
    return this.createNotification({
      adminId,
      title: 'New User Registration',
      message: `New user "${username}" has registered on the platform`,
      type: 'info',
      actionUrl: `/admin/accounts/${userId}`
    });
  }

  /**
   * Create notification for form submission (admin)
   */
  static async createFormSubmissionNotification(adminId: string, formType: string, submissionId: string) {
    return this.createNotification({
      adminId,
      title: 'New Form Submission',
      message: `New ${formType} form submission received`,
      type: 'info',
      actionUrl: `/admin/form-submissions`
    });
  }

  /**
   * Create notification for inquiry (admin)
   */
  static async createInquiryNotification(adminId: string, propertyTitle: string, inquiryId: string) {
    return this.createNotification({
      adminId,
      title: 'New Property Inquiry',
      message: `New inquiry received for property "${propertyTitle}"`,
      type: 'info',
      actionUrl: `/admin/inquiries`
    });
  }

  /**
   * Create notification for system events (admin)
   */
  static async createSystemNotification(adminId: string, title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') {
    return this.createNotification({
      adminId,
      title,
      message,
      type
    });
  }

  /**
   * Create notification for system maintenance (all users)
   */
  static async createMaintenanceNotification(title: string, message: string, scheduledTime?: string) {
    try {
      // Get all active users
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);

      if (!users) return [];

      const notifications = [];
      for (const user of users) {
        const notification = await this.createNotification({
          userId: user.id,
          title,
          message: scheduledTime ? `${message} Scheduled for: ${scheduledTime}` : message,
          type: 'warning'
        });
        if (notification) notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating maintenance notifications:', error);
      return [];
    }
  }

  /**
   * Create notification for admin actions (audit log)
   */
  static async createAdminActionNotification(adminId: string, action: string, targetType: string, targetId: string) {
    return this.createNotification({
      adminId,
      title: 'Admin Action Logged',
      message: `Action: ${action} on ${targetType} (ID: ${targetId})`,
      type: 'info'
    });
  }

  /**
   * Create notification for user registration (admin)
   */
  static async createUserRegistrationNotification(adminId: string, username: string, userId: string) {
    return this.createNotification({
      adminId,
      title: 'New User Registration',
      message: `New user "${username}" has registered on the platform`,
      type: 'info',
      actionUrl: `/admin/accounts/${userId}`
    });
  }

  /**
   * Create notification for property status change (admin)
   */
  static async createPropertyStatusChangeNotification(adminId: string, propertyTitle: string, oldStatus: string, newStatus: string, propertyId: string) {
    return this.createNotification({
      adminId,
      title: 'Property Status Changed',
      message: `Property "${propertyTitle}" status changed from ${oldStatus} to ${newStatus}`,
      type: 'info',
      actionUrl: `/admin/properties/${propertyId}`
    });
  }

  /**
   * Create notification for user subscription change (admin)
   */
  static async createSubscriptionChangeNotification(adminId: string, username: string, oldType: string, newType: string, userId: string) {
    return this.createNotification({
      adminId,
      title: 'Subscription Changed',
      message: `User "${username}" subscription changed from ${oldType} to ${newType}`,
      type: 'info',
      actionUrl: `/admin/accounts/${userId}`
    });
  }

  /**
   * Create notification for system health alerts (admin)
   */
  static async createSystemHealthNotification(adminId: string, alertType: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    const typeMap = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    } as const;

    return this.createNotification({
      adminId,
      title: `System Health Alert: ${alertType}`,
      message,
      type: typeMap[severity]
    });
  }
}
