import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  isFavorited: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !user?.id) {
        setFavoriteIds(new Set());
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);
      if (!error) {
        setFavoriteIds(new Set((data || []).map((r: any) => String(r.property_id))));
      }
      setLoading(false);
    };
    load();
  }, [isAuthenticated, user?.id]);

  const isFavorited = (propertyId: string) => favoriteIds.has(propertyId);

  const toggleFavorite = async (propertyId: string) => {
    if (!isAuthenticated || !user?.id) return;
    if (favoriteIds.has(propertyId)) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      if (!error) {
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
      }
      return;
    }
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, property_id: propertyId });
    if (!error) {
      setFavoriteIds(prev => new Set(prev).add(propertyId));
    }
  };

  const value = useMemo(() => ({ favoriteIds, isFavorited, toggleFavorite, loading }), [favoriteIds, loading]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};
