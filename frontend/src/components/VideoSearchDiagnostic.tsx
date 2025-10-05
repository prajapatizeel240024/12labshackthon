import React, { useState } from 'react';
import VideoSearchService from '../service/VideoSearchService';

const VideoSearchDiagnostic: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const results: any = {};

    try {
      // Check 1: API Key
      try {
        const envConfig = require('../env.json');
        results.apiKey = {
          exists: !!envConfig?.TwLabs,
          value: envConfig?.TwLabs ? `tlk_...${envConfig.TwLabs.slice(-4)}` : 'Not found'
        };
      } catch (error) {
        results.apiKey = {
          exists: false,
          value: 'Error loading env.json: ' + error
        };
      }

      // Check 2: Index ID
      const indexId = localStorage.getItem('twelvelabs_index_id');
      results.indexId = {
        exists: !!indexId && indexId !== 'undefined',
        value: indexId || 'Not found'
      };

      // Check 3: Videos in localStorage
      const videosData = localStorage.getItem('twelvelabs_videos');
      results.videos = {
        exists: !!videosData,
        count: videosData ? JSON.parse(videosData).length : 0,
        data: videosData ? JSON.parse(videosData) : []
      };

      // Check 4: Video Search Service
      results.videoSearchAvailable = VideoSearchService.isVideoSearchAvailable();

      // Check 5: Test actual search
      if (results.videoSearchAvailable) {
        try {
          const searchResult = await VideoSearchService.searchVideos('fashion');
          results.searchTest = {
            success: searchResult.success,
            resultCount: searchResult.results.length,
            error: searchResult.error,
            results: searchResult.results
          };
        } catch (error) {
          results.searchTest = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

      setDiagnosticResults(results);
    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error';
      setDiagnosticResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  const clearData = () => {
    localStorage.removeItem('twelvelabs_index_id');
    localStorage.removeItem('twelvelabs_videos');
    setDiagnosticResults(null);
    alert('Local storage cleared. Please upload videos again.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Video Search Diagnostic Tool
      </h2>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={runDiagnostic}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Diagnostic...' : 'Run Diagnostic'}
          </button>
          <button
            onClick={clearData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All Data
          </button>
        </div>

        {diagnosticResults && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Diagnostic Results:
            </h3>

            {/* API Key Check */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                🔑 API Key Status
              </h4>
              <div className={`p-3 rounded-lg ${
                diagnosticResults.apiKey?.exists 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm ${
                  diagnosticResults.apiKey?.exists 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {diagnosticResults.apiKey?.exists ? '✅ Found' : '❌ Missing'}: {diagnosticResults.apiKey?.value}
                </p>
              </div>
            </div>

            {/* Index ID Check */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                📁 Index ID Status
              </h4>
              <div className={`p-3 rounded-lg ${
                diagnosticResults.indexId?.exists 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm ${
                  diagnosticResults.indexId?.exists 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {diagnosticResults.indexId?.exists ? '✅ Found' : '❌ Missing'}: {diagnosticResults.indexId?.value}
                </p>
              </div>
            </div>

            {/* Videos Check */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                🎥 Videos Status
              </h4>
              <div className={`p-3 rounded-lg ${
                diagnosticResults.videos?.exists && diagnosticResults.videos?.count > 0
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm ${
                  diagnosticResults.videos?.exists && diagnosticResults.videos?.count > 0
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {diagnosticResults.videos?.exists && diagnosticResults.videos?.count > 0 
                    ? `✅ Found ${diagnosticResults.videos.count} videos` 
                    : '❌ No videos found'
                  }
                </p>
                {diagnosticResults.videos?.data && diagnosticResults.videos.data.length > 0 && (
                  <div className="mt-2">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                        View video details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                        {JSON.stringify(diagnosticResults.videos.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>

            {/* Video Search Service Check */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                🔍 Video Search Service
              </h4>
              <div className={`p-3 rounded-lg ${
                diagnosticResults.videoSearchAvailable
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm ${
                  diagnosticResults.videoSearchAvailable
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {diagnosticResults.videoSearchAvailable ? '✅ Available' : '❌ Not Available'}
                </p>
              </div>
            </div>

            {/* Search Test */}
            {diagnosticResults.searchTest && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🧪 Search Test Results
                </h4>
                <div className={`p-3 rounded-lg ${
                  diagnosticResults.searchTest.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <p className={`text-sm ${
                    diagnosticResults.searchTest.success
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {diagnosticResults.searchTest.success 
                      ? `✅ Search successful - Found ${diagnosticResults.searchTest.resultCount} results`
                      : `❌ Search failed: ${diagnosticResults.searchTest.error}`
                    }
                  </p>
                  {diagnosticResults.searchTest.results && diagnosticResults.searchTest.results.length > 0 && (
                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                          View search results
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                          {JSON.stringify(diagnosticResults.searchTest.results, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Recommendations
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {!diagnosticResults.apiKey?.exists && (
                  <li>• Add your API key to src/env.json</li>
                )}
                {!diagnosticResults.indexId?.exists && (
                  <li>• Create an index in the Admin Dashboard</li>
                )}
                {(!diagnosticResults.videos?.exists || diagnosticResults.videos?.count === 0) && (
                  <li>• Upload videos in the Admin Dashboard</li>
                )}
                {diagnosticResults.videos?.data?.some((v: any) => v.status !== 'ready') && (
                  <li>• Wait for videos to finish indexing (status should be 'ready')</li>
                )}
                {diagnosticResults.videoSearchAvailable && diagnosticResults.searchTest?.success && (
                  <li>• ✅ Everything looks good! Try asking questions in chat now.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSearchDiagnostic;
