import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus, 
  MapPin, 
  Building2, 
  DollarSign,
  Calendar,
  Eye,
  Star,
  Trash2,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useProperties } from '@/contexts/PropertyContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/lib/notificationService';
import { EmailNotificationService } from '@/lib/emailNotificationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';

export const PropertyForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { getProperty, addProperty, updateProperty } = useProperties();
  const { sendNewPropertyNotification } = useNotifications();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    neighborhood: '',
    address: '',
    propertyType: 'apartment' as 'apartment' | 'house' | 'loft' | 'penthouse' | 'studio' | 'duplex' | 'villa' | 'chalet' | 'castle',
    rooms: '',
    surface: '',
    listingType: 'sale' as 'sale' | 'rent',
    price: '',
    availabilityDate: '',
    availabilityStatus: 'immediate' as 'immediate' | 'arranged',
    features: [] as string[],
    images: [] as string[],
    videoUrl: '',
    featured: false,
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load property data if editing
  React.useEffect(() => {
    if (isEdit && id) {
      const property = getProperty(id);
      if (property) {
        setFormData({
          title: property.title,
          description: property.description,
          city: property.city,
          neighborhood: property.neighborhood,
          address: property.address || '',
          propertyType: property.propertyType || 'apartment',
          rooms: property.rooms.toString(),
          surface: property.surface.toString(),
          listingType: (property as any).listingType || 'sale',
          price: property.price || '',
          availabilityDate: property.availabilityDate || '',
          availabilityStatus: (property as any).availabilityStatus || 'immediate',
          features: property.features,
          images: property.images,
          videoUrl: property.videoUrl || '',
          featured: false,
          contactInfo: property.contactInfo || { name: '', phone: '', email: '' }
        });
      }
    }
  }, [isEdit, id, getProperty]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeatureAdd = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleFeatureRemove = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    const path = `images/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
    const { error } = await supabase.storage.from('properties-images').upload(path, file);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Image upload error:', error.message);
      return null;
    }
    const { data } = supabase.storage.from('properties-images').getPublicUrl(path);
    return data.publicUrl || null;
  };

  const uploadVideoFile = async (file: File): Promise<string | null> => {
    const path = `videos/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
    const { error } = await supabase.storage.from('properties-videos').upload(path, file);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Video upload error:', error.message);
      return null;
    }
    const { data } = supabase.storage.from('properties-videos').getPublicUrl(path);
    return data.publicUrl || null;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsLoading(true);
      try {
        const uploads = await Promise.all(Array.from(files).map(uploadImageFile));
        const urls = uploads.filter((u): u is string => Boolean(u));
        setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('language') === 'fr' ? 'Le titre est requis' : 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = t('language') === 'fr' ? 'La description est requise' : 'Description is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = t('language') === 'fr' ? 'La ville est requise' : 'City is required';
    }
    if (!formData.rooms) {
      newErrors.rooms = t('language') === 'fr' ? 'Le nombre de pièces est requis' : 'Number of rooms is required';
    }
    if (!formData.surface) {
      newErrors.surface = t('language') === 'fr' ? 'La surface est requise' : 'Surface is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        city: formData.city,
        neighborhood: formData.neighborhood,
        address: formData.address,
        propertyType: formData.propertyType,
        rooms: parseFloat(formData.rooms),
        surface: parseFloat(formData.surface),
        listingType: formData.listingType as 'sale' | 'rent',
        price: formData.price,
        availabilityDate: formData.availabilityDate,
        availabilityStatus: formData.availabilityStatus as 'immediate' | 'arranged',
        features: formData.features,
        images: formData.images,
        videoUrl: formData.videoUrl,
        contactInfo: formData.contactInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEdit && id) {
        await updateProperty(id, propertyData);
      } else {
        const created = await addProperty(propertyData);
        // Process alerts for this new property
        try {
          await supabase.rpc('process_property_alerts', { p_property_id: created.id });
        } catch (rpcErr) {
          // eslint-disable-next-line no-console
          console.error('Error processing alerts RPC:', rpcErr);
        }
        // Create admin notification for new property
        if (user?.id) {
          await NotificationService.createNewPropertyNotification(user.id, propertyData.title, created.id);
        }

        // Send email notifications to users who have new property notifications enabled
        // This will be handled by the property alert processing system
      }
      
      navigate('/admin/properties');
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error saving property:', error);
      
      // Check if error is related to authentication
      if (error?.message?.includes('JWT') || 
          error?.message?.includes('token') || 
          error?.message?.includes('unauthorized') ||
          error?.message?.includes('permission') ||
          error?.status === 401) {
        console.error('Authentication error during property save:', error);
        // Don't navigate away immediately, let the auth context handle it
        setErrors({ general: t('language') === 'fr' ? 'Erreur d\'authentification. Veuillez vous reconnecter.' : 'Authentication error. Please log in again.' });
      } else {
        setErrors({ general: t('language') === 'fr' ? 'Erreur lors de la sauvegarde. Veuillez réessayer.' : 'Error saving property. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/properties')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Retour' : 'Back'}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEdit 
                  ? (t('language') === 'fr' ? 'Modifier la propriété' : 'Edit Property')
                  : (t('language') === 'fr' ? 'Nouvelle propriété' : 'New Property')
                }
              </h1>
              <p className="text-gray-600">
                {t('language') === 'fr' 
                  ? 'Remplissez les informations de la propriété'
                  : 'Fill in the property information'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/properties')}
            >
              {t('language') === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading 
                ? (t('language') === 'fr' ? 'Enregistrement...' : 'Saving...')
                : (t('language') === 'fr' ? 'Enregistrer' : 'Save')
              }
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    {t('language') === 'fr' ? 'Informations de base' : 'Basic Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        {t('language') === 'fr' ? 'Titre' : 'Title'} *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder={t('language') === 'fr' ? 'Ex: Appartement 4.5 pièces - Lausanne Centre' : 'Ex: 4.5 room apartment - Lausanne Center'}
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listingType">
                        {t('language') === 'fr' ? 'Type d\'annonce' : 'Listing Type'}
                      </Label>
                      <Select value={formData.listingType} onValueChange={(value) => handleInputChange('listingType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">{t('language') === 'fr' ? 'Vente' : 'Sale'}</SelectItem>
                          <SelectItem value="rent">{t('language') === 'fr' ? 'Location' : 'Rent'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t('language') === 'fr' ? 'Description' : 'Description'} *
                    </Label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(content) => handleInputChange('description', content)}
                      placeholder={t('language') === 'fr' ? 'Décrivez la propriété en détail...' : 'Describe the property in detail...'}
                      error={!!errors.description}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    {t('language') === 'fr' ? 'Localisation' : 'Location'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        {t('language') === 'fr' ? 'Ville' : 'City'} *
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder={t('language') === 'fr' ? 'Ex: Lausanne' : 'Ex: Lausanne'}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">
                        {t('language') === 'fr' ? 'Quartier' : 'Neighborhood'}
                      </Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        placeholder={t('language') === 'fr' ? 'Ex: Centre-ville' : 'Ex: City Center'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {t('language') === 'fr' ? 'Adresse complète (optionnel)' : 'Full Address (optional)'}
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder={t('language') === 'fr' ? 'Ex: Rue du Grand-Chêne 12, 1003 Lausanne' : 'Ex: Rue du Grand-Chêne 12, 1003 Lausanne'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">
                      {t('language') === 'fr' ? 'Type de propriété' : 'Property Type'} *
                    </Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">{t('language') === 'fr' ? 'Appartement' : 'Apartment'}</SelectItem>
                        <SelectItem value="house">{t('language') === 'fr' ? 'Maison' : 'House'}</SelectItem>
                        <SelectItem value="loft">{t('language') === 'fr' ? 'Loft' : 'Loft'}</SelectItem>
                        <SelectItem value="penthouse">{t('language') === 'fr' ? 'Penthouse' : 'Penthouse'}</SelectItem>
                        <SelectItem value="studio">{t('language') === 'fr' ? 'Studio' : 'Studio'}</SelectItem>
                        <SelectItem value="duplex">{t('language') === 'fr' ? 'Duplex' : 'Duplex'}</SelectItem>
                        <SelectItem value="villa">{t('language') === 'fr' ? 'Villa' : 'Villa'}</SelectItem>
                        <SelectItem value="chalet">{t('language') === 'fr' ? 'Chalet' : 'Chalet'}</SelectItem>
                        <SelectItem value="castle">{t('language') === 'fr' ? 'Château' : 'Castle'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
                    {t('language') === 'fr' ? 'Détails de la propriété' : 'Property Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rooms">
                        {t('language') === 'fr' ? 'Pièces' : 'Rooms'} *
                      </Label>
                      <Input
                        id="rooms"
                        type="number"
                        value={formData.rooms}
                        onChange={(e) => handleInputChange('rooms', e.target.value)}
                        placeholder="4.5"
                        className={errors.rooms ? 'border-red-500' : ''}
                      />
                      {errors.rooms && (
                        <p className="text-sm text-red-500">{errors.rooms}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surface">
                        {t('language') === 'fr' ? 'Surface (m²)' : 'Surface (m²)'} *
                      </Label>
                      <Input
                        id="surface"
                        type="number"
                        value={formData.surface}
                        onChange={(e) => handleInputChange('surface', e.target.value)}
                        placeholder="120"
                        className={errors.surface ? 'border-red-500' : ''}
                      />
                      {errors.surface && (
                        <p className="text-sm text-red-500">{errors.surface}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">
                        {t('language') === 'fr' ? 'Prix' : 'Price'}
                      </Label>
                      <Input
                        id="price"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="CHF 2'800'000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="availabilityDate">
                        {t('language') === 'fr' ? 'Disponible à partir de' : 'Available from'}
                      </Label>
                      <Input
                        id="availabilityDate"
                        type="date"
                        value={formData.availabilityDate}
                        onChange={(e) => handleInputChange('availabilityDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availabilityStatus">
                        {t('language') === 'fr' ? 'Statut de disponibilité' : 'Availability Status'}
                      </Label>
                      <Select value={formData.availabilityStatus} onValueChange={(value) => handleInputChange('availabilityStatus', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">
                            {t('language') === 'fr' ? 'Disponible immédiatement' : 'Available immediately'}
                          </SelectItem>
                          <SelectItem value="arranged">
                            {t('language') === 'fr' ? 'À convenir' : 'To be arranged'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-600" />
                    {t('language') === 'fr' ? 'Caractéristiques' : 'Features'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder={t('language') === 'fr' ? 'Ajouter une caractéristique...' : 'Add a feature...'}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleFeatureAdd())}
                    />
                    <Button type="button" onClick={handleFeatureAdd}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleFeatureRemove(feature)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-indigo-600" />
                    {t('language') === 'fr' ? 'Images' : 'Images'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      {t('language') === 'fr' ? 'Glissez-déposez vos images ici' : 'Drag and drop your images here'}
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('language') === 'fr' ? 'Choisir des fichiers' : 'Choose files'}
                    </Button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Video */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="h-5 w-5 mr-2 text-red-600" />
                    {t('language') === 'fr' ? 'Vidéo' : 'Video'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">
                      {t('language') === 'fr' ? 'URL de la vidéo' : 'Video URL'}
                    </Label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      placeholder={t('language') === 'fr' ? 'https://example.com/video.mp4' : 'https://example.com/video.mp4'}
                    />
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      {t('language') === 'fr' ? 'Ou téléchargez une vidéo' : 'Or upload a video file'}
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsLoading(true);
                          try {
                            const url = await uploadVideoFile(file);
                            if (url) handleInputChange('videoUrl', url);
                          } finally {
                            setIsLoading(false);
                          }
                        }
                      }}
                      className="hidden"
                      id="video-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('video-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('language') === 'fr' ? 'Choisir une vidéo' : 'Choose video'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('language') === 'fr' ? 'Paramètres' : 'Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">
                      {t('language') === 'fr' ? 'Mettre en vedette' : 'Featured'}
                    </Label>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('language') === 'fr' ? 'Informations de contact' : 'Contact Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">
                      {t('language') === 'fr' ? 'Nom du contact' : 'Contact Name'}
                    </Label>
                    <Input
                      id="contactName"
                      value={formData.contactInfo.name}
                      onChange={(e) => handleInputChange('contactInfo', { ...formData.contactInfo, name: e.target.value })}
                      placeholder="Marie Dubois"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">
                      {t('language') === 'fr' ? 'Téléphone' : 'Phone'}
                    </Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleInputChange('contactInfo', { ...formData.contactInfo, phone: e.target.value })}
                      placeholder="+41 79 123 45 67"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">
                      {t('language') === 'fr' ? 'Email' : 'Email'}
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleInputChange('contactInfo', { ...formData.contactInfo, email: e.target.value })}
                      placeholder="marie.dubois@example.ch"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
