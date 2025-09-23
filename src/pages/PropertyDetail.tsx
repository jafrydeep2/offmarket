import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Home, Maximize, Phone, Mail, User, Heart, Share2, Calendar, Eye, Wifi, Car, Dumbbell, Waves, TreePine, Shield, Snowflake, Camera, Play, MessageCircle, ChevronDown, Bath, FileText, Lock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/contexts/PropertyContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PropertyGallery } from '@/components/PropertyGallery';
import { PropertyVideoPlayer } from '@/components/PropertyVideoPlayer';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export const PropertyDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { properties, getProperty, incrementViews, incrementInquiries } = useProperties();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showFavDialog, setShowFavDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated } = useAuth();

  const property = getProperty(id || '');
  
  // Debug logging
  React.useEffect(() => {
    console.log('PropertyDetail Debug:', {
      id,
      propertiesCount: properties.length,
      property,
      isAuthenticated
    });
  }, [id, properties.length, property, isAuthenticated]);

  // Fallback: fetch property directly if not found in context
  React.useEffect(() => {
    const fetchPropertyDirectly = async () => {
      if (!property && id && !isLoading) {
        console.log('Property not found in context, fetching directly...');
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching property directly:', error);
        } else if (data) {
          console.log('Property fetched directly:', data);
        }
      }
    };
    
    fetchPropertyDirectly();
  }, [property, id, isLoading]);

  // Handle loading state
  React.useEffect(() => {
    if (properties.length > 0) {
      setIsLoading(false);
    }
    
    // Set a timeout to stop loading after 5 seconds
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [properties.length]);

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
    const { error } = await supabase.from('inquiries').insert(payload);
    if (error) {
      setInqError(t('language') === 'fr' ? "Échec de l'envoi. Réessayez." : 'Failed to submit inquiry. Please try again.');
      toast.error(error.message);
      setInqSubmitting(false);
      return;
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


  // Enhanced property features with icons
  const propertyFeatures = [
    { icon: Home, label: `${property.rooms} ${t('properties.rooms')}`, category: 'layout' },
    { icon: Maximize, label: `${property.surface} m²`, category: 'layout' },
    { icon: Car, label: 'Parking: 1', category: 'amenities' },
    { icon: Wifi, label: 'High-speed WiFi', category: 'amenities' },
    { icon: Dumbbell, label: 'Fitness Center', category: 'amenities' },
    { icon: Waves, label: 'Swimming Pool', category: 'amenities' },
    { icon: TreePine, label: 'Garden View', category: 'view' },
    { icon: Shield, label: '24/7 Security', category: 'security' },
  ];

  const amenityIcons = {
    'Vue lac': Eye,
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

      {/* Hero Section with Status Badges */}
      <div className="relative bg-background pb-8">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-end mb-6"
          >
            {/* Stats */}
            <div className="flex items-center space-x-6 text-muted-foreground">
              <span className="text-sm">{t('language') === 'fr' ? 'Total de visites' : 'Total No of Visits'}: {property.views || 0}</span>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Last Updated: 24 Feb 2025</span>
              </div>
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
              hasVideo={true}
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
                      318-330 S Oakley Blvd, Chicago, IL 60612, USA
                    </span>
                    <Button variant="link" className="text-muted-foreground hover:text-primary p-0 h-auto text-sm">
                      View Location
                    </Button>
                  </div>
                </div>

                {/* Main Content Row */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  {/* Left Side - Title and Location */}
                  <div className="space-y-3">
                    {/* Availability Status */}
                    <div>
                      <Badge 
                        variant={property.availabilityStatus === 'immediate' ? 'default' : 'secondary'}
                        className={`text-sm px-3 py-1 ${
                          property.availabilityStatus === 'immediate' 
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
                    
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{property.city}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm">{property.neighborhood}</span>
                    </div>
                  </div>

                  {/* Right Side - Price and Actions */}
                  <div className="flex flex-col items-end space-y-4">
                    {/* Price Section */}
                    <div className="text-right">
                      {!isOnRequest ? (
                        <div className="space-y-2">
                          <div className="text-lg text-muted-foreground">
                            {listingType === 'rent' ? t('property.listing.rent') : t('property.listing.sale')}
                          </div>
                          <div className="text-2xl md:text-3xl font-bold text-foreground">
                            {priceText}
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

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowFavDialog(true);
                            return;
                          }
                          setIsFavorited(!isFavorited);
                        }}
                        className={`h-10 w-10 rounded-full border transition-all duration-200 ${
                          isFavorited 
                            ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' 
                            : 'hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-10 w-10 rounded-full border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <span className="text-muted-foreground">Listed on:</span>
                  <span className="ml-2 font-medium">02 May 2025</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium">
                    {t('language') === 'fr' ? 'Appartement' : 'Apartment'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Tabs Navigation */}
            <motion.div
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
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {selectedTab === 'overview' && (
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

                  {/* Key Points */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-heading font-bold">Key Highlights</h3>
                    <div className="space-y-3">
                      {[
                        '100 meters from school. 3km away from bypass.',
                        'First floor - 2 large bedrooms with attached bathrooms.',
                        'Spacious and well-Equipped kitchen.',
                        'Inviting living room with balcony.',
                        'Terrace with breathtaking views.',
                        'Independent electric and water connections.'
                      ].map((point, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description Tab Content */}
              {selectedTab === 'description' && (
                <div className="space-y-6">
                  {property.description ? (
                    <div className="prose prose-lg max-w-none">
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {property.description}
                      </p>
                    </div>
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
              )}

              {selectedTab === 'video' && (
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
              )}

              {/* Reviews removed */}
            </motion.div>

            {/* Features and Amenities Sections */}
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
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="text-xl">
                    {t('language') === 'fr' ? 'Demande' : 'Enquiry'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Owner Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Listing Owner Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-medium">
                            {property.contactInfo?.name?.split(' ').map(n => n[0]).join('') || 'JC'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{property.contactInfo?.name || 'John Carter'}</h4>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone</span>
                          <span>{property.contactInfo?.phone || 'Call Us - +1 12345 45648'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email</span>
                          <span>{property.contactInfo?.email || 'info@example.com'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">No of Listings</span>
                          <span>05</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">No of Bookings</span>
                          <span>225</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Member on</span>
                          <span>15 Jan2014</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex space-x-2">
                        <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                          WhatsApp
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Chat Now
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      {/* Blurred content */}
                      <div className="filter blur-md pointer-events-none">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-medium">JC</span>
                          </div>
                          <div>
                            <h4 className="font-medium">John Carter</h4>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <span>Call Us - +1 12345 45648</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span>info@example.com</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">No of Listings</span>
                            <span>05</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Overlay for non-members */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
                        <Lock className="h-8 w-8 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-foreground mb-3 text-center">
                          {t('language') === 'fr' ? 'Information réservée aux membres' : 'Information reserved for members'}
                        </p>
                        <Link to="/contact">
                          <Button size="sm" className="btn-primary">
                            {t('language') === 'fr' ? 'Devenir membre' : 'Become a member'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Share Property */}
            <motion.div
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
            </motion.div>

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