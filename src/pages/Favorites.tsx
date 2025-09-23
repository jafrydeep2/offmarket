import React, { useEffect, useState } from 'react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useProperties } from '@/contexts/PropertyContext';
import { PropertyCard } from '@/components/PropertyCard';

const FavoritesPage: React.FC = () => {
  const { favoriteIds } = useFavorites();
  const { properties } = useProperties();
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    setList(properties.filter(p => favoriteIds.has(p.id)));
  }, [favoriteIds, properties]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-heading font-bold mb-6">My Favorites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {list.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="text-muted-foreground mt-6">No favorites yet.</p>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
