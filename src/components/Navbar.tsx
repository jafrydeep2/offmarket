import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, LogOut, User, Menu, X, Phone, Mail, MapPin, Settings, Heart, Bell, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

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
    { key: 'services', path: '/services', scrollTo: 'services-section' },
    { key: 'becomeMember', path: '/become-member' },
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
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="OffMarket" 
              className="h-12 w-auto object-contain"
              data-logo
            />
          ) : (
            <span>OffMarket</span>
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
                  
                  <Link to="/dashboard">
                    <DropdownMenuItem className="px-4 py-2">
                      <BarChart3 className="mr-3 h-4 w-4" />
                      {t('language') === 'fr' ? 'Tableau de bord' : 'Dashboard'}
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link to="/profile">
                    <DropdownMenuItem className="px-4 py-2">
                      <User className="mr-3 h-4 w-4" />
                      {t('language') === 'fr' ? 'Mon Profil' : 'My Profile'}
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link to="/favorites">
                    <DropdownMenuItem className="px-4 py-2">
                      <Heart className="mr-3 h-4 w-4" />
                      {t('language') === 'fr' ? 'Mes Favoris' : 'My Favorites'}
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link to="/alerts">
                    <DropdownMenuItem className="px-4 py-2">
                      <Bell className="mr-3 h-4 w-4" />
                      {t('language') === 'fr' ? 'Mes Alertes' : 'My Alerts'}
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator />
                  
                  <Link to="/settings">
                    <DropdownMenuItem className="px-4 py-2">
                      <Settings className="mr-3 h-4 w-4" />
                      {t('language') === 'fr' ? 'Paramètres' : 'Settings'}
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={logout} className="px-4 py-2 text-destructive hover:bg-destructive/10">
                    <LogOut className="mr-3 h-4 w-4" />
                    {t('language') === 'fr' ? 'Déconnexion' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="OffMarket" 
                        className="h-6 w-auto object-contain"
                        data-logo
                      />
                    ) : (
                      <span>OffMarket</span>
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
                          {t('language') === 'fr' ? 'Déconnexion' : 'Logout'}
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