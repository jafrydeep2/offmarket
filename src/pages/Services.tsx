import React from 'react';
import { ArrowRight, Home, Award, Users, Shield, Clock, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ServicesPage: React.FC = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Home,
      title: t('language') === 'fr' ? 'Achat de Propriétés' : 'Property Purchase',
      description: t('language') === 'fr' 
        ? 'Trouvez la propriété de vos rêves avec notre sélection exclusive de biens hors-marché'
        : 'Find your dream property with our exclusive selection of off-market real estate',
      features: [
        t('language') === 'fr' ? 'Sélection exclusive de propriétés' : 'Exclusive property selection',
        t('language') === 'fr' ? 'Accompagnement personnalisé' : 'Personalized guidance',
        t('language') === 'fr' ? 'Négociation experte' : 'Expert negotiation',
        t('language') === 'fr' ? 'Visites privées' : 'Private viewings'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Award,
      title: t('language') === 'fr' ? 'Vente de Propriétés' : 'Property Sales',
      description: t('language') === 'fr' 
        ? 'Vendez votre propriété au meilleur prix grâce à notre réseau exclusif d\'acheteurs qualifiés'
        : 'Sell your property at the best price through our exclusive network of qualified buyers',
      features: [
        t('language') === 'fr' ? 'Évaluation professionnelle' : 'Professional valuation',
        t('language') === 'fr' ? 'Marketing exclusif' : 'Exclusive marketing',
        t('language') === 'fr' ? 'Réseau d\'acheteurs premium' : 'Premium buyer network',
        t('language') === 'fr' ? 'Confidentialité garantie' : 'Guaranteed confidentiality'
      ],
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Users,
      title: t('language') === 'fr' ? 'Location de Luxe' : 'Luxury Rentals',
      description: t('language') === 'fr' 
        ? 'Découvrez des locations de prestige pour vos besoins temporaires ou long terme'
        : 'Discover prestigious rentals for your temporary or long-term needs',
      features: [
        t('language') === 'fr' ? 'Propriétés de prestige' : 'Prestigious properties',
        t('language') === 'fr' ? 'Services conciergerie' : 'Concierge services',
        t('language') === 'fr' ? 'Flexibilité des durées' : 'Flexible durations',
        t('language') === 'fr' ? 'Maintenance incluse' : 'Maintenance included'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: t('language') === 'fr' ? 'Conseil Immobilier' : 'Real Estate Advisory',
      description: t('language') === 'fr' 
        ? 'Bénéficiez de conseils d\'experts pour vos investissements immobiliers stratégiques'
        : 'Benefit from expert advice for your strategic real estate investments',
      features: [
        t('language') === 'fr' ? 'Analyse de marché' : 'Market analysis',
        t('language') === 'fr' ? 'Stratégie d\'investissement' : 'Investment strategy',
        t('language') === 'fr' ? 'Gestion de portefeuille' : 'Portfolio management',
        t('language') === 'fr' ? 'Suivi personnalisé' : 'Personalized follow-up'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: t('language') === 'fr' ? 'Téléphone' : 'Phone',
      value: '+41 22 123 45 67',
      description: t('language') === 'fr' ? 'Disponible 24h/24' : 'Available 24/7'
    },
    {
      icon: Mail,
      title: t('language') === 'fr' ? 'Email' : 'Email',
      value: 'info@offmarket.ch',
      description: t('language') === 'fr' ? 'Réponse sous 2h' : 'Response within 2h'
    },
    {
      icon: MapPin,
      title: t('language') === 'fr' ? 'Adresse' : 'Address',
      value: 'Rue du Rhône 12, 1204 Genève',
      description: t('language') === 'fr' ? 'Bureau principal' : 'Main office'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
              {t('language') === 'fr' ? 'Nos Services Premium' : 'Our Premium Services'}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {t('language') === 'fr' 
                ? 'Des solutions immobilières complètes et personnalisées pour répondre à tous vos besoins'
                : 'Comprehensive and personalized real estate solutions to meet all your needs'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {service.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                    >
                      {t('language') === 'fr' ? 'En savoir plus' : 'Learn More'}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('language') === 'fr' ? 'Contactez nos Experts' : 'Contact Our Experts'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('language') === 'fr' 
                ? 'Notre équipe d\'experts est à votre disposition pour vous accompagner dans tous vos projets immobiliers'
                : 'Our team of experts is at your disposal to support you in all your real estate projects'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <info.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {info.title}
                </h3>
                <p className="text-xl font-bold text-primary mb-2">
                  {info.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};
