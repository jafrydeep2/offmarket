import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Eye, Lock, Phone } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SafetyPage: React.FC = () => {
  const { t } = useTranslation();

  const safetyTips = [
    {
      icon: Eye,
      title: t('language') === 'fr' ? 'Vérifiez l\'Identité' : 'Verify Identity',
      description: t('language') === 'fr' 
        ? 'Toujours vérifier l\'identité de votre interlocuteur avant de partager des informations personnelles ou de planifier des visites.'
        : 'Always verify the identity of your contact before sharing personal information or scheduling visits.'
    },
    {
      icon: Phone,
      title: t('language') === 'fr' ? 'Communication Sécurisée' : 'Secure Communication',
      description: t('language') === 'fr' 
        ? 'Utilisez uniquement les canaux de communication officiels fournis par OffMarket pour vos échanges.'
        : 'Use only official communication channels provided by OffMarket for your exchanges.'
    },
    {
      icon: Lock,
      title: t('language') === 'fr' ? 'Protection des Données' : 'Data Protection',
      description: t('language') === 'fr' 
        ? 'Ne partagez jamais vos informations de connexion et déconnectez-vous après chaque session.'
        : 'Never share your login information and log out after each session.'
    },
    {
      icon: Shield,
      title: t('language') === 'fr' ? 'Visites Sécurisées' : 'Safe Visits',
      description: t('language') === 'fr' 
        ? 'Informez toujours quelqu\'un de vos visites et préférez les rendez-vous en journée dans des lieux publics.'
        : 'Always inform someone about your visits and prefer daytime appointments in public places.'
    }
  ];

  const warningSigns = [
    t('language') === 'fr' ? 'Demande de paiement en espèces' : 'Request for cash payment',
    t('language') === 'fr' ? 'Pression pour une décision immédiate' : 'Pressure for immediate decision',
    t('language') === 'fr' ? 'Refus de fournir des documents officiels' : 'Refusal to provide official documents',
    t('language') === 'fr' ? 'Communication via des canaux non officiels' : 'Communication via unofficial channels',
    t('language') === 'fr' ? 'Prix anormalement bas' : 'Abnormally low prices'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('language') === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          </Link>

          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              {t('legal.safety')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('language') === 'fr' 
                ? 'Conseils de sécurité pour une expérience immobilière sûre'
                : 'Safety guidelines for a secure real estate experience'
              }
            </p>
          </div>

          {/* Safety Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {safetyTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <tip.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {tip.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Warning Signs */}
          <Card className="mb-12 border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-orange-800">
                  {t('language') === 'fr' ? 'Signaux d\'Alerte' : 'Warning Signs'}
                </CardTitle>
              </div>
              <CardDescription className="text-orange-700">
                {t('language') === 'fr' 
                  ? 'Soyez vigilant si vous rencontrez l\'un de ces comportements'
                  : 'Be vigilant if you encounter any of these behaviors'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {warningSigns.map((sign, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-orange-800">{sign}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Phone className="h-6 w-6 text-primary" />
                <span>{t('language') === 'fr' ? 'Contacts d\'Urgence' : 'Emergency Contacts'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('language') === 'fr' ? 'Support OffMarket' : 'OffMarket Support'}
                  </h4>
                  <p className="text-muted-foreground">+41 22 123 45 67</p>
                  <p className="text-muted-foreground">support@offmarket.ch</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('language') === 'fr' ? 'Police Suisse' : 'Swiss Police'}
                  </h4>
                  <p className="text-muted-foreground">117 (urgence)</p>
                  <p className="text-muted-foreground">+41 22 123 45 67 (non-urgence)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? 'Bonnes Pratiques' : 'Best Practices'}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {t('language') === 'fr' 
                    ? '• Toujours rencontrer les propriétaires ou agents en personne avant de signer quoi que ce soit'
                    : '• Always meet property owners or agents in person before signing anything'
                  }
                </p>
                <p>
                  {t('language') === 'fr' 
                    ? '• Vérifiez tous les documents officiels (titre de propriété, permis, etc.)'
                    : '• Verify all official documents (property title, permits, etc.)'
                  }
                </p>
                <p>
                  {t('language') === 'fr' 
                    ? '• Ne payez jamais d\'acompte sans avoir vu le bien en personne'
                    : '• Never pay a deposit without having seen the property in person'
                  }
                </p>
                <p>
                  {t('language') === 'fr' 
                    ? '• Faites appel à un notaire indépendant pour les transactions importantes'
                    : '• Use an independent notary for important transactions'
                  }
                </p>
                <p>
                  {t('language') === 'fr' 
                    ? '• Gardez une trace écrite de tous vos échanges'
                    : '• Keep written records of all your exchanges'
                  }
                </p>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="outline">
                  {t('navigation.contact')}
                </Button>
              </Link>
              <Link to="/">
                <Button className="btn-primary">
                  {t('navigation.home')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
