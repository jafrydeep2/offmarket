import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';

export const NoticesPage: React.FC = () => {
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
              {t('legal.notices')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('language') === 'fr' 
                ? 'Informations légales et réglementaires'
                : 'Legal and regulatory information'
              }
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? 'Éditeur du Site' : 'Website Publisher'}
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p><strong>OffMarket SA</strong></p>
                <p>Rue de la Paix 15</p>
                <p>1201 Genève, Suisse</p>
                <p>Téléphone: +41 22 123 45 67</p>
                <p>Email: contact@offmarket.ch</p>
                <p>RCC: CHE-123.456.789</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? 'Directeur de Publication' : 'Publication Director'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Jean-Claude Favre, Directeur Général'
                  : 'Jean-Claude Favre, Chief Executive Officer'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? 'Hébergement' : 'Hosting'}
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p><strong>Vercel Inc.</strong></p>
                <p>340 S Lemon Ave #4133</p>
                <p>Walnut, CA 91789, USA</p>
                <p>Website: vercel.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? 'Propriété Intellectuelle' : 'Intellectual Property'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'L\'ensemble de ce site relève de la législation suisse et internationale sur le droit d\'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.'
                  : 'This entire site is subject to Swiss and international legislation on copyright and intellectual property. All reproduction rights are reserved, including for downloadable documents and iconographic and photographic representations.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? 'Responsabilité' : 'Liability'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l\'année, mais peut toutefois contenir des inexactitudes ou des omissions. Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email.'
                  : 'The information contained on this site is as accurate as possible and the site is updated at different times of the year, but may contain inaccuracies or omissions. If you notice a gap, error or what appears to be a malfunction, please report it by email.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? 'Droit Applicable' : 'Applicable Law'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Le présent site est régi par le droit suisse. En cas de litige, les tribunaux suisses seront seuls compétents.'
                  : 'This site is governed by Swiss law. In case of dispute, Swiss courts will have sole jurisdiction.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('language') === 'fr' ? 'Conformité RGPD' : 'GDPR Compliance'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('language') === 'fr' 
                  ? 'Notre traitement des données personnelles est conforme au Règlement Général sur la Protection des Données (RGPD) et à la Loi fédérale sur la protection des données (LPD) suisse.'
                  : 'Our processing of personal data complies with the General Data Protection Regulation (GDPR) and the Swiss Federal Data Protection Act (DPA).'
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
