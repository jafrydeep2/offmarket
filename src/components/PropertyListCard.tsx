import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, User, Heart, Eye, Maximize, Bath } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property } from './PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PropertyListCardProps {
  property: Property;
  showContactInfo?: boolean;
}

export const PropertyListCard: React.FC<PropertyListCardProps> = ({ 
  property, 
  showContactInfo = false 
}) => {
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFavDialog, setShowFavDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isFavorited: isFav, toggleFavorite } = useFavorites();
  const priceText = (property.price || '').trim();
  const isOnRequest = !priceText || /on\s*request|sur\s*demande/i.test(priceText);
  const inferredListing: 'sale' | 'rent' = (property.listingType || 'sale') as 'sale' | 'rent';

  useEffect(() => {
    setIsFavorited(isFav(property.id));
  }, [property.id, isFav]);

  return (
    <>
    <motion.div 
      whileHover={{ x: 4 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {/* Property Image */}
        <div className="relative md:w-80 h-64 md:h-auto overflow-hidden">
          <img
            src={property.images[0] || '/placeholder.svg'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Listing Type Badge */}
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1">
            {inferredListing === 'rent' ? t('property.listing.rent') : t('property.listing.sale')}
          </Badge>

          {/* Favorite Button */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                setShowFavDialog(true);
                return;
              }
              await toggleFavorite(property.id);
              setIsFavorited(isFav(property.id));
            }}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-primary text-primary' : 'text-white'}`} />
          </button>

          {/* Price Tag or On Request */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 max-w-[calc(100%-8rem)]">
            {!isOnRequest ? (
              <span className="text-lg font-bold text-foreground">
                CHF {priceText}
                {inferredListing === 'rent' && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {t('property.perMonth')}
                  </span>
                )}
              </span>
            ) : (
              <Link to="/contact" className="text-lg font-bold text-primary hover:underline">
                {t('property.onRequest')}
              </Link>
            )}
          </div>
        </div>

        {/* Property Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          {/* Header Info */}
          <div className="space-y-4">
            {/* Views Counter */}
            <div className="flex items-center space-x-1 text-muted-foreground text-sm">
              <Eye className="h-4 w-4" />
              <span>{property.views || 0}</span>
            </div>

            {/* Availability Status */}
              <div className="mb-2">
                <Badge 
                  variant={property.availabilityStatus === 'immediate' ? 'default' : 'secondary'}
                  className={`text-xs px-2 py-1 ${
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

            {/* Title & Location */}
            <div className="space-y-2">
              <h3 className="text-2xl font-heading font-bold text-foreground line-clamp-2">
                {property.title}
              </h3>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{property.city}, {property.neighborhood}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed line-clamp-2">
              {property.description}
            </p>

            {/* Property Features */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{property.rooms} {t('properties.rooms')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">2 Bath</span>
              </div>
              <div className="flex items-center space-x-2">
                <Maximize className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{property.surface} m²</span>
              </div>
            </div>

            {/* Features Tags */}
            <div className="flex flex-wrap gap-2">
              {property.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {property.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{property.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            {showContactInfo && property.contactInfo ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {property.contactInfo.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Company Agent</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Link to={`/property/${property.id}`}>
                    <Button variant="outline" size="sm">
                      {t('properties.viewDetails')}
                    </Button>
                  </Link>
                  <Button className="btn-primary" size="sm">
                    {t('language') === 'fr' ? 'Contacter' : 'Contact'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('auth.loginRequired')}
                </p>
                <Link to={`/property/${property.id}`}>
                  <Button variant="outline">
                    {t('properties.viewDetails')}
                    <Eye className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
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
    </>
  );
};