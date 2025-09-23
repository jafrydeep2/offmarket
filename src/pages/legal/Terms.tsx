import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';

export const TermsPage: React.FC = () => {
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
              {t('legal.terms')}
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
                {t('language') === 'fr' ? '1. Acceptation des Conditions' : '1. Acceptance of Terms'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'En accédant et en utilisant OffMarket, vous acceptez d\'être lié par ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser notre service.'
                  : 'By accessing and using OffMarket, you agree to be bound by these terms of use. If you do not agree to these terms, please do not use our service.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '2. Description du Service' : '2. Service Description'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'OffMarket est une plateforme exclusive de propriétés hors-marché destinée aux investisseurs privilégiés. Nous offrons un accès à des opportunités immobilières uniques non disponibles sur le marché public.'
                  : 'OffMarket is an exclusive off-market property platform for privileged investors. We provide access to unique real estate opportunities not available on the public market.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '3. Accès Membre' : '3. Member Access'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'L\'accès à nos propriétés exclusives est réservé aux membres privilégiés. Les informations de contact des propriétaires ne sont visibles qu\'aux membres connectés. L\'accès peut être révoqué à tout moment.'
                  : 'Access to our exclusive properties is reserved for privileged members. Property owner contact information is only visible to logged-in members. Access may be revoked at any time.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '4. Propriété Intellectuelle' : '4. Intellectual Property'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Tous les contenus, images, et informations présents sur OffMarket sont protégés par le droit d\'auteur et appartiennent à OffMarket ou à ses partenaires. Toute reproduction non autorisée est interdite.'
                  : 'All content, images, and information on OffMarket are protected by copyright and belong to OffMarket or its partners. Any unauthorized reproduction is prohibited.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '5. Limitation de Responsabilité' : '5. Limitation of Liability'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'OffMarket ne peut être tenu responsable des dommages directs ou indirects résultant de l\'utilisation de notre plateforme. Les informations fournies sont à titre informatif uniquement.'
                  : 'OffMarket cannot be held liable for direct or indirect damages resulting from the use of our platform. Information provided is for informational purposes only.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '6. Modifications' : '6. Modifications'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur la plateforme.'
                  : 'We reserve the right to modify these terms at any time. Changes will take effect upon their publication on the platform.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? '7. Contact' : '7. Contact'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Pour toute question concernant ces conditions, veuillez nous contacter à contact@offmarket.ch'
                  : 'For any questions regarding these terms, please contact us at contact@offmarket.ch'
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
