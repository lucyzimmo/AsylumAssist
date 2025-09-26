import { Resource, ResourceCategory, ResourceSearchParams, ResourceSearchResult, UserBookmarks } from '../../types/resources';
import resourcesData from '../../data/resources/resourcesData.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  BOOKMARKS: '@asylumassist_bookmarks',
  SEARCH_HISTORY: '@asylumassist_search_history',
};

class ResourcesApiService {
  private resources: Resource[] = resourcesData.resources;
  private bookmarks: UserBookmarks = {};

  constructor() {
    this.loadBookmarksFromStorage();
  }

  /**
   * Search resources with keyword matching and filtering
   */
  async searchResources(params: ResourceSearchParams = {}): Promise<ResourceSearchResult> {
    const startTime = Date.now();
    
    let filteredResources = [...this.resources];

    // Filter by category
    if (params.category && params.category !== 'All') {
      filteredResources = filteredResources.filter(
        resource => resource.category === params.category
      );
    }

    // Search by query (title, description, keywords)
    if (params.query && params.query.trim()) {
      const queryLower = params.query.toLowerCase().trim();
      
      filteredResources = filteredResources.filter(resource => {
        const titleMatch = resource.title.toLowerCase().includes(queryLower);
        const descriptionMatch = resource.description.toLowerCase().includes(queryLower);
        const keywordMatch = resource.keywords.some(keyword => 
          keyword.toLowerCase().includes(queryLower)
        );
        
        return titleMatch || descriptionMatch || keywordMatch;
      });

      // Sort by relevance (title matches first, then keyword matches)
      filteredResources.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(queryLower);
        const bTitle = b.title.toLowerCase().includes(queryLower);
        
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        
        const aKeywords = a.keywords.filter(k => k.toLowerCase().includes(queryLower)).length;
        const bKeywords = b.keywords.filter(k => k.toLowerCase().includes(queryLower)).length;
        
        return bKeywords - aKeywords;
      });
    }

    // Filter by specific keywords if provided
    if (params.keywords && params.keywords.length > 0) {
      const keywordsLower = params.keywords.map(k => k.toLowerCase());
      filteredResources = filteredResources.filter(resource =>
        keywordsLower.some(keyword =>
          resource.keywords.some(resourceKeyword =>
            resourceKeyword.toLowerCase().includes(keyword)
          )
        )
      );
    }

    const searchTime = Date.now() - startTime;
    
    // Save search query to history
    if (params.query && params.query.trim()) {
      await this.saveSearchToHistory(params.query.trim());
    }

    return {
      resources: filteredResources,
      totalCount: filteredResources.length,
      searchTime,
    };
  }

  /**
   * Get all resources
   */
  async getAllResources(): Promise<Resource[]> {
    return this.resources;
  }

  /**
   * Get resource by ID
   */
  async getResourceById(id: string): Promise<Resource | null> {
    return this.resources.find(resource => resource.id === id) || null;
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(category: ResourceCategory): Promise<Resource[]> {
    if (category === 'All') {
      return this.resources;
    }
    return this.resources.filter(resource => resource.category === category);
  }

  /**
   * Get popular/featured resources
   */
  async getFeaturedResources(limit: number = 5): Promise<Resource[]> {
    // Return official USCIS forms and most essential guides
    const featured = this.resources.filter(resource => 
      resource.isOfficial && ['form-i589', 'form-i765', 'asylum-guide-uscis', 'work-authorization-guide', 'legal-aid-directory'].includes(resource.id)
    );
    return featured.slice(0, limit);
  }

  /**
   * Bookmark management
   */
  async toggleBookmark(resourceId: string): Promise<boolean> {
    const isCurrentlyBookmarked = this.bookmarks[resourceId]?.isBookmarked || false;
    
    this.bookmarks[resourceId] = {
      resourceId,
      isBookmarked: !isCurrentlyBookmarked,
      bookmarkedAt: !isCurrentlyBookmarked ? new Date().toISOString() : undefined,
    };

    await this.saveBookmarksToStorage();
    return !isCurrentlyBookmarked;
  }

  /**
   * Get bookmarked resources
   */
  async getBookmarkedResources(): Promise<Resource[]> {
    const bookmarkedIds = Object.keys(this.bookmarks).filter(
      id => this.bookmarks[id]?.isBookmarked
    );
    
    return this.resources.filter(resource => bookmarkedIds.includes(resource.id));
  }

  /**
   * Check if resource is bookmarked
   */
  isResourceBookmarked(resourceId: string): boolean {
    return this.bookmarks[resourceId]?.isBookmarked || false;
  }

  /**
   * Get all bookmarks
   */
  getUserBookmarks(): UserBookmarks {
    return { ...this.bookmarks };
  }

  /**
   * Search suggestions based on keywords
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase().trim();
    const suggestions = new Set<string>();

    // Add matching keywords
    this.resources.forEach(resource => {
      resource.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower) && keyword.toLowerCase() !== queryLower) {
          suggestions.add(keyword);
        }
      });
    });

    // Add matching titles (partial)
    this.resources.forEach(resource => {
      const words = resource.title.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.includes(queryLower) && word !== queryLower && word.length > 2) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Validate resource URL
   */
  async validateResourceUrl(url: string): Promise<boolean> {
    try {
      // Check if URL is from trusted government domains
      const trustedDomains = [
        'uscis.gov',
        'justice.gov',
        'state.gov',
        'dhs.gov',
        'aclu.org',
        'americanimmigrationcouncil.org'
      ];

      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      return trustedDomains.some(trusted => domain.endsWith(trusted));
    } catch {
      return false;
    }
  }

  /**
   * Get resource statistics
   */
  async getResourceStats(): Promise<{
    totalResources: number;
    byCategory: Record<ResourceCategory, number>;
    officialResources: number;
    lastUpdated: string;
  }> {
    const byCategory = this.resources.reduce((acc, resource) => {
      acc[resource.category] = (acc[resource.category] || 0) + 1;
      return acc;
    }, {} as Record<ResourceCategory, number>);

    // Add 'All' category count
    byCategory['All'] = this.resources.length;

    const officialResources = this.resources.filter(r => r.isOfficial).length;
    const lastUpdated = this.resources.reduce((latest, resource) => {
      return resource.lastUpdated > latest ? resource.lastUpdated : latest;
    }, '');

    return {
      totalResources: this.resources.length,
      byCategory,
      officialResources,
      lastUpdated,
    };
  }

  /**
   * Private storage methods
   */
  private async saveBookmarksToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BOOKMARKS,
        JSON.stringify(this.bookmarks)
      );
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }

  private async loadBookmarksFromStorage(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) {
        this.bookmarks = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      this.bookmarks = {};
    }
  }

  private async saveSearchToHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const updatedHistory = [query, ...history.filter(q => q !== query)].slice(0, 10);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SEARCH_HISTORY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<string[]> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }
}

// Export singleton instance
export const resourcesApi = new ResourcesApiService();
export default resourcesApi;