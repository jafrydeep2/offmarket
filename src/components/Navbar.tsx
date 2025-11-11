import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, LogOut, User, Menu, X, Phone, Mail, MapPin, Settings, Heart, Bell, BarChart3, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabaseClient';
import { LogoService } from '@/lib/logoService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setNotificationsLoading(true);
      console.log('Fetching notifications for user:', user.id);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log('User notifications fetched:', data);
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  // Format notification time
  const formatNotificationTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    // Load logo using the logo service
    const loadLogo = async () => {
      const logo = await LogoService.loadLogo();
      setLogoUrl(logo);
      setLogoError(false); // Reset error state when loading new logo
    };

    loadLogo();

    // Subscribe to logo changes
    const unsubscribe = LogoService.subscribe((logo) => {
      setLogoUrl(logo);
      setLogoError(false); // Reset error state when logo changes
    });

    return unsubscribe;
  }, []);

  // Fetch notifications when user is available
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id]);

  // Set up real-time polling for notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  // Test function to create a user notification (for debugging)
  const createTestUserNotification = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Test User Notification',
          message: 'This is a test notification created from user side',
          type: 'info',
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating test notification:', error);
        return;
      }

      console.log('Test notification created:', data);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  const handleNavClick = (item: any) => {
    if (item.scrollTo) {
      if (location.pathname === '/') {
        // If we're on the home page, scroll to the section
        const element = document.getElementById(item.scrollTo);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          return;
        }
      } else {
        // If we're not on the home page, navigate to home first, then scroll
        window.location.href = '/#' + item.scrollTo;
        return;
      }
    }
    // Otherwise, navigate normally
    window.location.href = item.path;
  };

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'properties', path: '/properties' },
    { key: 'services', path: '/', scrollTo: 'off-market-services' },
    ...(isAuthenticated ? [] : [{ key: 'becomeMember', path: '/become-member' }]),
    { key: 'contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-light sticky top-0 z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-3 text-2xl font-heading font-bold text-foreground hover:text-primary transition-all duration-300"
        >
          {logoUrl && !logoError ? (
            <img 
              src={logoUrl} 
              alt="Exclusimmo" 
              className="h-12 w-auto object-contain"
              data-logo
              onError={() => {
                console.log('Logo failed to load, using default logo');
                setLogoError(true);
                setLogoUrl(LogoService.getDefaultLogoUrl());
              }}
            />
          ) : (
            <img 
              src={LogoService.getDefaultLogoUrl()} 
              alt="Exclusimmo" 
              className="h-12 w-auto object-contain"
              data-logo
              onError={() => {
                console.log('Default logo also failed to load, showing text fallback');
                setLogoError(true);
              }}
            />
          )}
          {logoError && (
            <span className="ml-2">Exclusimmo</span>
          )}
        </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item)}
                className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg group ${
                  location.pathname === item.path 
                    ? 'text-primary bg-primary/10' 
                    : 'text-foreground hover:text-primary hover:bg-gray-light'
                }`}
              >
                {t(`navigation.${item.key}`)}
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Desktop Language Switcher & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-light transition-all duration-200"
            >
              <Globe className="h-4 w-4 text-foreground" />
              <span className="text-sm font-medium text-foreground uppercase">
                {language}
              </span>
            </Button>
            
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="px-3 py-2 text-sm font-medium flex items-center justify-between">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {unreadCount} unread
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    
                    {notificationsLoading ? (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No notifications
                      </div>
                    ) : (
                      <>
                        {notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="whitespace-normal p-3 cursor-pointer"
                            onClick={() => {
                              if (!notification.is_read) {
                                markAsRead(notification.id);
                              }
                              if (notification.action_url) {
                                navigate(notification.action_url);
                              }
                            }}
                          >
                            <div className="flex items-start space-x-3 w-full">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatNotificationTime(notification.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={markAllAsRead} disabled={unreadCount === 0}>
                          Mark all as read
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={createTestUserNotification}>
                          Create Test Notification
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2 px-4 py-2 border-border text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                      <User className="h-4 w-4" />
                      <span className="font-medium uppercase">{user?.username ? user?.username : user?.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium text-foreground uppercase">
                      {user?.username ? user?.username : user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  
                  {/* <Link to="/dashboard">
                    <DropdownMenuItem className="px-4 py-2">
                      <BarChart3 className="mr-3 h-4 w-4" />
                      {t('language') === 'fr' ? 'Tableau de bord' : 'Dashboard'}
                    </DropdownMenuItem>
                  </Link> */}
                  
                  <Link to="/profile">
                    <DropdownMenuItem className="px-4 py-2">
                      <User className="mr-3 h-4 w-4" />
                      {t('userPanel.menu.myProfile')}
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link to="/favorites">
                    <DropdownMenuItem className="px-4 py-2">
                      <Heart className="mr-3 h-4 w-4" />
                      {t('userPanel.menu.myFavorites')}
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link to="/alerts">
                    <DropdownMenuItem className="px-4 py-2">
                      <Bell className="mr-3 h-4 w-4" />
                      {t('userPanel.menu.myAlerts')}
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator />
                  
                  <Link to="/settings">
                    <DropdownMenuItem className="px-4 py-2">
                      <Settings className="mr-3 h-4 w-4" />
                      {t('userPanel.menu.settings')}
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={logout} className="px-4 py-2 text-destructive hover:bg-destructive/10">
                    <LogOut className="mr-3 h-4 w-4" />
                    {t('userPanel.common.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-6 py-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 font-semibold"
                >
                  {t('navigation.login')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2 py-2 rounded-lg hover:bg-gray-light transition-all duration-200"
            >
              <Globe className="h-4 w-4 text-foreground" />
              <span className="text-xs font-medium text-foreground uppercase">
                {language}
              </span>
            </Button>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 py-2">
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-left text-xl font-heading font-bold text-foreground flex items-center space-x-3">
                    {logoUrl && !logoError ? (
                      <img 
                        src={logoUrl} 
                        alt="Exclusimmo" 
                        className="h-6 w-auto object-contain"
                        data-logo
                        onError={() => {
                          console.log('Mobile logo failed to load, using default logo');
                          setLogoError(true);
                          setLogoUrl(LogoService.getDefaultLogoUrl());
                        }}
                      />
                    ) : (
                      <img 
                        src={LogoService.getDefaultLogoUrl()} 
                        alt="Exclusimmo" 
                        className="h-6 w-auto object-contain"
                        data-logo
                        onError={() => {
                          console.log('Mobile default logo also failed to load, showing text fallback');
                          setLogoError(true);
                        }}
                      />
                    )}
                    {logoError && (
                      <span className="ml-2">Exclusimmo</span>
                    )}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-4">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          handleNavClick(item);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-base font-semibold transition-all duration-300 rounded-lg group ${
                          location.pathname === item.path 
                            ? 'text-primary bg-primary/10' 
                            : 'text-foreground hover:text-primary hover:bg-gray-light'
                        }`}
                      >
                        {t(`navigation.${item.key}`)}
                      </button>
                    ))}
                  </div>

                  {/* Mobile Auth Section */}
                  <div className="pt-4 border-t border-gray-light">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 px-4 py-2">
                          <User className="h-5 w-5 text-foreground" />
                          <span className="font-medium text-foreground">{user?.username}</span>
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-base font-semibold text-destructive hover:bg-destructive/10 transition-all duration-300 rounded-lg"
                        >
                          <LogOut className="inline h-4 w-4 mr-3" />
                          {t('userPanel.common.logout')}
                        </button>
                      </div>
                    ) : (
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full px-6 py-3 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 font-semibold"
                        >
                          {t('navigation.login')}
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="pt-4 border-t border-gray-light">
                    <h3 className="text-sm font-semibold text-foreground mb-3 px-4">
                      {t('language') === 'fr' ? 'Contact' : 'Contact'}
                    </h3>
                    <div className="space-y-2 px-4">
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>+41 22 123 45 67</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>info@offmarket.ch</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Rue du Rhône 12, 1204 Genève</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};