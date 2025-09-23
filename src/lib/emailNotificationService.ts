import { supabase } from './supabaseClient';
import { NotificationService } from './notificationService';

export interface EmailNotificationTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
  isActive: boolean;
}

export class EmailNotificationService {
  /**
   * Send email notification based on user preferences
   */
  static async sendEmailNotification(
    userId: string,
    templateName: string,
    variables: Record<string, string> = {}
  ) {
    try {
      // Get user preferences
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, notification_preferences, username')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return false;
      }

      // Check if user has email notifications enabled
      const preferences = user.notification_preferences;
      if (!preferences?.email) {
        console.log('User has email notifications disabled');
        return false;
      }

      // Get email template
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        console.error('Error fetching email template:', templateError);
        return false;
      }

      // Replace variables in template
      let subject = template.subject;
      let htmlContent = template.html_template;
      let textContent = template.text_template;

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        htmlContent = htmlContent.replace(regex, value);
        textContent = textContent.replace(regex, value);
      });

      // Add user-specific variables
      subject = subject.replace(/{{username}}/g, user.username || 'User');
      htmlContent = htmlContent.replace(/{{username}}/g, user.username || 'User');
      textContent = textContent.replace(/{{username}}/g, user.username || 'User');

      // Send email via Supabase Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          subject,
          html: htmlContent,
          text: textContent
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
      return false;
    }
  }

  /**
   * Send bulk email notifications
   */
  static async sendBulkEmailNotification(
    userIds: string[],
    templateName: string,
    variables: Record<string, string> = {}
  ) {
    const results = [];
    
    for (const userId of userIds) {
      const result = await this.sendEmailNotification(userId, templateName, variables);
      results.push({ userId, success: result });
    }

    return results;
  }

  /**
   * Send property alert email
   */
  static async sendPropertyAlertEmail(
    userId: string,
    property: {
      id: string;
      title: string;
      price: string;
      city: string;
      property_type: string;
      description: string;
    }
  ) {
    return this.sendEmailNotification(userId, 'property_alert', {
      property_title: property.title,
      property_price: property.price,
      property_city: property.city,
      property_type: property.property_type,
      property_description: property.description,
      property_url: `${window.location.origin}/property/${property.id}`
    });
  }

  /**
   * Send subscription expiry email
   */
  static async sendSubscriptionExpiryEmail(
    userId: string,
    daysLeft: number
  ) {
    return this.sendEmailNotification(userId, 'subscription_expiry', {
      days_left: daysLeft.toString()
    });
  }

  /**
   * Send subscription expired email
   */
  static async sendSubscriptionExpiredEmail(userId: string) {
    return this.sendEmailNotification(userId, 'subscription_expired', {});
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(userId: string) {
    return this.sendEmailNotification(userId, 'welcome', {});
  }

  /**
   * Send weekly digest email
   */
  static async sendWeeklyDigestEmail(
    userId: string,
    properties: Array<{
      id: string;
      title: string;
      price: string;
      city: string;
      property_type: string;
    }>
  ) {
    const propertiesHtml = properties.map(property => `
      <div style="border: 1px solid #e5e7eb; padding: 16px; margin: 8px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #111827;">${property.title}</h3>
        <p style="margin: 0 0 4px 0; color: #6b7280;">${property.city} • ${property.property_type}</p>
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #111827;">${property.price}</p>
        <a href="${window.location.origin}/property/${property.id}" 
           style="background: #111827; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Property
        </a>
      </div>
    `).join('');

    return this.sendEmailNotification(userId, 'weekly_digest', {
      properties_html: propertiesHtml,
      properties_count: properties.length.toString()
    });
  }

  /**
   * Create default email templates
   */
  static async createDefaultTemplates() {
    const templates = [
      {
        name: 'property_alert',
        subject: 'New Property Match - {{property_title}}',
        html_template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #111827;">New Property Match!</h1>
            <p>Hello {{username}},</p>
            <p>A new property has been added that matches your search criteria:</p>
            <div style="border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 10px 0; color: #111827;">{{property_title}}</h2>
              <p style="margin: 0 0 5px 0; color: #6b7280;">{{property_city}} • {{property_type}}</p>
              <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #111827;">{{property_price}}</p>
              <p style="margin: 0 0 15px 0; color: #374151;">{{property_description}}</p>
              <a href="{{property_url}}" 
                 style="background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Property
              </a>
            </div>
            <p>Best regards,<br/>Luxe Residences Team</p>
          </div>
        `,
        text_template: `
          New Property Match!
          
          Hello {{username}},
          
          A new property has been added that matches your search criteria:
          
          {{property_title}}
          {{property_city}} • {{property_type}}
          {{property_price}}
          
          {{property_description}}
          
          View Property: {{property_url}}
          
          Best regards,
          Luxe Residences Team
        `,
        variables: ['property_title', 'property_price', 'property_city', 'property_type', 'property_description', 'property_url'],
        is_active: true
      },
      {
        name: 'subscription_expiry',
        subject: 'Subscription Expiring Soon - {{days_left}} Days Left',
        html_template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Subscription Expiring Soon</h1>
            <p>Hello {{username}},</p>
            <p>Your subscription will expire in <strong>{{days_left}} days</strong>.</p>
            <p>To continue enjoying our exclusive property listings and services, please renew your subscription.</p>
            <a href="${window.location.origin}/settings" 
               style="background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Renew Subscription
            </a>
            <p>Best regards,<br/>Luxe Residences Team</p>
          </div>
        `,
        text_template: `
          Subscription Expiring Soon
          
          Hello {{username}},
          
          Your subscription will expire in {{days_left}} days.
          
          To continue enjoying our exclusive property listings and services, please renew your subscription.
          
          Renew Subscription: ${window.location.origin}/settings
          
          Best regards,
          Luxe Residences Team
        `,
        variables: ['days_left'],
        is_active: true
      },
      {
        name: 'welcome',
        subject: 'Welcome to Luxe Residences!',
        html_template: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #111827;">Welcome to Luxe Residences!</h1>
            <p>Hello {{username}},</p>
            <p>Welcome to our exclusive property platform! You now have access to:</p>
            <ul>
              <li>Exclusive off-market properties</li>
              <li>Personalized property alerts</li>
              <li>Direct contact with property owners</li>
              <li>Priority access to new listings</li>
            </ul>
            <a href="${window.location.origin}/properties" 
               style="background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Browse Properties
            </a>
            <p>Best regards,<br/>Luxe Residences Team</p>
          </div>
        `,
        text_template: `
          Welcome to Luxe Residences!
          
          Hello {{username}},
          
          Welcome to our exclusive property platform! You now have access to:
          - Exclusive off-market properties
          - Personalized property alerts
          - Direct contact with property owners
          - Priority access to new listings
          
          Browse Properties: ${window.location.origin}/properties
          
          Best regards,
          Luxe Residences Team
        `,
        variables: [],
        is_active: true
      }
    ];

    for (const template of templates) {
      const { error } = await supabase
        .from('email_templates')
        .upsert(template, { onConflict: 'name' });

      if (error) {
        console.error('Error creating template:', template.name, error);
      }
    }
  }
}
