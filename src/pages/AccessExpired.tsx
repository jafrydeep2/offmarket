import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Mail, Phone, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const AccessExpiredPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('language') === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
        </Link>

        {/* Main Card */}
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-3xl font-heading text-warning">
              {t('auth.accessExpired')}
            </CardTitle>
            <CardDescription className="text-warning/80 text-lg">
              {t('language') === 'fr' 
                ? 'Votre accès privilégié a expiré. Contactez votre conseiller pour le renouveler.'
                : 'Your privileged access has expired. Contact your advisor to renew it.'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                {t('language') === 'fr' ? 'Contactez votre conseiller' : 'Contact your advisor'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">support@offmarket.ch</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Téléphone</p>
                    <p className="text-sm text-muted-foreground">+41 22 123 45 67</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="flex-1">
                <Button className="w-full btn-primary">
                  <Mail className="h-4 w-4 mr-2" />
                  {t('language') === 'fr' ? 'Envoyer un message' : 'Send a message'}
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('language') === 'fr' ? 'Réessayer' : 'Try again'}
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('language') === 'fr' 
                  ? 'Votre conseiller vous aidera à renouveler votre accès et à continuer à profiter de nos propriétés exclusives.'
                  : 'Your advisor will help you renew your access and continue enjoying our exclusive properties.'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {t('language') === 'fr' 
                  ? 'Temps de réponse moyen: 2-4 heures ouvrées'
                  : 'Average response time: 2-4 business hours'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Reminder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {t('language') === 'fr' ? 'Pourquoi renouveler?' : 'Why renew?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🏠</span>
                </div>
                <h4 className="font-semibold text-foreground">
                  {t('language') === 'fr' ? 'Propriétés Exclusives' : 'Exclusive Properties'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('language') === 'fr' 
                    ? 'Accès à des biens hors-marché'
                    : 'Access to off-market properties'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">📞</span>
                </div>
                <h4 className="font-semibold text-foreground">
                  {t('language') === 'fr' ? 'Contact Direct' : 'Direct Contact'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('language') === 'fr' 
                    ? 'Informations de contact des propriétaires'
                    : 'Property owner contact information'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold text-foreground">
                  {t('language') === 'fr' ? 'Accès Prioritaire' : 'Priority Access'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('language') === 'fr' 
                    ? 'Nouvelles opportunités en premier'
                    : 'New opportunities first'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
