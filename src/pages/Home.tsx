import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Home, Users, Award, Lock, Video, Key, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useProperties } from '@/contexts/PropertyContext';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/PropertyCard';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { properties } = useProperties();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

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

  // Hero images for carousel
  const heroImages = [
    '/property-hero.jpg',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80',
    'https://htmldemo.net/tm/haven/haven/img/slider/2.jpg',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80',
    'https://htmldemo.net/tm/haven/haven/img/slider/2.jpg',
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

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
      {/* Hero Image Carousel Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Image Carousel Background */}
        <div className="absolute inset-0 z-0">
          <motion.img
            key={currentImageIndex}
            src={heroImages[currentImageIndex]}
            alt="Luxury Property"
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>


        {/* Carousel Dots */}
        {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div> */}
        
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

          {isLoadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg aspect-[4/3] mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestOffMarketProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestOffMarketProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  showContactInfo={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                {t('language') === 'fr' ? 'Aucune propriété disponible' : 'No properties available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('language') === 'fr' 
                  ? 'Nous travaillons actuellement sur de nouvelles offres exclusives. Revenez bientôt !'
                  : 'We are currently working on new exclusive offers. Check back soon!'
                }
              </p>
              <Link to="/properties">
                <Button variant="outline">
                  {t('language') === 'fr' ? 'Voir toutes les propriétés' : 'View all properties'}
                </Button>
              </Link>
            </div>
          )}

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
      <section id="services-section" className="section-padding bg-background">
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
      </section>

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
              {t('language') === 'fr' ? 'Nos Services Hors-Marché' : 'Our Off-Market Services'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('language') === 'fr' 
                ? 'Solutions complètes pour tous vos besoins immobiliers'
                : 'Comprehensive solutions for all your real estate needs'
              }
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
                    {t('language') === 'fr' ? 'Ventes Privées de Propriétés' : 'Private Property Sales'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('language') === 'fr' 
                      ? 'Pour les propriétaires souhaitant vendre avec une discrétion totale. Connexion avec des acheteurs qualifiés sans mise en ligne publique.'
                      : 'For owners wishing to sell with complete discretion. Connection with qualified buyers without public listing.'
                    }
                  </p>
                  <Link to="/private-sales">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {t('language') === 'fr' ? 'Contactez-nous pour votre vente privée' : 'Contact us for your private sale'}
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
                    {t('language') === 'fr' ? 'Vidéos de Présentation de Propriétés' : 'Property Showcase Videos'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('language') === 'fr' 
                      ? 'Création de vidéos professionnelles : visite guidée, prises de vue drone, ambiance. Mise en valeur des caractéristiques clés de la propriété pour attirer les acheteurs sérieux.'
                      : 'Creation of professional videos: guided tour, drone shots, ambiance. Highlighting the key features of the property to attract serious buyers.'
                    }
                  </p>
                  <Link to="/property-videos">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {t('language') === 'fr' ? 'Demandez votre vidéo professionnelle' : 'Request your professional video'}
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
                    {t('language') === 'fr' ? 'Accès Exclusif' : 'Exclusive Access'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('language') === 'fr' 
                      ? 'Accédez aux propriétés hors-marché les plus exclusives et confidentielles. Un accès privilégié réservé à nos membres les plus fidèles.'
                      : 'Access the most exclusive and confidential off-market properties. Privileged access reserved for our most loyal members.'
                    }
                  </p>
                  <Link to="/exclusive-access">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {t('language') === 'fr' ? 'Découvrir l\'accès exclusif' : 'Discover exclusive access'}
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
                    {t('language') === 'fr' ? 'Assistance Personnalisée' : 'Personalized Assistance'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('language') === 'fr' 
                      ? 'Un accompagnement sur mesure pour trouver la propriété parfaite selon vos critères spécifiques. Notre équipe d\'experts vous guide à chaque étape.'
                      : 'Tailored support to find the perfect property according to your specific criteria. Our team of experts guides you through every step.'
                    }
                  </p>
                  <Link to="/property-finder">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {t('language') === 'fr' ? 'Trouver ma propriété idéale' : 'Find my ideal property'}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-muted/20">
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
      </section>
    </div>
  );
};