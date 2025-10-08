// Import cities data - using dynamic import to handle large JSON file
let citiesData: any[] = [];

export interface SwissCity {
  id: string;
  name: string;
  formattedNames: string[];
  relatedName: string;
  isParent: boolean;
  code: number | string;
  officialCode: string;
  type: string;
  srchCtxt: number;
  nameSrch: boolean;
}

export interface CitySuggestion {
  name: string;
  type: string;
  canton: string;
  postalCode: string;
  isParent: boolean;
  id: string;
}

class CityService {
  private cities: SwissCity[] = [];
  private searchIndex: Map<string, SwissCity[]> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    if (this.isInitialized) return;
    
    // For now, use fallback data to ensure it works
    // TODO: Implement proper JSON loading later
    this.cities = this.getFallbackCities();
    this.buildSearchIndex();
    this.isInitialized = true;
  }

  private getFallbackCities(): SwissCity[] {
    // Fallback data with major Swiss cities
    return [
      { id: 'c1', name: 'Zürich', formattedNames: ['zurich'], relatedName: 'Ville - Zurich', isParent: true, code: 8000, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c2', name: 'Genève', formattedNames: ['geneve'], relatedName: 'Ville - Genève', isParent: true, code: 1200, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c3', name: 'Basel', formattedNames: ['basel'], relatedName: 'Ville - Basel-Stadt', isParent: true, code: 4000, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c4', name: 'Bern', formattedNames: ['bern'], relatedName: 'Ville - Bern', isParent: true, code: 3000, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c5', name: 'Lausanne', formattedNames: ['lausanne'], relatedName: 'Ville - Vaud', isParent: true, code: 1000, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c6', name: 'Winterthur', formattedNames: ['winterthur'], relatedName: 'Ville - Zurich', isParent: true, code: 8400, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c7', name: 'Luzern', formattedNames: ['luzern'], relatedName: 'Ville - Luzern', isParent: true, code: 6000, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c8', name: 'St. Gallen', formattedNames: ['st-gallen'], relatedName: 'Ville - St. Gallen', isParent: true, code: 9000, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c9', name: 'Lugano', formattedNames: ['lugano'], relatedName: 'Ville - Ticino', isParent: true, code: 6900, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c10', name: 'Biel/Bienne', formattedNames: ['biel', 'bienne'], relatedName: 'Ville - Bern', isParent: true, code: 2500, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c11', name: 'Thun', formattedNames: ['thun'], relatedName: 'Ville - Bern', isParent: true, code: 3600, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c12', name: 'Köniz', formattedNames: ['koniz'], relatedName: 'Ville - Bern', isParent: true, code: 3098, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c13', name: 'La Chaux-de-Fonds', formattedNames: ['la-chaux-de-fonds'], relatedName: 'Ville - Neuchâtel', isParent: true, code: 2300, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c14', name: 'Schaffhausen', formattedNames: ['schaffhausen'], relatedName: 'Ville - Schaffhausen', isParent: true, code: 8200, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c15', name: 'Fribourg', formattedNames: ['fribourg'], relatedName: 'Ville - Fribourg', isParent: true, code: 1700, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c16', name: 'Chur', formattedNames: ['chur'], relatedName: 'Ville - Graubünden', isParent: true, code: 7000, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c17', name: 'Neuchâtel', formattedNames: ['neuchatel'], relatedName: 'Ville - Neuchâtel', isParent: true, code: 2000, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c18', name: 'Vernier', formattedNames: ['vernier'], relatedName: 'Ville - Genève', isParent: true, code: 1214, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c19', name: 'Uster', formattedNames: ['uster'], relatedName: 'Ville - Zurich', isParent: true, code: 8610, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c20', name: 'Sion', formattedNames: ['sion'], relatedName: 'Ville - Valais', isParent: true, code: 1950, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c21', name: 'Montreux', formattedNames: ['montreux'], relatedName: 'Ville - Vaud', isParent: true, code: 1820, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c22', name: 'Vevey', formattedNames: ['vevey'], relatedName: 'Ville - Vaud', isParent: true, code: 1800, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c23', name: 'Nyon', formattedNames: ['nyon'], relatedName: 'Ville - Vaud', isParent: true, code: 1260, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c24', name: 'Morges', formattedNames: ['morges'], relatedName: 'Ville - Vaud', isParent: true, code: 1110, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true },
      { id: 'c25', name: 'Yverdon-les-Bains', formattedNames: ['yverdon-les-bains'], relatedName: 'Ville - Vaud', isParent: true, code: 1400, officialCode: '', type: 'ville', srchCtxt: 3, nameSrch: true }
    ];
  }

  private buildSearchIndex() {
    // Build a search index for faster lookups
    this.cities.forEach(city => {
      // Index by name
      const nameKey = city.name.toLowerCase();
      if (!this.searchIndex.has(nameKey)) {
        this.searchIndex.set(nameKey, []);
      }
      this.searchIndex.get(nameKey)!.push(city);

      // Index by formatted names
      city.formattedNames.forEach(formattedName => {
        const formattedKey = formattedName.toLowerCase();
        if (!this.searchIndex.has(formattedKey)) {
          this.searchIndex.set(formattedKey, []);
        }
        this.searchIndex.get(formattedKey)!.push(city);
      });

      // Index by postal code
      const postalCode = city.code.toString();
      if (postalCode && postalCode !== '0') {
        if (!this.searchIndex.has(postalCode)) {
          this.searchIndex.set(postalCode, []);
        }
        this.searchIndex.get(postalCode)!.push(city);
      }
    });
  }

  /**
   * Search for cities based on a query string
   * Returns suggestions similar to immobilier.ch format
   */
  async searchCities(query: string, limit: number = 10): Promise<CitySuggestion[]> {
    // Ensure data is initialized
    if (!this.isInitialized) {
      await this.initializeData();
    }

    if (!query || query.length < 1) {
      return this.getPopularCities(limit);
    }

    const searchTerm = query.toLowerCase().trim();
    const suggestions: CitySuggestion[] = [];
    const seen = new Set<string>();

    // Check if search term is numeric (postal code search)
    const isNumericSearch = /^\d+$/.test(searchTerm);

    // First, try exact matches (highest priority)
    const exactMatches = this.searchIndex.get(searchTerm) || [];
    exactMatches.forEach(city => {
      if (!seen.has(city.id)) {
        suggestions.push(this.formatCitySuggestion(city));
        seen.add(city.id);
      }
    });

    // For numeric searches, prioritize postal code matches
    if (isNumericSearch) {
      // Try partial postal code matches
      for (const [key, cities] of this.searchIndex.entries()) {
        if (/^\d+$/.test(key) && key.startsWith(searchTerm) && suggestions.length < limit) {
          cities.forEach(city => {
            if (!seen.has(city.id) && suggestions.length < limit) {
              suggestions.push(this.formatCitySuggestion(city));
              seen.add(city.id);
            }
          });
        }
      }
    } else {
      // For text searches, try prefix matches (high priority)
      for (const [key, cities] of this.searchIndex.entries()) {
        if (key.startsWith(searchTerm) && suggestions.length < limit) {
          cities.forEach(city => {
            if (!seen.has(city.id) && suggestions.length < limit) {
              suggestions.push(this.formatCitySuggestion(city));
              seen.add(city.id);
            }
          });
        }
      }
    }

    // Finally, try contains matches (lower priority)
    for (const [key, cities] of this.searchIndex.entries()) {
      if (key.includes(searchTerm) && suggestions.length < limit) {
        cities.forEach(city => {
          if (!seen.has(city.id) && suggestions.length < limit) {
            suggestions.push(this.formatCitySuggestion(city));
            seen.add(city.id);
          }
        });
      }
    }

    // Sort suggestions by relevance (parent cities first, then by name length)
    return suggestions
      .sort((a, b) => {
        // Parent cities first
        if (a.isParent && !b.isParent) return -1;
        if (!a.isParent && b.isParent) return 1;
        
        // Then by name length (shorter names first for better UX)
        return a.name.length - b.name.length;
      })
      .slice(0, limit);
  }

  /**
   * Get popular Swiss cities (major cities)
   */
  private getPopularCities(limit: number): CitySuggestion[] {
    const popularCityNames = [
      'Zürich', 'Genève', 'Basel', 'Bern', 'Lausanne', 
      'Winterthur', 'Luzern', 'St. Gallen', 'Lugano', 'Biel/Bienne'
    ];

    const suggestions: CitySuggestion[] = [];
    const seen = new Set<string>();

    popularCityNames.forEach(cityName => {
      const cities = this.searchIndex.get(cityName.toLowerCase());
      if (cities && cities.length > 0 && !seen.has(cities[0].id)) {
        // Get the parent city (isParent: true)
        const parentCity = cities.find(city => city.isParent) || cities[0];
        suggestions.push(this.formatCitySuggestion(parentCity));
        seen.add(parentCity.id);
      }
    });

    return suggestions.slice(0, limit);
  }

  /**
   * Format a city for display in suggestions
   */
  private formatCitySuggestion(city: SwissCity): CitySuggestion {
    // Extract canton from relatedName (e.g., "Ville - Zurich" -> "Zurich")
    const canton = city.relatedName.split(' - ').pop() || '';
    
    return {
      name: city.name,
      type: this.getCityTypeLabel(city.type),
      canton: canton,
      postalCode: city.code.toString(),
      isParent: city.isParent,
      id: city.id
    };
  }

  /**
   * Get localized city type label
   */
  private getCityTypeLabel(type: string, language: string = 'en'): string {
    const typeMap: Record<string, Record<string, string>> = {
      'ville': { en: 'City', fr: 'Ville', de: 'Stadt' },
      'comm.': { en: 'Municipality', fr: 'Commune', de: 'Gemeinde' },
      'cant.': { en: 'Canton', fr: 'Canton', de: 'Kanton' },
      'dist.': { en: 'District', fr: 'District', de: 'Bezirk' }
    };
    return typeMap[type]?.[language] || typeMap[type]?.['en'] || 'Location';
  }

  /**
   * Get city by ID
   */
  getCityById(id: string): SwissCity | undefined {
    return this.cities.find(city => city.id === id);
  }

  /**
   * Get all unique parent cities
   */
  getParentCities(): SwissCity[] {
    return this.cities.filter(city => city.isParent);
  }

  /**
   * Get cities by canton
   */
  getCitiesByCanton(canton: string): SwissCity[] {
    return this.cities.filter(city => 
      city.relatedName.toLowerCase().includes(canton.toLowerCase())
    );
  }
}

// Export singleton instance
export const cityService = new CityService();
