import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Home, Users, Award, Lock, Video, Key, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
// Remove context dependency to avoid loading delays
// import { useProperties } from '@/contexts/PropertyContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/PropertyCard';

// Properties section component
const PropertiesSection: React.FC<{
  properties: any[];
  isLoading: boolean;
  t: (key: string) => string;
}> = ({ properties, isLoading, t }) => {
  const content = useMemo(() => {
    if (properties?.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {t('language') === 'fr' ? 'Chargement des propriétés...' : 'Loading properties...'}
            </p>
          </div>
        </div>
      );
    }

    // Always show properties grid, even if empty
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property}
            showContactInfo={false}
          />
        ))}
      </div>
    );
  }, [properties, isLoading, t]);

  return content;
};

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  // Memoized property mapping function
  const mapPropertyData = useMemo(() => (row: any) => ({
    id: String(row.id),
    title: row.title,
    description: row.description,
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address ?? undefined,
    propertyType: row.property_type,
    rooms: Number(row.rooms),
    surface: Number(row.surface),
    listingType: row.listing_type ?? undefined,
    price: row.price ?? undefined,
    availabilityDate: row.availability_date ?? undefined,
    availabilityStatus: row.availability_status || 'immediate',
    images: Array.isArray(row.images) ? row.images : (row.images ? JSON.parse(row.images) : []),
    videoUrl: row.video_url ?? undefined,
    features: Array.isArray(row.features) ? row.features : (row.features ? JSON.parse(row.features) : []),
    contactInfo: row.contact_info ?? undefined,
    views: row.views ?? 0,
    inquiries: row.inquiries ?? 0,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    featured: row.featured ?? false,
  }), []);

  // Load properties directly from database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoadingProperties(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching properties:', error);
          setProperties([]);
        } else {
          const mappedProperties = (data || []).map(mapPropertyData);
          setProperties(mappedProperties);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [mapPropertyData]);

  // Handle hash navigation for smooth scrolling
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  }, []);


  // Handle loading state for properties
  React.useEffect(() => {
    if (properties && properties.length >= 0) {
      setIsLoadingProperties(false);
    }
  }, [properties]);

  // Get latest off-market properties (featured properties or latest 3)
  const latestOffMarketProperties = React.useMemo(() => {
    if (!properties || properties.length === 0) return [];
    
    // First try to get featured properties, then fall back to latest properties
    const featuredProps = properties.filter(prop => prop.featured === true);
    if (featuredProps.length >= 3) {
      return featuredProps.slice(0, 3);
    }
    
    // If not enough featured properties, get the latest properties
    return properties
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);
  }, [properties]);


  return (
    <div className="min-h-screen">
      {/* Hero Video Background Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ pointerEvents: 'none' }}
          >
            <source src="/videos/exclusimmo.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-6"
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 leading-relaxed"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/become-member">
              <Button size="lg" className="btn-primary group px-8 py-4 text-lg">
                {t('navigation.becomeMember')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Properties Section */}
      <section className="section-padding bg-muted/20">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t('language') === 'fr' ? 'Dernières Propriétés Off Market' : 'Latest Off Market Listings'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('language') === 'fr' 
                ? 'Découvrez nos dernières opportunités immobilières exclusives'
                : 'Discover our latest exclusive real estate opportunities'
              }
            </p>
          </div>

          <PropertiesSection 
            properties={properties}
            isLoading={isLoadingProperties}
            t={t}
          />

          <div className="text-center mt-12">
            <Link to="/properties">
              <Button variant="outline" size="lg">
                {t('home.hero.cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {/* <section id="services-section" className="section-padding bg-background">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t('language') === 'fr' ? 'Nos Services' : 'Our Services'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('language') === 'fr' 
                ? 'Nous offrons des solutions complètes pour tous vos besoins immobiliers'
                : 'We offer comprehensive solutions for all your real estate needs'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('language') === 'fr' ? 'Acheter une Propriété' : 'Buy a Property',
                description: t('language') === 'fr' ? 'Trouvez la propriété de vos rêves avec notre sélection exclusive' : 'Find your dream property with our exclusive selection',
                icon: Home,
                color: 'from-beige to-beige-hover',
              },
              {
                title: t('language') === 'fr' ? 'Vendre une Propriété' : 'Sell a Property',
                description: t('language') === 'fr' ? 'Vendez votre propriété au meilleur prix avec nos experts' : 'Sell your property at the best price with our experts',
                icon: Award,
                color: 'from-beige-hover to-beige-dark',
              },
              {
                title: t('language') === 'fr' ? 'Louer une Propriété' : 'Rent a Property',
                description: t('language') === 'fr' ? 'Trouvez la location parfaite pour votre style de vie' : 'Find the perfect rental for your lifestyle',
                icon: Users,
                color: 'from-beige-light to-beige',
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg transition-all duration-300">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} rounded-full -translate-y-16 translate-x-16 opacity-10 transition-opacity`}></div>
                  <service.icon className="h-12 w-12 text-primary mb-6" />
                  <h3 className="text-xl font-heading font-bold text-foreground mb-4">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Off-Market Services Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t('becomeMember.services.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('becomeMember.services.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Private Property Sales */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden hover:border-primary/30 hover:-translate-y-1 rounded-2xl p-8">
                <div className="hidden md:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                    {t('becomeMember.services.privateSales.title')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('becomeMember.services.privateSales.description')}
                  </p>
                  <Link to="/private-sales">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {t('becomeMember.services.privateSales.cta')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Property Showcase Videos */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden hover:border-primary/30 hover:-translate-y-1 rounded-2xl p-8">
                <div className="hidden md:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                    {t('becomeMember.services.videos.title')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('becomeMember.services.videos.description')}
                  </p>
                  <Link to="/property-videos">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {t('becomeMember.services.videos.cta')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Exclusive Access */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden hover:border-primary/30 hover:-translate-y-1 rounded-2xl p-8">
                <div className="hidden md:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Key className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                    {t('becomeMember.services.exclusiveAccess.title')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('becomeMember.services.exclusiveAccess.description')}
                  </p>
                  <Link to="/become-member">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {t('becomeMember.services.exclusiveAccess.cta')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Personalized Assistance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden hover:border-primary/30 hover:-translate-y-1 rounded-2xl p-8">
                <div className="hidden md:block absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                    {t('becomeMember.services.personalized.title')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('becomeMember.services.personalized.description')}
                  </p>
                  <Link to="/property-finder">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {t('becomeMember.services.personalized.cta')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      {/* <section className="section-padding bg-muted/20">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t('language') === 'fr' ? 'Accès Exclusif Premium' : 'Premium Exclusive Access'}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('language') === 'fr' 
                ? 'Nos propriétés ne sont pas disponibles sur le marché public. Seuls nos membres ont accès à ces opportunités uniques sélectionnées par nos experts immobiliers.'
                : 'Our properties are not available on the public market. Only our members have access to these unique opportunities selected by our real estate experts.'
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {[
                { number: "50+", label: t('language') === 'fr' ? 'Propriétés Exclusives' : 'Exclusive Properties' },
                { number: "100%", label: t('language') === 'fr' ? 'Hors-Marché' : 'Off-Market' },
                { number: "24h", label: t('language') === 'fr' ? 'Support Premium' : 'Premium Support' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary to-primary-hover bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
};