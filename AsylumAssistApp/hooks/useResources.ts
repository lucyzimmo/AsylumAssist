import { useState, useEffect, useCallback } from 'react';
import { Resource, ResourceCategory, ResourceSearchParams, UserBookmarks } from '../types/resources';
import resourcesApi from '../services/api/resourcesApi';

export interface UseResourcesReturn {
  // Data
  resources: Resource[];
  featuredResources: Resource[];
  bookmarkedResources: Resource[];
  searchSuggestions: string[];
  searchHistory: string[];
  
  // State
  loading: boolean;
  searching: boolean;
  error: string | null;
  
  // Search
  searchQuery: string;
  selectedCategory: ResourceCategory;
  searchResults: Resource[];
  totalResults: number;
  searchTime: number;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: ResourceCategory) => void;
  searchResources: (params?: ResourceSearchParams) => Promise<void>;
  clearSearch: () => void;
  
  // Bookmarks
  toggleBookmark: (resourceId: string) => Promise<void>;
  isBookmarked: (resourceId: string) => boolean;
  
  // Suggestions
  getSuggestions: (query: string) => Promise<void>;
  
  // Refresh
  refreshResources: () => Promise<void>;
  clearSearchHistory: () => Promise<void>;
}

export const useResources = (): UseResourcesReturn => {
  // State
  const [resources, setResources] = useState<Resource[]>([]);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('All');
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  
  const [bookmarks, setBookmarks] = useState<UserBookmarks>({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update search results when query or category changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() || selectedCategory !== 'All') {
        handleSearch();
      } else {
        setSearchResults(resources);
        setTotalResults(resources.length);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, resources]);

  // Load bookmarks when resources change
  useEffect(() => {
    loadBookmarkedResources();
  }, [bookmarks, resources]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allResources, featured, history, userBookmarks] = await Promise.all([
        resourcesApi.getAllResources(),
        resourcesApi.getFeaturedResources(),
        resourcesApi.getSearchHistory(),
        Promise.resolve(resourcesApi.getUserBookmarks()),
      ]);

      setResources(allResources);
      setSearchResults(allResources);
      setTotalResults(allResources.length);
      setFeaturedResources(featured);
      setSearchHistory(history);
      setBookmarks(userBookmarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarkedResources = async () => {
    try {
      const bookmarked = await resourcesApi.getBookmarkedResources();
      setBookmarkedResources(bookmarked);
    } catch (err) {
      console.error('Failed to load bookmarked resources:', err);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setError(null);

      const params: ResourceSearchParams = {
        query: searchQuery.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      };

      const result = await resourcesApi.searchResources(params);
      
      setSearchResults(result.resources);
      setTotalResults(result.totalCount);
      setSearchTime(result.searchTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const searchResources = useCallback(async (params?: ResourceSearchParams) => {
    try {
      setSearching(true);
      setError(null);

      const searchParams = params || {
        query: searchQuery.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      };

      const result = await resourcesApi.searchResources(searchParams);
      
      setSearchResults(result.resources);
      setTotalResults(result.totalCount);
      setSearchTime(result.searchTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [searchQuery, selectedCategory]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSearchResults(resources);
    setTotalResults(resources.length);
    setSearchTime(0);
    setSearchSuggestions([]);
  }, [resources]);

  const toggleBookmark = useCallback(async (resourceId: string) => {
    try {
      const newBookmarkState = await resourcesApi.toggleBookmark(resourceId);
      
      // Update local bookmarks state
      const updatedBookmarks = { ...bookmarks };
      updatedBookmarks[resourceId] = {
        resourceId,
        isBookmarked: newBookmarkState,
        bookmarkedAt: newBookmarkState ? new Date().toISOString() : undefined,
      };
      setBookmarks(updatedBookmarks);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle bookmark');
    }
  }, [bookmarks]);

  const isBookmarked = useCallback((resourceId: string): boolean => {
    return bookmarks[resourceId]?.isBookmarked || false;
  }, [bookmarks]);

  const getSuggestions = useCallback(async (query: string) => {
    try {
      const suggestions = await resourcesApi.getSearchSuggestions(query, 5);
      setSearchSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    }
  }, []);

  const refreshResources = useCallback(async () => {
    await loadInitialData();
  }, []);

  const clearSearchHistory = useCallback(async () => {
    try {
      await resourcesApi.clearSearchHistory();
      setSearchHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear search history');
    }
  }, []);

  return {
    // Data
    resources,
    featuredResources,
    bookmarkedResources,
    searchSuggestions,
    searchHistory,
    
    // State
    loading,
    searching,
    error,
    
    // Search
    searchQuery,
    selectedCategory,
    searchResults,
    totalResults,
    searchTime,
    
    // Actions
    setSearchQuery,
    setSelectedCategory,
    searchResources,
    clearSearch,
    
    // Bookmarks
    toggleBookmark,
    isBookmarked,
    
    // Suggestions
    getSuggestions,
    
    // Refresh
    refreshResources,
    clearSearchHistory,
  };
};