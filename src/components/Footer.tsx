import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  const legalLinks = [
    { key: 'terms', path: '/legal/terms' },
    { key: 'privacy', path: '/legal/privacy' },
    { key: 'notices', path: '/legal/notices' },
    // { key: 'safety', path: '/legal/safety' },
  ];

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-bold text-foreground">
              Exclusimmo
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              {t('legal.terms').split(' ')[0]}
            </h4>
            <div className="space-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t(`legal.${link.key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              {t('contact.title')}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t('contact.emailAddress')}</p>
              <p>{t('contact.phoneNumber')}</p>
              <Link 
                to="/become-member"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                {t('navigation.becomeMember')}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Exclusimmo. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};