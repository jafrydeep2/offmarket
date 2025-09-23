import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronDown,
  User,
  Globe,
  Inbox,
  MessageSquare,
  BarChart3,
  Server,
  Mail,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabaseClient';
import { LogoService } from '@/lib/logoService';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t, language, setLanguage } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const navigation = [
    { name: t('admin.dashboard.title'), href: '/admin/dashboard', icon: LayoutDashboard, current: location.pathname === '/admin/dashboard' },
    { name: t('admin.properties.title'), href: '/admin/properties', icon: Building2, current: location.pathname.startsWith('/admin/properties') },
    { name: t('admin.accounts.title'), href: '/admin/accounts', icon: Users, current: location.pathname === '/admin/accounts' },
    { name: 'Inquiries', href: '/admin/inquiries', icon: Inbox, current: location.pathname === '/admin/inquiries' },
    { name: 'Form Submissions', href: '/admin/form-submissions', icon: MessageSquare, current: location.pathname === '/admin/form-submissions' },
    { name: 'Memberships', href: '/admin/memberships', icon: Users, current: location.pathname === '/admin/memberships' },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare, current: location.pathname === '/admin/contacts' },
    // { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: location.pathname === '/admin/analytics' },
    // { name: 'System Management', href: '/admin/system', icon: Server, current: location.pathname === '/admin/system' },
    { name: 'Email Templates', href: '/admin/email-templates', icon: Mail, current: location.pathname === '/admin/email-templates' },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, current: location.pathname === '/admin/notifications' },
    // { name: 'Media Library', href: '/admin/media', icon: ImageIcon, current: location.pathname === '/admin/media' },
    { name: t('language') === 'fr' ? 'Paramètres' : 'Settings', href: '/admin/settings', icon: Settings, current: location.pathname === '/admin/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate('/admin/login');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('admin_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

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
        .eq('admin_id', user?.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('admin_id', user?.id);

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
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
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  // Set up real-time polling for notifications
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600 opacity-75" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl lg:relative lg:flex-shrink-0 border-r border-slate-700 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700/50">
            <Link to="/admin/dashboard" className="flex items-center space-x-3">
              {logoUrl && !logoError ? (
                <img 
                  src={logoUrl} 
                  alt="OffMarket" 
                  className="h-10 w-auto object-contain"
                  data-logo
                  onError={() => {
                    console.log('Admin logo failed to load, using default logo');
                    setLogoError(true);
                    setLogoUrl(LogoService.getDefaultLogoUrl());
                  }}
                />
              ) : (
                <img 
                  src={LogoService.getDefaultLogoUrl()} 
                  alt="OffMarket" 
                  className="h-10 w-auto object-contain"
                  data-logo
                  onError={() => {
                    console.log('Admin default logo also failed to load, showing icon fallback');
                    setLogoError(true);
                  }}
                />
              )}
              {logoError && (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
              {/* <div>
                <span className="text-xl font-bold text-white">OffMarket</span>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div> */}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-700/50"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    item.current ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                <AvatarImage src="/admin-avatar.jpg" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.username || user?.email || 'Admin User'}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top header - Fixed */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Search bar */}
              <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>
              </div>

              {/* Right side items */}
              <div className="flex items-center space-x-4">
                {/* Language toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="flex items-center space-x-1 hover:bg-gray-100 hover:text-black"
                >
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">{language.toUpperCase()}</span>
                </Button>

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
                        <DropdownMenuItem onClick={clearAllNotifications} disabled={notifications.length === 0}>
                          Clear notifications
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                      <Avatar className="h-8 w-8 ring-2 ring-purple-100">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">AD</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      {t('language') === 'fr' ? 'Profil' : 'Profile'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      {t('language') === 'fr' ? 'Paramètres' : 'Settings'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('language') === 'fr' ? 'Déconnexion' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};