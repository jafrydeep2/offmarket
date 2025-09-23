import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyListCard } from '@/components/PropertyListCard';
import { swissCities, filterCities } from '@/data/swissCities';
import { useProperties } from '@/contexts/PropertyContext';
import { supabase } from '@/lib/supabaseClient';

export const PropertiesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { properties: contextProperties } = useProperties();
  const [properties, setProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRooms, setSelectedRooms] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [surfaceRange, setSurfaceRange] = useState({ min: '', max: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Generate room options
  const roomOptions = [] as string[];
  for (let i = 1; i <= 10; i += 0.5) {
    roomOptions.push(i.toString());
  }
  roomOptions.push('10+');

  // Direct fetch function for properties
  const fetchPropertiesDirectly = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties');
        return;
      }

      // Map database properties to frontend format
      const mappedProperties = (data || []).map((row: any) => ({
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
      }));

      setAllProperties(mappedProperties);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Generate search suggestions
  const searchSuggestions = [
    'All locations',
    ...swissCities,
    'Appartement', 'Maison', 'Villa', 'Loft', 'Penthouse', 'Studio', 'Duplex', 'Chalet', 'Château'
  ];

  // Fetch properties immediately when page loads
  useEffect(() => {
    fetchPropertiesDirectly();
  }, [fetchPropertiesDirectly]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter suggestions based on current search term
  const filteredSuggestions = useMemo(() => {
    return searchTerm 
      ? searchSuggestions.filter(suggestion => 
          suggestion.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : searchSuggestions;
  }, [searchTerm]);

  // Memoized filtered properties
  const filteredProperties = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return [];
    
    let filteredProps = [...allProperties];
    
    // Apply search filter
    const term = debouncedSearchTerm && debouncedSearchTerm !== 'all' ? debouncedSearchTerm.toLowerCase() : '';
    if (term) {
      filteredProps = filteredProps.filter(prop => 
        prop.title.toLowerCase().includes(term) ||
        prop.city.toLowerCase().includes(term) ||
        prop.neighborhood.toLowerCase().includes(term) ||
        prop.propertyType.toLowerCase().includes(term)
      );
    }
    
    // Apply other filters
    if (selectedRooms) {
      if (selectedRooms === '10+') {
        filteredProps = filteredProps.filter(prop => prop.rooms >= 10);
      } else {
        filteredProps = filteredProps.filter(prop => prop.rooms === parseFloat(selectedRooms));
      }
    }
    
    if (selectedType) {
      filteredProps = filteredProps.filter(prop => prop.propertyType === selectedType);
    }
    
    if (selectedStatus) {
      filteredProps = filteredProps.filter(prop => prop.listingType === selectedStatus);
    }
    
    if (surfaceRange.min) {
      filteredProps = filteredProps.filter(prop => prop.surface >= parseFloat(surfaceRange.min));
    }
    
    if (surfaceRange.max) {
      filteredProps = filteredProps.filter(prop => prop.surface <= parseFloat(surfaceRange.max));
    }
    
    return filteredProps;
  }, [allProperties, debouncedSearchTerm, selectedRooms, selectedType, selectedStatus, surfaceRange.min, surfaceRange.max]);

  // Memoized paginated properties
  const paginatedProperties = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return filteredProperties.slice(from, to);
  }, [filteredProperties, page, pageSize]);

  // Remove old context-based loading logic - now using direct fetch

  // Update properties and loading state
  useEffect(() => {
    if (isInitialLoading) return;
    
    setLoading(true);
    setError('');
    
    try {
      setProperties(paginatedProperties);
      setTotalCount(filteredProperties.length);
    } catch (e: any) {
      setError(e?.message || 'Failed to filter properties');
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [paginatedProperties, filteredProperties.length, isInitialLoading]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Page loader component
  const PageLoader = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="space-y-2">
          <h3 className="text-xl font-heading font-semibold text-foreground">
            {t('language') === 'fr' ? 'Chargement des propriétés...' : 'Loading properties...'}
          </h3>
          <p className="text-muted-foreground">
            {t('language') === 'fr' 
              ? 'Nous récupérons les dernières offres pour vous'
              : 'We are fetching the latest offers for you'
            }
          </p>
        </div>
      </div>
    </div>
  );

  // Show page loader during initial loading
  if (isInitialLoading) {
    return <PageLoader />;
  }

  // Show error state if there's an error
  if (error && allProperties.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Search className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-heading font-semibold text-foreground">
              {t('language') === 'fr' ? 'Erreur de chargement' : 'Loading Error'}
            </h3>
            <p className="text-muted-foreground">
              {error}
            </p>
            <Button 
              onClick={fetchPropertiesDirectly}
              className="mt-4"
            >
              {t('language') === 'fr' ? 'Réessayer' : 'Retry'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              {t('properties.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('properties.subtitle')}
            </p>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Main Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  setPage(1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search by city, neighbourhood or type..."
                className="pl-16 py-8 text-lg rounded-2xl border-2 shadow-lg focus:shadow-2xl transition-all"
                disabled={isInitialLoading}
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(suggestion === 'All locations' ? 'all' : suggestion.toLowerCase());
                        setShowSuggestions(false);
                        setPage(1);
                      }}
                      className="w-full px-6 py-4 text-left hover:bg-muted/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <span className="text-lg">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* View Toggle and Filters Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-4"
            >
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">View:</span>
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-md"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-md"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setPage(1); }}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="sale">Buy</SelectItem>
                  </SelectContent>
                </Select>

                {/* Rooms Filter */}
                <Select value={selectedRooms} onValueChange={(v) => { setSelectedRooms(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room} {room === '10+' ? 'rooms' : 'rooms'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Property Type Filter */}
                <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setPage(1); }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Appartement</SelectItem>
                    <SelectItem value="house">Maison</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="loft">Loft</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                    <SelectItem value="chalet">Chalet</SelectItem>
                    <SelectItem value="castle">Château</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>{t('properties.filters.more')}</span>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-muted/20 rounded-2xl border border-border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price Range (text field in DB; left as client hint only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix (CHF)</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      type="number"
                    />
                  </div>
                </div>

                {/* Surface Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Surface (m²)</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Min"
                      value={surfaceRange.min}
                      onChange={(e) => { setSurfaceRange(prev => ({ ...prev, min: e.target.value })); setPage(1); }}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={surfaceRange.max}
                      onChange={(e) => { setSurfaceRange(prev => ({ ...prev, max: e.target.value })); setPage(1); }}
                      type="number"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRooms('');
                      setSelectedType('');
                      setSelectedStatus('');
                      setPriceRange({ min: '', max: '' });
                      setSurfaceRange({ min: '', max: '' });
                      setPage(1);
                    }}
                    className="w-full"
                  >
                    Effacer les filtres
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-lg text-foreground font-semibold">
              {totalCount} {t('properties.results')}
            </p>
            <p className="text-muted-foreground">
              {t('language') === 'fr' ? 'Propriétés exclusives disponibles' : 'Exclusive properties available'}
            </p>
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('language') === 'fr' ? 'Plus récent' : 'Newest'}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Property Grid/List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              {t('language') === 'fr' ? 'Filtrage des propriétés...' : 'Filtering properties...'}
            </div>
          ) : (viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PropertyCard 
                    property={property}
                    showContactInfo={isAuthenticated}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PropertyListCard 
                    property={property}
                    showContactInfo={isAuthenticated}
                  />
                </motion.div>
              ))}
            </div>
          ))}

          {/* Empty State */}
          {!loading && properties.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24"
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  {t('properties.noResults')}
                </h3>
                <p className="text-muted-foreground">
                  {t('language') === 'fr' 
                    ? 'Essayez d\'ajuster vos filtres ou votre recherche' 
                    : 'Try adjusting your filters or search terms'
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRooms('');
                    setSelectedStatus('');
                    setSelectedType('');
                    setPriceRange({ min: '', max: '' });
                    setSurfaceRange({ min: '', max: '' });
                    setPage(1);
                  }}
                >
                  {t('properties.clearFilters')}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            {t('language') === 'fr' 
              ? `Affichage de ${(page - 1) * pageSize + 1} à ${Math.min(page * pageSize, totalCount)} sur ${totalCount} résultats`
              : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, totalCount)} of ${totalCount} results`
            }
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">{t('language') === 'fr' ? `Page ${page} sur ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); }}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 / page</SelectItem>
                <SelectItem value="24">24 / page</SelectItem>
                <SelectItem value="48">48 / page</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                {t('language') === 'fr' ? 'Précédent' : 'Previous'}
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                {t('language') === 'fr' ? 'Suivant' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};