import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cityService, CitySuggestion } from '@/lib/cityService';
import { useTranslation } from '@/hooks/useTranslation';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: CitySuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'form' | 'alert';
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search by city",
  className = "",
  disabled = false,
  variant = 'default'
}) => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Get styling based on variant
  const getInputStyles = () => {
    switch (variant) {
      case 'form':
        return "w-full h-10 pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
      case 'alert':
        return "w-full h-12 pl-10 pr-3 py-3 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
      default:
        return "w-full pl-16 pr-6 py-4 text-lg rounded-2xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg focus:shadow-2xl transition-all duration-200";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'form':
      case 'alert':
        return "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none";
      default:
        return "absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground z-10 pointer-events-none";
    }
  };

  const getContainerStyles = () => {
    switch (variant) {
      case 'form':
      case 'alert':
        return "relative w-full";
      default:
        return "relative w-full";
    }
  };

  const getSuggestionsStyles = () => {
    switch (variant) {
      case 'form':
        return "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto";
      case 'alert':
        return "absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto";
      default:
        return "absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto";
    }
  };

  // Debounced search function
  const searchCities = useCallback(async (query: string) => {
    // Always show suggestions, even for empty query (popular cities)
    if (query.length < 1) {
      // Show popular cities for empty query
      try {
        const results = await cityService.searchCities('', 10);
        setSuggestions(results);
      } catch (error) {
        console.error('Error searching cities:', error);
        setSuggestions([]);
      }
      return;
    }

    setIsLoading(true);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search (shorter delay for better responsiveness)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await cityService.searchCities(query, 10);
        setSuggestions(results);
      } catch (error) {
        console.error('Error searching cities:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    
    if (newValue.trim()) {
      setShowSuggestions(true);
      searchCities(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: CitySuggestion, e?: React.MouseEvent) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Only call onSelect, let the parent handle the value update
    onSelect(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(true);
    if (value.trim()) {
      searchCities(value);
    } else {
      // Show popular cities when focused with empty input
      searchCities('');
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={getContainerStyles()}>
      {/* Search Input */}
      <div className="relative">
        <Search className={getIconStyles()} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`${getInputStyles()} ${className}`}
          title="Search by city name or postal code (e.g., 8000, 1200)"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={getSuggestionsStyles()}
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={`${suggestion.id}-${index}`}
                type="button"
                onClick={(e) => handleSuggestionSelect(suggestion, e)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                  selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                } ${variant === 'default' ? 'first:rounded-t-2xl last:rounded-b-2xl' : 'first:rounded-t-md last:rounded-b-md'}`}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className={`h-4 w-4 flex-shrink-0 ${variant === 'default' ? 'text-muted-foreground' : 'text-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${variant === 'default' ? 'text-foreground' : 'text-gray-900 dark:text-white'}`}>
                      {suggestion.name}
                    </div>
                    <div className={`text-sm ${variant === 'default' ? 'text-muted-foreground' : 'text-gray-500 dark:text-gray-400'}`}>
                      {suggestion.type} - {suggestion.canton}
                    </div>
                  </div>
                </div>
                {suggestion.postalCode && (
                  <div className={`text-xs px-2 py-1 rounded ${variant === 'default' ? 'text-muted-foreground bg-muted' : 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {suggestion.postalCode}
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results State */}
      <AnimatePresence>
        {showSuggestions && suggestions.length === 0 && value.length >= 2 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl z-50 p-6 text-center"
          >
            <div className="space-y-2">
              <Search className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {t('language') === 'fr' 
                  ? 'Aucune ville trouvée' 
                  : 'No cities found'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {t('language') === 'fr' 
                  ? 'Essayez avec un autre nom de ville' 
                  : 'Try with a different city name'
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
