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
  Image as ImageIcon
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

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t, language, setLanguage } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const navigation = [
    { name: t('admin.dashboard.title'), href: '/admin/dashboard', icon: LayoutDashboard, current: location.pathname === '/admin/dashboard' },
    { name: t('admin.properties.title'), href: '/admin/properties', icon: Building2, current: location.pathname.startsWith('/admin/properties') },
    { name: t('admin.accounts.title'), href: '/admin/accounts', icon: Users, current: location.pathname === '/admin/accounts' },
    { name: 'Form Submissions', href: '/admin/form-submissions', icon: MessageSquare, current: location.pathname === '/admin/form-submissions' },
    { name: 'Memberships', href: '/admin/memberships', icon: Users, current: location.pathname === '/admin/memberships' },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare, current: location.pathname === '/admin/contacts' },
    { name: 'Email Templates', href: '/admin/email-templates', icon: Mail, current: location.pathname === '/admin/email-templates' },
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

  useEffect(() => {
    // Load logo from localStorage
    const storedLogo = localStorage.getItem('site_logo');
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }

    // Listen for logo updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'site_logo') {
        setLogoUrl(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="OffMarket" 
                  className="h-10 w-auto object-contain"
                  data-logo
                />
              ) : (
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
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <div className="px-3 py-2 text-sm font-medium">Notifications</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="whitespace-normal">New property added: Cologny Villa</DropdownMenuItem>
                    <DropdownMenuItem className="whitespace-normal">3 subscriptions expiring this week</DropdownMenuItem>
                    <DropdownMenuItem className="whitespace-normal">Backup completed successfully</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Mark all as read</DropdownMenuItem>
                    <DropdownMenuItem>Clear notifications</DropdownMenuItem>
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