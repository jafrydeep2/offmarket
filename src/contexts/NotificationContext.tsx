import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface NotificationOptions { quiet?: boolean }

interface NotificationContextType {
  sendSubscriptionExpiryNotification: (userEmail: string, daysLeft: number, options?: NotificationOptions) => void;
  sendSubscriptionExpiredNotification: (userEmail: string, options?: NotificationOptions) => void;
  sendNewPropertyNotification: (userEmail: string, propertyTitle: string, options?: NotificationOptions) => void;
  sendWelcomeNotification: (userEmail: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  
  const sendSubscriptionExpiryNotification = (userEmail: string, daysLeft: number, options?: NotificationOptions) => {
    // In a real app, this would send an email
    console.log(`📧 Email sent to ${userEmail}: Your subscription expires in ${daysLeft} days`);
    
    // Show toast notification for demo
    if (!options?.quiet) {
      toast({
        title: "Subscription Expiring Soon",
        description: `Email sent to ${userEmail} - ${daysLeft} days remaining`,
        variant: "default",
      });
    }
  };

  const sendSubscriptionExpiredNotification = (userEmail: string, options?: NotificationOptions) => {
    // In a real app, this would send an email
    console.log(`📧 Email sent to ${userEmail}: Your subscription has expired`);
    
    // Show toast notification for demo
    if (!options?.quiet) {
      toast({
        title: "Subscription Expired",
        description: `Email sent to ${userEmail} - subscription expired`,
        variant: "destructive",
      });
    }
  };

  const sendNewPropertyNotification = (userEmail: string, propertyTitle: string, options?: NotificationOptions) => {
    // In a real app, this would send an email
    console.log(`📧 Email sent to ${userEmail}: New property available - ${propertyTitle}`);
    
    // Show toast notification for demo
    if (!options?.quiet) {
      toast({
        title: "New Property Available",
        description: `Email sent to ${userEmail} about ${propertyTitle}`,
        variant: "default",
      });
    }
  };

  const sendWelcomeNotification = (userEmail: string, options?: NotificationOptions) => {
    // In a real app, this would send an email
    console.log(`📧 Welcome email sent to ${userEmail}`);
    
    // Show toast notification for demo
    if (!options?.quiet) {
      toast({
        title: "Welcome Email Sent",
        description: `Welcome email sent to ${userEmail}`,
        variant: "default",
      });
    }
  };

  const value: NotificationContextType = {
    sendSubscriptionExpiryNotification,
    sendSubscriptionExpiredNotification,
    sendNewPropertyNotification,
    sendWelcomeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
