import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Download,
  Upload,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  CheckSquare,
  Square,
  TrendingUp,
  Users,
  Star,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useProperties } from '@/contexts/PropertyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const PropertyManagement: React.FC = () => {
  const { t } = useTranslation();
  const { properties: allProperties, deleteProperty, addProperty, updateProperty } = useProperties();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<'title' | 'price' | 'views' | 'inquiries' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Properties with additional fields for admin
  const properties = allProperties.map(prop => ({
    ...prop,
    views: prop.views ?? 0,
    inquiries: prop.inquiries ?? 0,
    createdAt: prop.createdAt ?? '—',
    updatedAt: prop.updatedAt ?? '—',
    featured: (prop as any).featured ?? false
  }));

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || property.city.toLowerCase().includes(cityFilter.toLowerCase());
    
    return matchesSearch && matchesCity;
  });

  const sortedProperties = useMemo(() => {
    const arr = [...filteredProperties];
    arr.sort((a: any, b: any) => {
      const aVal = (a as any)[sortKey] ?? '';
      const bVal = (b as any)[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return arr;
  }, [filteredProperties, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedProperties.length / pageSize));
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProperties.slice(start, start + pageSize);
  }, [sortedProperties, currentPage, pageSize]);

  useEffect(() => {
    // Reset to first page when filters/search change
    setCurrentPage(1);
  }, [searchQuery, cityFilter, pageSize]);

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (action === 'delete') {
      setShowBulkDeleteDialog(true);
      return;
    }
    
    if (action === 'feature') {
      // Toggle featured status for selected properties
      // Note: This will only work after the featured column is added to the database
      try {
        for (const id of selectedProperties) {
          const property = properties.find(p => p.id === id);
          if (property) {
            await updateProperty(id, { featured: !(property as any).featured });
          }
        }
        setSelectedProperties([]);
        alert(t('language') === 'fr' ? 'Propriétés mises à jour' : 'Properties updated');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to update featured status:', e);
        alert(t('language') === 'fr' ? 'Erreur lors de la mise à jour. La colonne "featured" n\'existe peut-être pas encore dans la base de données.' : 'Error updating. The "featured" column may not exist in the database yet.');
      }
      return;
    }
    
    // eslint-disable-next-line no-console
    console.log(`Bulk action: ${action} on properties:`, selectedProperties);
  };

  const confirmBulkDelete = async () => {
    for (const id of selectedProperties) {
      try {
        await deleteProperty(id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete property', id, e);
      }
    }
    setSelectedProperties([]);
    setShowBulkDeleteDialog(false);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm(t('language') === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cette propriété ?' : 'Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(propertyId);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete property', propertyId, e);
      }
    }
  };

  const handleDuplicateProperty = async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      try {
        const duplicatedData = {
          ...property,
          title: `${property.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Remove the id so it creates a new property
        const { id, ...propertyWithoutId } = duplicatedData;
        await addProperty(propertyWithoutId);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to duplicate property', propertyId, e);
      }
    }
  };

  const exportCSV = () => {
    const header = ['id','title','price','city','neighborhood','views','inquiries','createdAt'];
    const rows = filteredProperties.map(p => [p.id, p.title, p.price, p.city, p.neighborhood, String((p as any).views ?? ''), String((p as any).inquiries ?? ''), (p as any).createdAt ?? '']);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const lines = text.split('\n');
          const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          const data = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            const obj: any = {};
            header.forEach((h, i) => {
              obj[h] = values[i] || '';
            });
            return obj;
          });

          // Process imported data
          for (const row of data) {
            if (row.title && row.city) {
              try {
                await addProperty({
                  title: row.title,
                  description: row.description || '',
                  city: row.city,
                  neighborhood: row.neighborhood || '',
                  address: row.address || '',
                  propertyType: 'apartment',
                  rooms: parseFloat(row.rooms) || 0,
                  surface: parseFloat(row.surface) || 0,
                  listingType: 'sale',
                  price: row.price || '',
                  availabilityDate: row.availabilityDate || '',
                  availabilityStatus: 'immediate',
                  features: [],
                  images: [],
                  videoUrl: '',
                  contactInfo: { name: '', phone: '', email: '' },
                });
              } catch (error) {
                console.error('Error importing property:', error);
              }
            }
          }
          
          alert(t('language') === 'fr' ? 'Importation terminée' : 'Import completed');
        } catch (error) {
          console.error('Error processing CSV:', error);
          alert(t('language') === 'fr' ? 'Erreur lors de l\'importation' : 'Error importing file');
        }
      }
    };
    input.click();
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('admin.properties.title')}
            </h1>
            <p className="text-gray-600">
              {t('language') === 'fr' 
                ? 'Gérez toutes vos propriétés exclusives'
                : 'Manage all your exclusive properties'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            {/* <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Exporter' : 'Export'}
            </Button>
            <Button variant="outline" onClick={handleImportCSV}>
              <Upload className="h-4 w-4 mr-2" />
              {t('language') === 'fr' ? 'Importer' : 'Import'}
            </Button> */}
            <Link to="/admin/properties/new">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.properties.add')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-700">
                      {t('language') === 'fr' ? 'Propriétés totales' : 'Total Properties'}
                    </p>
                    <p className="text-3xl font-bold text-blue-900">{properties.length}</p>
                    <div className="flex items-center text-xs text-blue-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {t('language') === 'fr' ? 'Toutes les propriétés' : 'All properties'}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-emerald-700">
                      {t('language') === 'fr' ? 'Propriétés en vedette' : 'Featured Properties'}
                    </p>
                    <p className="text-3xl font-bold text-emerald-900">
                      {properties.filter(p => (p as any).featured).length}
                    </p>
                    <div className="flex items-center text-xs text-emerald-600">
                      <Star className="h-3 w-3 mr-1" />
                      {t('language') === 'fr' ? 'Mises en avant' : 'Highlighted'}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-700">
                      {t('language') === 'fr' ? 'Vues totales' : 'Total Views'}
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {properties.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                    </p>
                    <div className="flex items-center text-xs text-purple-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {t('language') === 'fr' ? 'Engagement' : 'Engagement'}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-full">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-orange-700">
                      {t('language') === 'fr' ? 'Demandes' : 'Inquiries'}
                    </p>
                    <p className="text-3xl font-bold text-orange-900">
                      {properties.reduce((sum, p) => sum + p.inquiries, 0).toLocaleString()}
                    </p>
                    <div className="flex items-center text-xs text-orange-600">
                      <Users className="h-3 w-3 mr-1" />
                      {t('language') === 'fr' ? 'Intérêt client' : 'Client interest'}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      placeholder={t('language') === 'fr' ? 'Rechercher des propriétés...' : 'Search properties...'}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                    {searchInput && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => setSearchInput('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="w-48 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder={t('language') === 'fr' ? 'Toutes les villes' : 'All Cities'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('language') === 'fr' ? 'Toutes les villes' : 'All Cities'}</SelectItem>
                      <SelectItem value="lausanne">Lausanne</SelectItem>
                      <SelectItem value="geneve">Genève</SelectItem>
                      <SelectItem value="montreux">Montreux</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-11 px-4 border-gray-200 hover:border-blue-500 hover:text-blue-500 transition-all duration-200"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {t('language') === 'fr' ? 'Filtres' : 'Filters'}
                    {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchInput('');
                      setCityFilter('all');
                      setCurrentPage(1);
                    }}
                    className="h-11 px-4 border-gray-200 hover:border-gray-400 transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('language') === 'fr' ? 'Réinitialiser' : 'Reset'}
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              <AnimatePresence>
                {selectedProperties.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-full">
                          <CheckSquare className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-blue-900">
                            {selectedProperties.length} {t('language') === 'fr' ? 'propriétés sélectionnées' : 'properties selected'}
                          </span>
                          <p className="text-xs text-blue-700">
                            {t('language') === 'fr' ? 'Choisissez une action à effectuer' : 'Choose an action to perform'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkAction('feature')}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          {t('language') === 'fr' ? 'Mettre en vedette' : 'Feature'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkAction('delete')}
                          className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('language') === 'fr' ? 'Supprimer' : 'Delete'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProperties([])}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-4 w-4 mr-1" />
                          {t('language') === 'fr' ? 'Annuler' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {t('language') === 'fr' ? 'Liste des propriétés' : 'Properties List'}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {filteredProperties.length} {t('language') === 'fr' ? 'propriétés trouvées' : 'properties found'}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {t('language') === 'fr' ? 'Page' : 'Page'} {currentPage} / {totalPages}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => { setSortKey('title'); setSortDir(prev => sortKey === 'title' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('language') === 'fr' ? 'Propriété' : 'Property'}</span>
                        <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        {sortKey === 'title' && (
                          sortDir === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => { setSortKey('price'); setSortDir(prev => sortKey === 'price' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('language') === 'fr' ? 'Prix' : 'Price'}</span>
                        <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        {sortKey === 'price' && (
                          sortDir === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => { setSortKey('views'); setSortDir(prev => sortKey === 'views' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('language') === 'fr' ? 'Vues' : 'Views'}</span>
                        <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        {sortKey === 'views' && (
                          sortDir === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => { setSortKey('inquiries'); setSortDir(prev => sortKey === 'inquiries' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('language') === 'fr' ? 'Demandes' : 'Inquiries'}</span>
                        <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        {sortKey === 'inquiries' && (
                          sortDir === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors group"
                      onClick={() => { setSortKey('createdAt'); setSortDir(prev => sortKey === 'createdAt' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('language') === 'fr' ? 'Créé' : 'Created'}</span>
                        <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        {sortKey === 'createdAt' && (
                          sortDir === 'asc' ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">{t('language') === 'fr' ? 'Actions' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {paginatedProperties.map((property, index) => (
                      <motion.tr
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group"
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedProperties.includes(property.id)}
                            onCheckedChange={() => handleSelectProperty(property.id)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <Building2 className="h-7 w-7 text-blue-600" />
                              </div>
                              {property.featured && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <Star className="h-3 w-3 text-white fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">
                                {property.title}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{property.city}, {property.neighborhood}</span>
                              </div>
                              {property.featured && (
                                <Badge className="mt-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                  {t('language') === 'fr' ? 'En vedette' : 'Featured'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {(() => {
                                const priceText = (property.price || '').trim();
                                const isOnRequest = !priceText || /on\s*request|sur\s*demande/i.test(priceText);
                                if (isOnRequest) return (t('language') === 'fr' ? 'Sur demande' : 'On Request');
                                const inferred = ((property as any).listingType || 'sale') as 'sale' | 'rent';
                                return `${inferred === 'rent' ? (t('language') === 'fr' ? 'Location' : 'For rent') : (t('language') === 'fr' ? 'Vente' : 'For sale')} • ${priceText}`;
                              })()}
                            </span>
                            <div className="flex items-center text-xs text-gray-500">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {t('language') === 'fr' ? 'Prix' : 'Price'}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Eye className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900">{property.views.toLocaleString()}</span>
                              <p className="text-xs text-gray-500">{t('language') === 'fr' ? 'vues' : 'views'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Users className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900">{property.inquiries.toLocaleString()}</span>
                              <p className="text-xs text-gray-500">{t('language') === 'fr' ? 'demandes' : 'inquiries'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(property.createdAt).toLocaleDateString()}
                              </span>
                              <p className="text-xs text-gray-500">
                                {new Date(property.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-200 group-hover:bg-white group-hover:shadow-sm transition-all duration-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/properties/${property.id}`} className="flex items-center w-full">
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t('language') === 'fr' ? 'Voir' : 'View'}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/properties/${property.id}/edit`} className="flex items-center w-full">
                                  <Edit className="h-4 w-4 mr-2" />
                                  {t('language') === 'fr' ? 'Modifier' : 'Edit'}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateProperty(property.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('language') === 'fr' ? 'Dupliquer' : 'Duplicate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('language') === 'fr' ? 'Supprimer' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {t('language') === 'fr' 
                    ? `Affichage de ${(currentPage - 1) * pageSize + 1} à ${Math.min(currentPage * pageSize, sortedProperties.length)} sur ${sortedProperties.length} résultats`
                    : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, sortedProperties.length)} of ${sortedProperties.length} results`
                  }
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{t('language') === 'fr' ? 'Par page:' : 'Per page:'}</span>
                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(parseInt(v))}>
                      <SelectTrigger className="w-20 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="h-8 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('language') === 'fr' ? 'Précédent' : 'Previous'}
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNum > totalPages) return null;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-8 w-8 p-0 text-sm ${
                              currentPage === pageNum 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="h-8 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('language') === 'fr' ? 'Suivant' : 'Next'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Bulk Delete Confirmation */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('language') === 'fr' ? 'Supprimer les propriétés sélectionnées ?' : 'Delete selected properties?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('language') === 'fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('language') === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkDelete}>{t('language') === 'fr' ? 'Supprimer' : 'Delete'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </AdminLayout>
  );
};
