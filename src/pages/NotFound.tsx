import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Search, MapPin, Building } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  React.useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    {
      icon: Home,
      title: t('navigation.home'),
      description: t('language') === 'fr' ? 'Retour à l\'accueil' : 'Back to home',
      href: '/'
    },
    {
      icon: Building,
      title: t('navigation.properties'),
      description: t('language') === 'fr' ? 'Voir toutes les propriétés' : 'View all properties',
      href: '/properties'
    },
    {
      icon: Search,
      title: t('language') === 'fr' ? 'Rechercher' : 'Search',
      description: t('language') === 'fr' ? 'Trouver une propriété' : 'Find a property',
      href: '/properties'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto">
          {/* 404 Content */}
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-4">
              <h1 className="text-8xl md:text-9xl font-bold text-primary/20">404</h1>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                {t('language') === 'fr' ? 'Page non trouvée' : 'Page not found'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('language') === 'fr' 
                  ? 'Désolé, la page que vous recherchez n\'existe pas ou a été déplacée. Utilisez les liens ci-dessous pour naviguer.'
                  : 'Sorry, the page you are looking for does not exist or has been moved. Use the links below to navigate.'
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="btn-primary">
                  <Home className="h-4 w-4 mr-2" />
                  {t('navigation.home')}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('language') === 'fr' ? 'Retour' : 'Go back'}
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <link.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {/* Help Section */}
          <Card className="bg-muted/20">
            <CardHeader className="text-center">
              <CardTitle>
                {t('language') === 'fr' ? 'Besoin d\'aide?' : 'Need help?'}
              </CardTitle>
              <CardDescription>
                {t('language') === 'fr' 
                  ? 'Notre équipe est là pour vous aider à trouver ce que vous cherchez'
                  : 'Our team is here to help you find what you\'re looking for'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    {t('navigation.contact')}
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  {t('language') === 'fr' ? 'Actualiser la page' : 'Refresh page'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotFound;