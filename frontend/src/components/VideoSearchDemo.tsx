import React, { useState } from 'react';
import { useVideoSearch } from '../hooks/useVideoSearch';
import VideoSearchStatus from './VideoSearchStatus';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const VideoSearchDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchVideos, isSearching, lastResults, isVideoSearchAvailable, formatResultsForChat } = useVideoSearch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await searchVideos(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Video Search Integration Demo
        </h2>
        <VideoSearchStatus className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          This demo shows how the AI can search through your uploaded videos and provide detailed information.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about content in your videos..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            disabled={!isVideoSearchAvailable}
          />
          <button
            onClick={handleSearch}
            disabled={!isVideoSearchAvailable || isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {!isVideoSearchAvailable && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              <strong>Video search not available:</strong> Please upload videos and create an index in the Admin Dashboard first.
            </p>
          </div>
        )}

        {lastResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Search Results ({lastResults.length} found)
            </h3>
            
            <div className="space-y-3">
              {lastResults.map((result, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {result.snippet}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
                      {Math.floor(result.startTime / 60)}:{Math.floor(result.startTime % 60).toString().padStart(2, '0')} - {Math.floor(result.endTime / 60)}:{Math.floor(result.endTime % 60).toString().padStart(2, '0')}
                    </span>
                    <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                How this appears in chat:
              </h4>
              <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {formatResultsForChat(lastResults)}
              </pre>
            </div>
          </div>
        )}

        {searchQuery && lastResults.length === 0 && !isSearching && isVideoSearchAvailable && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No relevant videos found for "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSearchDemo;
