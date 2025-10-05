import React from 'react';
import { VideoCameraIcon, SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import VideoSearchService from '../service/VideoSearchService';

const VideoSearchGuide: React.FC = () => {
  const isVideoSearchAvailable = VideoSearchService.isVideoSearchAvailable();

  const exampleQueries = [
    "What fashion trends are shown in the videos?",
    "Show me information about clothing styles",
    "Tell me about the fashion brands mentioned",
    "What accessories are featured in the videos?",
    "Find content about retail fashion",
    "Show me fashion demonstrations or tutorials"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
          <VideoCameraIcon className="h-8 w-8 text-blue-600" />
          Video Search Integration Guide
        </h2>
        
        <div className={`p-4 rounded-lg mb-6 ${
          isVideoSearchAvailable 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-center gap-3">
            {isVideoSearchAvailable ? (
              <SparklesIcon className="h-6 w-6 text-green-600" />
            ) : (
              <VideoCameraIcon className="h-6 w-6 text-amber-600" />
            )}
            <div>
              <h3 className={`font-semibold ${
                isVideoSearchAvailable ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'
              }`}>
                {isVideoSearchAvailable ? '✅ Video Search Ready!' : '⚠️ Setup Required'}
              </h3>
              <p className={`text-sm mt-1 ${
                isVideoSearchAvailable ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
              }`}>
                {isVideoSearchAvailable 
                  ? 'Your video library is ready for search. Ask questions about your uploaded videos!'
                  : 'Please upload videos and create an index in the Admin Dashboard first.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {isVideoSearchAvailable && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              How to Use Video Search
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>It's automatic!</strong> When you ask questions in any chat, the system will automatically:
              </p>
              <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 text-sm mt-2 space-y-1">
                <li>Search through your uploaded videos</li>
                <li>Find relevant content and timestamps</li>
                <li>Provide video names and confidence scores</li>
                <li>Give you detailed information from the videos</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Example Queries for Fashion Content
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQueries.map((query, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{query}"</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Expected Response Format
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
{`Based on the videos in your library, I found relevant information:

📹 **CONTENT palacio hierro fashion** (Confidence: 85%)
   ⏰ Time: 2:15 - 4:30
   📝 Content: Discussion about latest fashion trends in retail

📹 **Demo Video** (Confidence: 72%)
   ⏰ Time: 1:45 - 3:20
   📝 Content: Fashion styling tips and brand recommendations

[Additional context and explanation]`}
              </pre>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              💡 Pro Tips
            </h4>
            <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
              <li>• Be specific in your questions for better results</li>
              <li>• Ask about topics you know are in your videos</li>
              <li>• Use the "Fashion Video Expert" chat configuration for best results</li>
              <li>• The system searches both visual and spoken content</li>
            </ul>
          </div>
        </div>
      )}

      {!isVideoSearchAvailable && (
        <div className="text-center py-8">
          <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Videos Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload some videos to get started with video search!
          </p>
          <a 
            href="/admin" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <VideoCameraIcon className="h-5 w-5" />
            Go to Admin Dashboard
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoSearchGuide;
