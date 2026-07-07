import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package } from 'lucide-react';
import { formatPrice } from '../lib/utils';

interface SuggestionProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  images: string[];
}

export function SearchWithSuggestions() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/products/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Search suggestions error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    navigate(`/product/${slug}`);
    setQuery('');
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  const getImageUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('/storage/products/')) {
      return url.replace('/storage/products/', '/api/images/');
    }
    return url;
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Rechercher un produit..."
          className="w-full pl-10 pr-10 py-2.5 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {showSuggestions && (query || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(product.slug)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mt-3" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      {product.sku && (
                        <span className="text-gray-500 dark:text-gray-400">SKU: {product.sku}</span>
                      )}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center">
              <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Aucun résultat trouve</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
