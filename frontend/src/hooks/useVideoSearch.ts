import { useState, useCallback } from 'react';
import VideoSearchService, { VideoSearchResult } from '../service/VideoSearchService';

export interface UseVideoSearchReturn {
  searchVideos: (query: string) => Promise<VideoSearchResult[]>;
  isSearching: boolean;
  lastResults: VideoSearchResult[];
  isVideoSearchAvailable: boolean;
  formatResultsForChat: (results: VideoSearchResult[]) => string;
}

export const useVideoSearch = (): UseVideoSearchReturn => {
  const [isSearching, setIsSearching] = useState(false);
  const [lastResults, setLastResults] = useState<VideoSearchResult[]>([]);

  const searchVideos = useCallback(async (query: string): Promise<VideoSearchResult[]> => {
    setIsSearching(true);
    try {
      const response = await VideoSearchService.searchVideos(query);
      if (response.success) {
        setLastResults(response.results);
        return response.results;
      } else {
        console.error('Video search failed:', response.error);
        setLastResults([]);
        return [];
      }
    } catch (error) {
      console.error('Video search error:', error);
      setLastResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const formatResultsForChat = useCallback((results: VideoSearchResult[]): string => {
    return VideoSearchService.formatSearchResults(results);
  }, []);

  return {
    searchVideos,
    isSearching,
    lastResults,
    isVideoSearchAvailable: VideoSearchService.isVideoSearchAvailable(),
    formatResultsForChat
  };
};
