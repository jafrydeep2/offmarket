import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { useProperties } from '@/contexts/PropertyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, MapPin, Home, DollarSign, Calendar, Image as ImageIcon, List, Maximize, Bath } from 'lucide-react';
import { PropertyGallery } from '@/components/PropertyGallery';
import { RichTextDisplay } from '@/components/ui/rich-text-display';

export const AdminPropertyDetailPage: React.FC = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getProperty, deleteProperty } = useProperties();

  const property = id ? getProperty(id) : undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin/properties')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Retour' : 'Back'}
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('language') === 'fr' ? 'Détail de la propriété' : 'Property Detail'}
            </h1>
          </div>
          {property && (
            <div className="flex space-x-2">
              <Link to={`/admin/properties/${property.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('language') === 'fr' ? 'Modifier' : 'Edit'}
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('language') === 'fr' ? 'Supprimer' : 'Delete'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('language') === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion'}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('language') === 'fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('language') === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { if (property) { deleteProperty(property.id); navigate('/admin/properties'); } }}>
                      {t('language') === 'fr' ? 'Supprimer' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {!property ? (
          <Card>
            <CardContent className="p-6 text-gray-600">{t('language') === 'fr' ? 'Propriété introuvable.' : 'Property not found.'}</CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <PropertyGallery images={property.images} title={property.title} hasVideo={Boolean(property.videoUrl)} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Home className="h-5 w-5 mr-2 text-blue-600" />{property.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground flex items-center"><MapPin className="h-4 w-4 mr-1" />{property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.description ? (
                    <RichTextDisplay 
                      content={property.description}
                      className="text-gray-700"
                    />
                  ) : (
                    <div className="text-gray-700">{t('language') === 'fr' ? 'Aucune description fournie.' : 'No description provided.'}</div>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center"><DollarSign className="h-4 w-4 mr-1" />{property.price || '-'}</div>
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{property.availabilityDate || '-'}</div>
                    <div className="flex items-center"><Maximize className="h-4 w-4 mr-1" />{property.surface} m²</div>
                    <div className="flex items-center"><Bath className="h-4 w-4 mr-1" />2</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><List className="h-5 w-5 mr-2 text-purple-600" />{t('language') === 'fr' ? 'Caractéristiques' : 'Features'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {property.features && property.features.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((f, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{f}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">{t('language') === 'fr' ? 'Aucune caractéristique.' : 'No features.'}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><ImageIcon className="h-5 w-5 mr-2 text-green-600" />{t('language') === 'fr' ? 'Galerie' : 'Gallery'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {(property.images || []).slice(0, 6).map((src, idx) => (
                      <img key={idx} src={src} alt={`img-${idx}`} className="w-full h-24 object-cover rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPropertyDetailPage;


