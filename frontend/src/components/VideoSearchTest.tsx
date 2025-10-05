import React, { useState } from 'react';
import { useVideoSearch } from '../hooks/useVideoSearch';
import VideoSearchService from '../service/VideoSearchService';

const VideoSearchTest: React.FC = () => {
  const [testQuery, setTestQuery] = useState('fashion trends');
  const { searchVideos, isSearching, lastResults, formatResultsForChat } = useVideoSearch();

  const handleTest = async () => {
    await searchVideos(testQuery);
  };

  const isVideoSearchAvailable = VideoSearchService.isVideoSearchAvailable();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Video Search Test
      </h2>

      {!isVideoSearchAvailable && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">
            <strong>Video search not available:</strong> Please upload videos and create an index first.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Query:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Enter your question about the videos..."
              disabled={!isVideoSearchAvailable}
            />
            <button
              onClick={handleTest}
              disabled={!isVideoSearchAvailable || isSearching}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Test Search'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quick Test Queries:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'fashion trends',
              'clothing styles',
              'fashion brands',
              'retail fashion',
              'fashion accessories',
              'fashion demonstration'
            ].map((query, index) => (
              <button
                key={index}
                onClick={() => setTestQuery(query)}
                className="p-2 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                disabled={!isVideoSearchAvailable}
              >
                "{query}"
              </button>
            ))}
          </div>
        </div>

        {lastResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Raw Search Results:
            </h3>
            <div className="space-y-3">
              {lastResults.map((result, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {result.title}
                    </h4>
                    <span className="text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
                      {Math.round(result.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {result.snippet}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>
                      Time: {Math.floor(result.startTime / 60)}:{Math.floor(result.startTime % 60).toString().padStart(2, '0')} - {Math.floor(result.endTime / 60)}:{Math.floor(result.endTime % 60).toString().padStart(2, '0')}
                    </span>
                    <span>Video ID: {result.videoId}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Formatted for Chat:
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {formatResultsForChat(lastResults)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {testQuery && lastResults.length === 0 && !isSearching && isVideoSearchAvailable && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No results found for "{testQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSearchTest;
