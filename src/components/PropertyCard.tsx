import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, User, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  address?: string; // Full address (optional for privacy)
  propertyType: 'apartment' | 'house' | 'loft' | 'penthouse' | 'studio' | 'duplex' | 'villa' | 'chalet' | 'castle';
  rooms: number;
  surface: number;
  listingType?: 'sale' | 'rent';
  price?: string;
  availabilityDate?: string; // Available from date
  availabilityStatus: 'immediate' | 'arranged'; // Required field for availability text
  images: string[];
  videoUrl?: string; // Video URL or upload
  features: string[];
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  views?: number;
  inquiries?: number;
  createdAt?: string;
  updatedAt?: string;
  featured?: boolean;
}

interface PropertyCardProps {
  property: Property;
  showContactInfo?: boolean;
  alertMatch?: boolean;
  alertCriteria?: {
    transaction_type?: 'rent' | 'sale';
    property_type?: 'apartment' | 'house' | 'villa' | 'land';
    min_budget?: number;
    max_budget?: number;
    location?: string;
    rooms?: number;
  };
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showContactInfo = false,
  alertMatch = false,
  alertCriteria
}) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFavDialog, setShowFavDialog] = useState(false);
  const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isFavorited: isFav, toggleFavorite } = useFavorites();

  useEffect(() => {
    setIsFavorited(isFav(property.id));
  }, [property.id, isFav]);

  const priceText = (property.price || '').trim();
  const isOnRequest = !priceText || /on\s*request|sur\s*demande/i.test(priceText);
  const listingType = property.listingType || 'sale';

  // Check if property matches alert criteria
  const matchesAlertCriteria = (property: Property, criteria?: PropertyCardProps['alertCriteria']) => {
    if (!criteria) return false;

    // Check transaction type
    if (criteria.transaction_type && property.listingType !== criteria.transaction_type) {
      return false;
    }

    // Check property type (convert property type to match alert types)
    const propertyTypeMap: Record<string, string> = {
      'apartment': 'apartment',
      'house': 'house',
      'villa': 'villa',
      'loft': 'apartment',
      'penthouse': 'apartment',
      'studio': 'apartment',
      'duplex': 'apartment',
      'chalet': 'house',
      'castle': 'villa'
    };

    if (criteria.property_type && propertyTypeMap[property.propertyType] !== criteria.property_type) {
      return false;
    }

    // Check location (basic string matching)
    if (criteria.location && !property.city.toLowerCase().includes(criteria.location.toLowerCase()) &&
      !property.neighborhood.toLowerCase().includes(criteria.location.toLowerCase())) {
      return false;
    }

    // Check rooms
    if (criteria.rooms && property.rooms < criteria.rooms) {
      return false;
    }

    // Check budget (if price is available and not "on request")
    if (!isOnRequest && property.price) {
      const price = parseFloat(property.price.replace(/[^0-9.]/g, ''));
      if (criteria.min_budget && price < criteria.min_budget) {
        return false;
      }
      if (criteria.max_budget && price > criteria.max_budget) {
        return false;
      }
    }

    return true;
  };

  const isAlertMatch = alertMatch || (alertCriteria && matchesAlertCriteria(property, alertCriteria));

  return (
    <Link to={`/property/${property.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Property Image with Carousel */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            key={currentImageIndex}
            src={property.images[currentImageIndex] || '/placeholder.svg'}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Listing Type Badge (Sale / Rent) */}
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1">
            {listingType === 'rent' ? t('property.listing.rent') : t('property.listing.sale')}
          </Badge>

          {/* Alert Match Badge */}
          {isAlertMatch && (
            <Badge className="absolute top-4 right-16 bg-green-500 text-white px-3 py-1 animate-pulse">
              {t('alerts.matchesAlert')}
            </Badge>
          )}

          {/* Favorite Button */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                setShowFavDialog(true);
                return;
              }
              if (isFavorited) {
                setShowRemoveConfirmDialog(true);
                return;
              }
              await toggleFavorite(property.id);
              setIsFavorited(isFav(property.id));
            }}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-primary text-primary' : 'text-white'}`} />
          </button>


          {/* Left Arrow */}
          {property.images.length > 1 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex((prev) => 
                  prev === 0 ? property.images.length - 1 : prev - 1
                );
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => 
                    prev === 0 ? property.images.length - 1 : prev - 1
                  );
                }
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
              aria-label="Previous image"
              tabIndex={0}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}

          {/* Right Arrow */}
          {property.images.length > 1 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex((prev) => 
                  prev === property.images.length - 1 ? 0 : prev + 1
                );
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => 
                    prev === property.images.length - 1 ? 0 : prev + 1
                  );
                }
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
              aria-label="Next image"
              tabIndex={0}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          )}

          {/* Manual Image Navigation - No Auto Cycling */}

          {/* Price Tag or On Request */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 max-w-[calc(100%-8rem)]">
            {!isOnRequest ? (
              <div className="flex flex-col">
                <span className="text-md font-bold text-foreground">
                  CHF {priceText}
                  {listingType === 'rent' && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {t('property.perMonth')}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <Link to="/contact" className="text-lg font-bold text-primary hover:underline">
                {t('property.onRequest')}
              </Link>
            )}
          </div>

          {/* Image Counter */}
          {property.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          )}
        </div>

        {/* Property Content */}
        <div className="p-6 space-y-4">
          {/* Availability Status */}
          <div className="mb-2">
            <Badge
              variant={property.availabilityStatus === 'immediate' ? 'default' : 'secondary'}
              className={`text-xs px-2 py-1 ${property.availabilityStatus === 'immediate'
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

          {/* Title & Location */}
          <div className="space-y-2">
            <h3 className="text-lg font-heading font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem] flex items-start">
              {property.title}
            </h3>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.city}, {property.neighborhood}</span>
            </div>
          </div>

          {/* Property Features */}
          <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-gray-light">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-primary">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">{property.rooms} {t('properties.rooms')}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-primary">
                <span className="text-sm font-semibold">2</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">Bath</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-primary">
                <span className="text-sm font-semibold">{property.surface}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">Sq Ft</span>
            </div>
          </div>

          {/* Alert Criteria Match Info */}
          {isAlertMatch && alertCriteria && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  {t('alerts.matchesCriteria')}
                </span>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                {alertCriteria.transaction_type && (
                  <div>
                    <span className="font-medium">{t('alerts.transactionType')}:</span> {t(`alerts.${alertCriteria.transaction_type}`)}
                  </div>
                )}
                {alertCriteria.property_type && (
                  <div>
                    <span className="font-medium">{t('alerts.propertyType')}:</span> {t(`alerts.${alertCriteria.property_type}`)}
                  </div>
                )}
                {alertCriteria.location && (
                  <div>
                    <span className="font-medium">{t('alerts.location')}:</span> {alertCriteria.location}
                  </div>
                )}
                {alertCriteria.rooms && (
                  <div>
                    <span className="font-medium">{t('alerts.rooms')}:</span> {alertCriteria.rooms}+
                  </div>
                )}
                {(alertCriteria.min_budget || alertCriteria.max_budget) && (
                  <div>
                    <span className="font-medium">{t('property.price')}:</span>
                    {alertCriteria.min_budget && alertCriteria.max_budget
                      ? ` CHF ${alertCriteria.min_budget.toLocaleString()} - ${alertCriteria.max_budget.toLocaleString()}`
                      : alertCriteria.min_budget
                        ? ` CHF ${alertCriteria.min_budget.toLocaleString()}+`
                        : ` CHF ${alertCriteria.max_budget.toLocaleString()}-`
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Info (only show if showContactInfo is true) */}
          {/* {showContactInfo && property.contactInfo && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {property.contactInfo.name}
                </p>
                <p className="text-xs text-muted-foreground">Company Agent</p>
              </div>
            </div>
          </div>
        )} */}
        </div>
      </motion.div>
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

      {/* Remove Favorite Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirmDialog} onOpenChange={setShowRemoveConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('alerts.removeFavoriteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('alerts.removeFavoriteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveConfirmDialog(false)}>
              {t('language') === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <AlertDialogAction
              onClick={async () => {
                await toggleFavorite(property.id);
                setIsFavorited(isFav(property.id));
                setShowRemoveConfirmDialog(false);
              }}
            >
              {t('language') === 'fr' ? 'Retirer' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Link>
  );
};