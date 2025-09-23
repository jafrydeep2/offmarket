import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Property } from '@/components/PropertyCard';
import { supabase } from '@/lib/supabaseClient';

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id'>) => Promise<Property>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getProperty: (id: string) => Property | undefined;
  incrementViews: (id: string) => Promise<void>;
  incrementInquiries: (id: string) => Promise<void>;
  clearProperties: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

interface PropertyProviderProps {
  children: ReactNode;
}

function mapDbToProperty(row: any): Property {
  return {
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
    availabilityStatus: row.availability_status || 'immediate', // Fallback to 'immediate' if null/undefined
    images: Array.isArray(row.images) ? row.images : (row.images ? JSON.parse(row.images) : []),
    videoUrl: row.video_url ?? undefined,
    features: Array.isArray(row.features) ? row.features : (row.features ? JSON.parse(row.features) : []),
    contactInfo: row.contact_info ?? undefined,
    views: row.views ?? 0,
    inquiries: row.inquiries ?? 0,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    featured: row.featured ?? false,
  };
}

function mapPropertyToDb(prop: Omit<Property, 'id'> | Partial<Property>) {
  const base: any = { ...prop } as any;
  if ('propertyType' in base) base.property_type = base.propertyType; delete base.propertyType;
  if ('listingType' in base) base.listing_type = base.listingType; delete base.listingType;
  if ('availabilityDate' in base) base.availability_date = base.availabilityDate; delete base.availabilityDate;
  if ('availabilityStatus' in base) base.availability_status = base.availabilityStatus; delete base.availabilityStatus;
  if ('videoUrl' in base) base.video_url = base.videoUrl; delete base.videoUrl;
  if ('contactInfo' in base) base.contact_info = base.contactInfo; delete base.contactInfo;
  if ('createdAt' in base) base.created_at = base.createdAt; delete base.createdAt;
  if ('updatedAt' in base) base.updated_at = base.updatedAt; delete base.updatedAt;

  // Ensure arrays are stored as JSON/array
  if ('images' in base && base.images && !Array.isArray(base.images)) base.images = [];
  if ('features' in base && base.features && !Array.isArray(base.features)) base.features = [];

  return base;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);

  // Load properties from Supabase on mount
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error.message);
        setProperties([]);
        return;
      }
      
      const mappedProperties = (data || []).map(mapDbToProperty);
      setProperties(mappedProperties);
    };

    load();
  }, []);

  const addProperty = async (propertyData: Omit<Property, 'id'>) => {
    const nowIso = new Date().toISOString();
    const dbPayload = mapPropertyToDb({ ...propertyData, createdAt: nowIso, updatedAt: nowIso });
    
    // Remove featured field if it doesn't exist in database yet
    if ('featured' in dbPayload) {
      delete dbPayload.featured;
    }
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(dbPayload)
        .select('*')
        .single();

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error adding property:', error.message);
        
        // Check if it's an authentication error
        if (error.message?.includes('JWT') || 
            error.message?.includes('token') || 
            error.message?.includes('unauthorized') ||
            error.message?.includes('permission') ||
            error.code === 'PGRST301') {
          console.error('Authentication error during property add:', error);
          throw new Error('Authentication error. Please log in again.');
        }
        
        throw error;
      }

      const newProp = mapDbToProperty(data);
      setProperties(prev => [newProp, ...prev]);
      return newProp;
    } catch (error) {
      console.error('PropertyContext addProperty error:', error);
      throw error;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    const nowIso = new Date().toISOString();
    const dbPayload = mapPropertyToDb({ ...propertyData, updatedAt: nowIso });
    
    // Remove featured field if it doesn't exist in database yet
    if ('featured' in dbPayload) {
      delete dbPayload.featured;
    }
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(dbPayload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error updating property:', error.message);
        
        // Check if it's an authentication error
        if (error.message?.includes('JWT') || 
            error.message?.includes('token') || 
            error.message?.includes('unauthorized') ||
            error.message?.includes('permission') ||
            error.code === 'PGRST301') {
          console.error('Authentication error during property update:', error);
          throw new Error('Authentication error. Please log in again.');
        }
        
        throw error;
      }

      const updated = mapDbToProperty(data);
      setProperties(prev => prev.map(p => (p.id === id ? updated : p)));
    } catch (error) {
      console.error('PropertyContext updateProperty error:', error);
      throw error;
    }
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting property:', error.message);
      throw error;
    }

    setProperties(prev => prev.filter(property => property.id !== id));
  };

  const getProperty = (id: string) => {
    return properties.find(property => property.id === id);
  };

  const incrementViews = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('increment_property_views', { p_id: id });
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error incrementing views (RPC):', error.message);
      return;
    }
    setProperties(prev => prev.map(p => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p)));
  }, []);

  const incrementInquiries = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('increment_property_inquiries', { p_id: id });
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error incrementing inquiries (RPC):', error.message);
      return;
    }
    setProperties(prev => prev.map(p => (p.id === id ? { ...p, inquiries: (p.inquiries || 0) + 1 } : p)));
  }, []);

  const clearProperties = useCallback(() => {
    setProperties([]);
  }, []);

  const value: PropertyContextType = {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    getProperty,
    incrementViews,
    incrementInquiries,
    clearProperties,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};
