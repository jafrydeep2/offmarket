import React, { useEffect, useState } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Download,
  Eye,
  Image as ImageIcon,
  Video,
  File,
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  thumbnail_url?: string;
  alt_text?: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
}

export const MediaLibrary: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading media files:', error);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de charger les fichiers' : 'Failed to load files',
          variant: 'destructive'
        });
        return;
      }

      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error loading media files:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors du chargement' : 'Error loading files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media-library')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de télécharger le fichier' : 'Failed to upload file',
          variant: 'destructive'
        });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media-library')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('media_library')
        .insert({
          filename: fileName,
          original_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          url: urlData.publicUrl,
          tags: []
        });

      if (dbError) {
        console.error('Error saving file info:', dbError);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de sauvegarder les informations' : 'Failed to save file info',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? 'Fichier téléchargé avec succès' : 'File uploaded successfully'
      });

      await loadMediaFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: t('language') === 'fr' ? 'Erreur' : 'Error',
        description: t('language') === 'fr' ? 'Erreur lors du téléchargement' : 'Error uploading file',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(uploadFile);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const file = mediaFiles.find(f => f.id === id);
      if (!file) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media-library')
        .remove([file.filename]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        toast({
          title: t('language') === 'fr' ? 'Erreur' : 'Error',
          description: t('language') === 'fr' ? 'Impossible de supprimer le fichier' : 'Failed to delete file',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('language') === 'fr' ? 'Succès' : 'Success',
        description: t('language') === 'fr' ? 'Fichier supprimé' : 'File deleted'
      });

      await loadMediaFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Video;
    return File;
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || 
                       (filterType === 'image' && file.mime_type.startsWith('image/')) ||
                       (filterType === 'video' && file.mime_type.startsWith('video/'));
    
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    loadMediaFiles();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('language') === 'fr' ? 'Bibliothèque média' : 'Media Library'}
            </h1>
            <p className="text-gray-600">
              {t('language') === 'fr' 
                ? 'Gérez vos images, vidéos et fichiers'
                : 'Manage your images, videos and files'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => loadMediaFiles()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
            <div>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('language') === 'fr' ? 'Téléchargement...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {t('language') === 'fr' ? 'Télécharger' : 'Upload'}
                    </>
                  )}
                </label>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('language') === 'fr' ? 'Rechercher des fichiers...' : 'Search files...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Files */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">
                {t('language') === 'fr' ? 'Chargement des fichiers...' : 'Loading files...'}
              </p>
            </CardContent>
          </Card>
        ) : filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('language') === 'fr' ? 'Aucun fichier trouvé' : 'No files found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('language') === 'fr' 
                  ? 'Commencez par télécharger des fichiers'
                  : 'Start by uploading some files'
                }
              </p>
              <Button onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {t('language') === 'fr' ? 'Télécharger des fichiers' : 'Upload Files'}
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.mime_type);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-square relative bg-gray-100">
                        {file.mime_type.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.alt_text || file.original_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                            <Button size="sm" variant="secondary">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.original_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size_bytes)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {file.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{file.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Preview</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Size</th>
                      <th className="text-left p-4 font-medium">Uploaded</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => {
                      const FileIcon = getFileIcon(file.mime_type);
                      return (
                        <motion.tr
                          key={file.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {file.mime_type.startsWith('image/') ? (
                                <img
                                  src={file.url}
                                  alt={file.alt_text || file.original_name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <FileIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.original_name}
                              </p>
                              {file.alt_text && (
                                <p className="text-xs text-gray-500 truncate">
                                  {file.alt_text}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary">
                              {file.mime_type.split('/')[0]}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">
                              {formatFileSize(file.size_bytes)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">
                              {new Date(file.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteFile(file.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};
