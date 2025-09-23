import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

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
              {t('legal.privacy')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('language') === 'fr' 
                ? 'Dernière mise à jour: 1er janvier 2024'
                : 'Last updated: January 1, 2024'
              }
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '1. Collecte des Données' : '1. Data Collection'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Nous collectons uniquement les informations nécessaires pour fournir nos services: nom, adresse email, numéro de téléphone, et préférences de propriétés. Aucune donnée sensible n\'est stockée sans votre consentement explicite.'
                  : 'We only collect information necessary to provide our services: name, email address, phone number, and property preferences. No sensitive data is stored without your explicit consent.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '2. Utilisation des Données' : '2. Data Usage'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Vos données personnelles sont utilisées exclusivement pour: vous fournir l\'accès aux propriétés exclusives, vous contacter concernant les opportunités immobilières, et améliorer nos services. Nous ne vendons jamais vos données à des tiers.'
                  : 'Your personal data is used exclusively to: provide you access to exclusive properties, contact you about real estate opportunities, and improve our services. We never sell your data to third parties.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '3. Protection des Données' : '3. Data Protection'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Nous utilisons des mesures de sécurité de niveau bancaire pour protéger vos données. Toutes les communications sont chiffrées et nos serveurs sont sécurisés conformément aux standards internationaux.'
                  : 'We use bank-level security measures to protect your data. All communications are encrypted and our servers are secured according to international standards.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '4. Cookies et Tracking' : '4. Cookies and Tracking'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme et des cookies analytiques pour améliorer l\'expérience utilisateur. Vous pouvez désactiver les cookies non essentiels dans vos paramètres de navigateur.'
                  : 'We use essential cookies for platform functionality and analytical cookies to improve user experience. You can disable non-essential cookies in your browser settings.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '5. Vos Droits' : '5. Your Rights'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Conformément au RGPD, vous avez le droit d\'accéder, de rectifier, de supprimer vos données, et de vous opposer à leur traitement. Contactez-nous à privacy@offmarket.ch pour exercer ces droits.'
                  : 'In accordance with GDPR, you have the right to access, rectify, delete your data, and object to its processing. Contact us at privacy@offmarket.ch to exercise these rights.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '6. Partage avec des Tiers' : '6. Third-Party Sharing'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Nous ne partageons vos données qu\'avec les propriétaires des biens que vous souhaitez visiter, et uniquement avec votre consentement explicite. Aucune donnée n\'est transmise à des fins commerciales.'
                  : 'We only share your data with property owners you wish to visit, and only with your explicit consent. No data is transmitted for commercial purposes.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '7. Contact' : '7. Contact'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Pour toute question concernant la protection de vos données, contactez notre délégué à la protection des données à privacy@offmarket.ch'
                  : 'For any questions regarding data protection, contact our data protection officer at privacy@offmarket.ch'
                }
              </p>
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
