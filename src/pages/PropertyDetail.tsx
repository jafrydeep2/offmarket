import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Home, Maximize, Phone, Mail, User, Heart, Share2, Calendar, Wifi, Car, Dumbbell, Waves, TreePine, Shield, Snowflake, Camera, Play, MessageCircle, ChevronDown, Bath, FileText, Lock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
// Remove context dependency to avoid loading delays
// import { useProperties } from '@/contexts/PropertyContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PropertyGallery } from '@/components/PropertyGallery';
import { PropertyVideoPlayer } from '@/components/PropertyVideoPlayer';
import { RichTextDisplay } from '@/components/ui/rich-text-display';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { analyticsService } from '@/lib/analyticsService';
import { NotificationService } from '@/lib/notificationService';
import { userActivityTracker } from '@/lib/userActivityTracker';

export const PropertyDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  // Remove context dependency to avoid loading delays
  // const { properties, getProperty, incrementViews, incrementInquiries } = useProperties();
  const [properties, setProperties] = useState<any[]>([]);
  const [property, setProperty] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  const [showFavDialog, setShowFavDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isAuthenticated } = useAuth(); // Keep user for optional tracking, but don't require authentication

  // Property will be loaded directly from database

  // Load property directly from database
  React.useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching property:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          // Debug: Log the raw data to see what we're getting
          console.log('Raw property data from database:', data);
          console.log('Contact info from database:', data.contact_info);
          
          // Map database property to frontend format
          const mappedProperty = {
            id: String(data.id),
            title: data.title,
            description: data.description,
            city: data.city,
            neighborhood: data.neighborhood,
            address: data.address ?? undefined,
            propertyType: data.property_type,
            rooms: Number(data.rooms),
            surface: Number(data.surface),
            listingType: data.listing_type ?? undefined,
            price: data.price ?? undefined,
            availabilityDate: data.availability_date ?? undefined,
            availabilityStatus: data.availability_status || 'immediate',
            images: Array.isArray(data.images) ? data.images : (data.images ? JSON.parse(data.images) : []),
            videoUrl: data.video_url ?? undefined,
            features: Array.isArray(data.features) ? data.features : (data.features ? JSON.parse(data.features) : []),
            contactInfo: data.contact_info ? (typeof data.contact_info === 'string' ? JSON.parse(data.contact_info) : data.contact_info) : {
              name: 'John Carter',
              phone: '+41 79 123 45 67',
              email: 'john.carter@example.ch'
            },
            views: data.views ?? 0,
            inquiries: data.inquiries ?? 0,
            createdAt: data.created_at ?? undefined,
            updatedAt: data.updated_at ?? undefined,
            featured: data.featured ?? false,
          };

          console.log('Mapped property contactInfo:', mappedProperty.contactInfo);
          setProperty(mappedProperty);

          // Track property view if user is authenticated
          if (user) {
            userActivityTracker.setUserId(user.id);
            userActivityTracker.trackPropertyView(mappedProperty.id, mappedProperty.title);
          }
        }
      } catch (err) {
        console.error('Error fetching property:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Debug logging
  React.useEffect(() => {
    console.log('PropertyDetail Debug:', {
      id,
      property
    });
  }, [id, property]);

  // Track property view
  React.useEffect(() => {
    if (property && id) {
      // Track property view
      analyticsService.trackPropertyView(id, user?.id);

      // Track user activity if user is logged in (optional tracking)
      if (user) {
        analyticsService.trackUserActivity(
          user.id,
          'property_view',
          id,
          undefined,
          undefined,
          {
            property_title: property.title,
            property_city: property.city,
            property_type: property.propertyType
          }
        );
      }
    }
  }, [property, id, user]);

  // Loading state is handled in the fetch effect above

  // Helper functions for incrementing views and inquiries
  const incrementViews = async (propertyId: string) => {
    try {
      await supabase
        .from('properties')
        .update({ views: (property?.views || 0) + 1 })
        .eq('id', propertyId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const incrementInquiries = async (propertyId: string) => {
    try {
      await supabase
        .from('properties')
        .update({ inquiries: (property?.inquiries || 0) + 1 })
        .eq('id', propertyId);
    } catch (error) {
      console.error('Error incrementing inquiries:', error);
    }
  };

  const priceText = (property?.price || '').trim();
  const isOnRequest = !priceText || /on\s*request|sur\s*demande/i.test(priceText);
  const listingType = property?.listingType || 'sale';

  // Track view when property loads (only once per visit)
  React.useEffect(() => {
    if (property && id && !hasIncrementedViews.current) {
      hasIncrementedViews.current = true;
      incrementViews(id);
    }
  }, [property, id, incrementViews]);

  const [inqName, setInqName] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqMessage, setInqMessage] = useState('');
  const [inqSubmitting, setInqSubmitting] = useState(false);
  const [inqError, setInqError] = useState('');
  const hasIncrementedViews = useRef(false);

  const handleInquiry = async () => {
    if (!id) return;
    setInqSubmitting(true);
    setInqError('');
    const payload = {
      property_id: id,
      name: inqName,
      email: inqEmail,
      phone: inqPhone,
      message: inqMessage,
    };
    
    // Debug logging
    console.log('Submitting inquiry with payload:', payload);
    console.log('Current user:', user);
    console.log('Is authenticated:', isAuthenticated);
    
    // Test if we can access the inquiries table at all
    try {
      const { data: testData, error: testError } = await supabase
        .from('inquiries')
        .select('id')
        .limit(1);
      console.log('Test query result:', { testData, testError });
    } catch (testErr) {
      console.error('Test query failed:', testErr);
    }
    
    // Test if the property exists (for foreign key validation)
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('id', id)
        .single();
      console.log('Property validation result:', { propertyData, propertyError });
    } catch (propErr) {
      console.error('Property validation failed:', propErr);
    }
    
    const { data: inquiryData, error } = await supabase.from('inquiries').insert(payload).select().single();
    if (error) {
      console.error('Inquiry submission error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      setInqError(t('language') === 'fr' ? "Échec de l'envoi. Réessayez." : 'Failed to submit inquiry. Please try again.');
      toast.error(error.message);
      setInqSubmitting(false);
      return;
    }

    // Create admin notification for new inquiry
    const { data: adminUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .single();

    if (adminUser && property) {
      await NotificationService.createInquiryNotification(adminUser.id, property.title, inquiryData.id);
    }

    await incrementInquiries(id);
    setInqName(''); setInqEmail(''); setInqPhone(''); setInqMessage('');
    toast.success(t('language') === 'fr' ? 'Demande envoyée' : 'Inquiry sent');
    setInqSubmitting(false);
  };

  // Show loading state while properties are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {t('language') === 'fr' ? 'Chargement de la propriété...' : 'Loading property...'}
          </p>
        </div>
      </div>
    );
  }

  // Show not found if properties are loaded but property doesn't exist
  if (!property && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {t('language') === 'fr' ? 'Propriété non trouvée' : 'Property not found'}
          </h1>
          <p className="text-muted-foreground">
            {t('language') === 'fr'
              ? 'La propriété que vous recherchez n\'existe pas ou a été supprimée.'
              : 'The property you are looking for does not exist or has been removed.'
            }
          </p>
          <Link to="/properties">
            <Button variant="outline">
              {t('language') === 'fr' ? 'Retour aux propriétés' : 'Back to Properties'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }


  const amenityIcons = {
    'Vue lac': Home,
    'Balcon': Home,
    'Cave': Shield,
    'Place de parc': Car,
    'Piscine': Waves,
    'Jardin': TreePine,
    'Garage 2 places': Car,
    'Cheminée': Home,
    'Design': Award,
    'Terrasse': Home,
    'Ascenseur': Home,
    'Concierge': User,
  };

  // Enhanced property features with icons - using actual property data
  const propertyFeatures = [
    { icon: Home, label: `${property.rooms} ${t('properties.rooms')}`, category: 'layout' },
    { icon: Maximize, label: `${property.surface} m²`, category: 'layout' },
    // Add actual features from property.features array
    ...(property.features || []).map(feature => ({
      icon: amenityIcons[feature] || Home,
      label: feature,
      category: 'amenities'
    }))
  ];



  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="container-custom pt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/properties"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('language') === 'fr' ? 'Retour aux propriétés' : 'Back to Properties'}
          </Link>
        </motion.div>
      </div>

      {/* Hero Section with Action Buttons */}
      <div className="relative bg-background pb-8">
        <div className="container-custom">
          {/* Action Buttons - Above Property Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-end mb-6"
          >
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!user) {
                    setShowFavDialog(true);
                    return;
                  }
                  setIsFavorited(!isFavorited);
                }}
                className={`h-10 w-10 rounded-full border transition-all duration-200 ${isFavorited
                  ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                  : 'hover:border-primary/50 hover:bg-primary/5'
                  }`}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const url = window.location.href;
                  const title = property.title;
                  const text = `Check out this property: ${title}`;
                  
                  if (navigator.share) {
                    navigator.share({
                      title: title,
                      text: text,
                      url: url,
                    });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(url).then(() => {
                      toast.success(t('language') === 'fr' ? 'Lien copié dans le presse-papiers' : 'Link copied to clipboard');
                    }).catch(() => {
                      // Fallback: show URL in alert
                      alert(`${t('language') === 'fr' ? 'Partager cette propriété:' : 'Share this property:'} ${url}`);
                    });
                  }
                }}
                className="h-10 w-10 rounded-full border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Property Gallery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PropertyGallery
              images={property.images}
              title={property.title}
              hasVideo={Boolean(property.videoUrl)}
            />
          </motion.div>
        </div>
      </div>

      <div className="container-custom pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Clean Property Header */}
              <div className="space-y-6">
                {/* Rating and Address Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground">
                      {property.address || `${property.city}, Switzerland`}
                    </span>
                    <Button
                      variant="link"
                      className="text-muted-foreground hover:text-primary p-0 h-auto text-sm"
                      onClick={() => {
                        const address = property.address || `${property.city}, Switzerland`;
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                    >
                      View Location
                    </Button>
                  </div>
                </div>

                {/* Main Content Row */}
                <div className="space-y-4">
                  {/* Left Side - Title, Price and Location */}
                  <div className="space-y-3">
                    {/* Availability Status */}
                    <div>
                      <Badge
                        variant={property.availabilityStatus === 'immediate' ? 'default' : 'secondary'}
                        className={`text-sm px-3 py-1 ${property.availabilityStatus === 'immediate'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-orange-100 text-orange-800 border-orange-200'
                          }`}
                      >
                        {property.availabilityStatus === 'immediate'
                          ? (t('language') === 'fr' ? 'Disponible immédiatement' : 'Available immediately')
                          : (t('language') === 'fr' ? 'À convenir' : 'To be arranged')
                        }
                      </Badge>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                      {property.title}
                    </h1>

                    {/* Price Section - Below Title */}
                    <div className="text-left">
                      {!isOnRequest ? (
                        <div className="space-y-1">
                          <div className="text-lg text-muted-foreground">
                            {listingType === 'rent' ? t('property.listing.rent') : t('property.listing.sale')}
                          </div>
                          <div className="text-2xl md:text-3xl font-bold text-foreground">
                            {'CHF ' + priceText}
                            {listingType === 'rent' && (
                              <span className="text-lg font-normal text-muted-foreground ml-1">
                                {t('property.perMonth')}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Link to="/contact" className="text-2xl md:text-3xl font-bold text-primary hover:underline">
                            {t('property.onRequest')}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            {t('language') === 'fr' ? 'Prix sur demande' : 'Price on Request'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{property.city}</span>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Clean Quick Stats */}
              <div className="grid grid-cols-3 gap-8 py-6 border-y border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{property.rooms}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('language') === 'fr' ? 'Chambres' : 'Bedrooms'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Bath className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">2</div>
                  <div className="text-sm text-muted-foreground">
                    {t('language') === 'fr' ? 'Salles de bain' : 'Bathrooms'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Maximize className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{property.surface}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('language') === 'fr' ? 'm²' : 'Sq Ft'}
                  </div>
                </div>
              </div>

              {/* Listed Info */}
              {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-6 py-4">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium">
                    {t('language') === 'fr' ? 'Appartement' : 'Apartment'}
                  </span>
                </div>
              </div> */}
            </motion.div>

            {/* Tabs Navigation */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="border-b border-border">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: t('language') === 'fr' ? 'Aperçu' : 'Overview' },
                    { id: 'description', label: t('property.description') },
                    // { id: 'features', label: t('property.features') },
                    // { id: 'amenities', label: t('language') === 'fr' ? 'Commodités' : 'Amenities' },
                    { id: 'video', label: t('language') === 'fr' ? 'Vidéo' : 'Video' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div> */}
            {/* Discription */}
            <div>
              <h3 className="text-2xl font-heading font-bold mb-6">
                {t('property.description')}
              </h3>
              {/* Tab Content */}
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* {selectedTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {property.description}
                      </p>
                      {!showFullDescription && (
                        <Button
                          variant="link"
                          onClick={() => setShowFullDescription(true)}
                          className="text-primary p-0"
                        >
                          Read More ↓
                        </Button>
                      )}
                    </div>

                    {property.features && property.features.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-heading font-bold">
                          {t('language') === 'fr' ? 'Points clés' : 'Key Highlights'}
                        </h3>
                        <div className="space-y-3">
                          {property.features.slice(0, 6).map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )} */}

                {/* Description Tab Content */}
                <div className="space-y-6">
                  {property.description ? (
                    <RichTextDisplay 
                      content={property.description}
                      className="text-muted-foreground leading-relaxed"
                    />
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-muted-foreground mb-3">
                        {t('language') === 'fr' ? 'Aucune description disponible' : 'No description available'}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {t('language') === 'fr'
                          ? 'La description détaillée de cette propriété sera bientôt disponible. Contactez-nous pour plus d\'informations.'
                          : 'Detailed description of this property will be available soon. Contact us for more information.'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviews removed */}
              </motion.div>
            </div>

            {/* Videos */}
            {/* <div>
              <h3 className="text-2xl font-heading font-bold mb-6">
                {t('language') === 'fr' ? 'Vidéos' : 'Videos'}
              </h3>
              <div className="space-y-6">
                {property.videoUrl ? (
                  <PropertyVideoPlayer
                    videoUrl={property.videoUrl}
                    title={property.title}
                  />
                ) : (
                  <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <img
                      src="/placeholder.svg"
                      alt="Property Video Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">
                          {t('language') === 'fr' ? 'Aucune vidéo disponible' : 'No video available'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div> */}

            {/* Features and Amenities Sections - Hidden for Rental Properties */}
            {listingType !== 'rent' && (
              <div className="space-y-12 mt-12">
                {/* Property Features Section */}
                <div>
                  <h3 className="text-2xl font-heading font-bold mb-6">
                    {t('language') === 'fr' ? 'Caractéristiques de la propriété' : 'Property Features'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {propertyFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col items-center p-6 bg-muted/20 rounded-2xl text-center space-y-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{feature.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Amenities Section */}
                <div>
                  <h3 className="text-2xl font-heading font-bold mb-6">
                    {t('language') === 'fr' ? 'Commodités et services' : 'Amenities & Services'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {property.features.map((feature, index) => {
                      const IconComponent = amenityIcons[feature as keyof typeof amenityIcons] || Home;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg"
                        >
                          <IconComponent className="h-5 w-5 text-primary" />
                          <span className="font-medium">{feature}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Inquiry Form - Member Only */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <span>{t('language') === 'fr' ? 'Demande' : 'Enquiry'}</span>
                    {!isAuthenticated && <Lock className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Name</label>
                        <Input placeholder="Your Name" value={inqName} onChange={(e) => setInqName(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <Input placeholder="Your Email" type="email" value={inqEmail} onChange={(e) => setInqEmail(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone</label>
                        <Input placeholder="Your Phone Number" value={inqPhone} onChange={(e) => setInqPhone(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea placeholder="Tell us about your requirements..." rows={4} value={inqMessage} onChange={(e) => setInqMessage(e.target.value)} />
                      </div>
                      {inqError && <p className="text-sm text-red-600">{inqError}</p>}
                      <Button className="w-full btn-primary" disabled={inqSubmitting} onClick={handleInquiry}>
                        {inqSubmitting ? (t('common.loading')) : 'Submit'}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {t('properties.memberAccessRequired')}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        {t('properties.memberAccessDescription')}
                      </p>
                      <Link to="/become-member">
                        <Button className="w-full">
                          {t('properties.becomeMember')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div> */}

            {/* Owner Details - Member Only - Hidden for Sales Properties */}
            {listingType !== 'sale' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{t('properties.ownerDetails')}</span>
                      {!isAuthenticated && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isAuthenticated ? (
                      <div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('properties.name')}</span>
                            <span className="font-medium">{property.contactInfo?.name ? property.contactInfo?.name : t('language') === 'fr' ? 'Non disponible' : 'Not available'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('properties.phone')}</span>
                            <span className="font-medium">{property.contactInfo?.phone ? property.contactInfo?.phone : t('language') === 'fr' ? 'Non disponible' : 'Not available'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{property.contactInfo?.email ? property.contactInfo?.email : t('language') === 'fr' ? 'Non disponible' : 'Not available'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {t('properties.memberAccessRequired')}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                          {t('properties.memberAccessDescription')}
                        </p>
                        <Link to="/become-member">
                          <Button className="w-full">
                            {t('properties.becomeMember')}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Share Property */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Share Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp', 'Email', 'Copy'].map((platform) => (
                      <Button
                        key={platform}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div> */}

            {/* Mortgage Calculator */}
            {/* Mortgage Calculator removed */}
          </div>
        </div>
      </div>
      {/* Favorites Auth Dialog */}
      <AlertDialog open={showFavDialog} onOpenChange={setShowFavDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('language') === 'fr' ? 'Devenez membre' : 'Become a member'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('language') === 'fr'
                ? 'Devenez membre pour enregistrer vos favoris et accéder aux avantages réservés aux membres.'
                : 'Become a member to save favorites and access member benefits.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowFavDialog(false)}>
              {t('language') === 'fr' ? 'Plus tard' : 'Not now'}
            </Button>
            <Link to="/become-member">
              <AlertDialogAction>
                {t('language') === 'fr' ? 'Devenir membre' : 'Become a member'}
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};