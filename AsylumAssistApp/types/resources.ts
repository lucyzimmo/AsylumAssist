export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  keywords: string[];
  isOfficial: boolean;
  lastUpdated: string;
}

export type ResourceCategory = 'All' | 'Forms' | 'Guides' | 'Legal' | 'Statistics';

export interface ResourceSearchParams {
  query?: string;
  category?: ResourceCategory;
  keywords?: string[];
}

export interface ResourceSearchResult {
  resources: Resource[];
  totalCount: number;
  searchTime: number;
}

export interface BookmarkState {
  resourceId: string;
  isBookmarked: boolean;
  bookmarkedAt?: string;
}

export interface UserBookmarks {
  [resourceId: string]: BookmarkState;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'All',
  'Forms', 
  'Guides',
  'Legal',
  'Statistics'
];