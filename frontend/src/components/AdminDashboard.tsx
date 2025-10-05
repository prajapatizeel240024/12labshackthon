import React, { useEffect, useState } from 'react';
import { 
  VideoCameraIcon,
  SparklesIcon,
  FolderIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import env configuration
import envConfig from '../env.json';   

interface VideoAsset {
  id: string;
  title: string;
  url: string;
  duration: number;
  thumbnail?: string;
  summary: string;
  indexed: boolean;
  indexId?: string;
  videoId?: string;
  taskId?: string;
  uploadedAt: Date;
  status: 'pending' | 'indexing' | 'ready' | 'failed';
}

interface SearchResult {
  videoId: string;
  title: string;
  confidence: number;
  startTime: number;
  endTime: number;
  snippet: string;
}

interface StatCardProps {
  title?: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: VideoAsset['status'] }> = ({ status }) => {
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    indexing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${statusClasses[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function TwelveLabsAdminDashboard() {
  const [indexId, setIndexId] = useState<string>('');
  const [indexName, setIndexName] = useState('');
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'search' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [creatingIndex, setCreatingIndex] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  // Get API key from env.json
  const apiKey = envConfig?.TwLabs || '';

  useEffect(() => {
    loadIndexId();
    loadVideos();
    console.log('Component mounted - current indexId:', indexId);
  }, []);

  useEffect(() => {
    console.log('indexId changed:', indexId);
  }, [indexId]);

  // Auto-refresh indexing videos every 15 seconds
  useEffect(() => {
    const indexingVideos = videos.filter(v => v.status === 'indexing' && v.taskId);
    
    if (indexingVideos.length === 0) {
      return; // No indexing videos, don't start interval
    }

    console.log(`🔄 Auto-refresh started for ${indexingVideos.length} indexing video(s)`);
    
    const intervalId = setInterval(async () => {
      console.log('🔄 Auto-checking status of indexing videos...');
      
      for (const video of indexingVideos) {
        if (video.taskId && apiKey) {
          try {
            const response = await fetch(`http://localhost:3001/api/tasks/${video.taskId}?apiKey=${apiKey}`);
            if (response.ok) {
              const data = await response.json();
              console.log('📦 Task status response:', data);
              
              if (data.status === 'ready') {
                console.log(`✅ Video "${video.title}" is now READY!`);
                console.log('Video details:', {
                  videoId: data.video_id,
                  duration: data.metadata?.duration,
                  summary: data.metadata?.summary,
                  fullMetadata: data.metadata
                });
                
                setVideos(currentVideos => 
                  currentVideos.map(v => 
                    v.id === video.id
                      ? {
                          ...v,
                          status: 'ready' as const,
                          indexed: true,
                          videoId: data.video_id,
                          duration: data.metadata?.duration || 0,
                          summary: data.metadata?.summary || 'Processing complete - ready for search'
                        }
                      : v
                  )
                );
              }
            }
          } catch (error) {
            console.error(`Error checking status for ${video.title}:`, error);
          }
        }
      }
    }, 15000); // Check every 15 seconds

    return () => {
      console.log('🛑 Auto-refresh stopped');
      clearInterval(intervalId);
    };
  }, [videos, apiKey]);

  const loadIndexId = () => {
    const saved = localStorage.getItem('twelvelabs_index_id');
    console.log('Loading index ID from localStorage:', saved);
    if (saved) {
      setIndexId(saved);
    }
  };

  const loadVideos = () => {
    const saved = localStorage.getItem('twelvelabs_videos');
    if (saved) {
      const parsed = JSON.parse(saved);
      setVideos(parsed.map((v: any) => ({
        ...v,
        uploadedAt: new Date(v.uploadedAt)
      })));
    }
  };

  const saveVideos = (updatedVideos: VideoAsset[]) => {
    setVideos(updatedVideos);
    localStorage.setItem('twelvelabs_videos', JSON.stringify(updatedVideos));
  };

  const createIndex = async () => {
    if (!apiKey) {
      alert('Please add your API key to src/env.json file:\n{\n  "TwLabs": "tlk_YOUR_KEY_HERE"\n}');
      return;
    }

    if (!indexName) {
      alert('Please enter an index name');
      return;
    }

    setCreatingIndex(true);
    try {
      const response = await fetch('http://localhost:3001/api/indexes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey,
          index_name: indexName,
          models: [
            {
              model_name: 'marengo2.7',
              model_options: ['visual', 'audio']
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create index`);
      }

      const data = await response.json();
      console.log('Index creation response:', data); // Debug log
      
      // Get the index ID from the response
      const newIndexId = data._id || data.id;
      
      console.log('Extracted index ID:', newIndexId);
      
      if (!newIndexId) {
        throw new Error('No index ID returned from API');
      }

      setIndexId(newIndexId);
      localStorage.setItem('twelvelabs_index_id', newIndexId);
      console.log('Index ID saved to localStorage:', newIndexId);
      
      alert(`Index created successfully! Index ID: ${newIndexId}`);
      setIndexName('');
    } catch (error) {
      console.error('Failed to create index:', error);
      if (error instanceof Error && error.message.includes('fetch')) {
        alert('Failed to connect to backend server. Please ensure the server is running on port 3001.');
      } else {
        alert('Failed to create index: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } finally {
      setCreatingIndex(false);
    }
  };

  const deleteIndex = async () => {
    if (!indexId) {
      alert('No index ID to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the index "${indexId}"? This action cannot be undone and will remove all associated videos.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/indexes/${indexId}?apiKey=${apiKey}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete index');
      }

      // Clear the index ID from state and localStorage
      setIndexId('');
      localStorage.removeItem('twelvelabs_index_id');
      
      // Also clear all videos since they belong to the deleted index
      setVideos([]);
      localStorage.removeItem('twelvelabs_videos');
      
      alert('Index deleted successfully');
    } catch (error) {
      console.error('Failed to delete index:', error);
      alert('Failed to delete index: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const verifyExistingIndex = async (existingIndexId: string) => {
    if (!apiKey) {
      alert('Please add your API key to src/env.json file');
      return;
    }

    if (!existingIndexId || existingIndexId.trim() === '') {
      alert('Please enter an Index ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/indexes/${existingIndexId}?apiKey=${apiKey}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify index');
      }

      const data = await response.json();
      console.log('Index verification response:', data);
      
      // Save the verified index ID
      setIndexId(existingIndexId);
      localStorage.setItem('twelvelabs_index_id', existingIndexId);
      
      alert(`✅ Index verified successfully!\n\nIndex Name: ${data.index_name || 'N/A'}\nIndex ID: ${existingIndexId}`);
    } catch (error) {
      console.error('Failed to verify index:', error);
      alert('Failed to verify index. Please check that the Index ID is correct and try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const syncVideosFromIndex = async () => {
    if (!apiKey) {
      alert('Please add your API key to src/env.json file');
      return;
    }
  
    if (!indexId) {
      alert('Please configure an Index ID first in the Settings tab');
      return;
    }
  
    setLoading(true);
    try {
      console.log('🔄 Syncing videos from Twelve Labs index:', indexId);
      
      // Clear existing videos before syncing to avoid conflicts
      console.log('🗑️ Clearing existing videos...');
      setVideos([]);
      localStorage.removeItem('twelvelabs_videos');
      
      const response = await fetch(`http://localhost:3001/api/indexes/${indexId}/videos?apiKey=${apiKey}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch videos');
      }
  
      const data = await response.json();
      console.log('📹 Videos from Twelve Labs:', data);
      console.log('📹 Full API response:', JSON.stringify(data, null, 2));
      
      if (!data.data || data.data.length === 0) {
        alert('No videos found in this index. Upload some videos first!');
        return;
      }
  
      // Convert Twelve Labs videos to our VideoAsset format
      const syncedVideos: VideoAsset[] = data.data.map((video: any) => {
        console.log('🔍 Raw video from API:', JSON.stringify(video, null, 2));
        console.log('🔍 Checking title fields:', {
          'video._id': video._id,
          'video.metadata': video.metadata,
          'video.metadata?.filename': video.metadata?.filename,
          'video.metadata?.file_name': video.metadata?.file_name,
          'video.metadata?.video_title': video.metadata?.video_title,
          'video.metadata?.title': video.metadata?.title,
          'video.metadata?.name': video.metadata?.name,
          'video.metadata?.original_filename': video.metadata?.original_filename,
          'video.file_name': video.file_name,
          'video.filename': video.filename,
          'video.video_title': video.video_title,
          'video.title': video.title,
          'video.name': video.name,
          'All metadata keys': video.metadata ? Object.keys(video.metadata) : 'no metadata',
          'All video keys': Object.keys(video)
        });
        
        // Try multiple possible locations for the video title
        // Check metadata first, then top-level properties
        let title = video.metadata?.filename 
          || video.metadata?.file_name 
          || video.metadata?.video_title 
          || video.metadata?.title
          || video.metadata?.name
          || video.metadata?.original_filename
          || video.file_name
          || video.filename
          || video.video_title
          || video.title
          || video.name
          || `Untitled Video ${video._id.substring(0, 8)}`;
        
        // Clean up the title by removing file extensions and extra whitespace
        if (title && typeof title === 'string') {
          title = title
            .replace(/\.[^/.]+$/, '') // Remove file extension
            .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim(); // Remove leading/trailing whitespace
        }
        
        console.log('📝 Extracted title:', title);
        console.log('📝 Cleaned title:', title);
        console.log('📝 Full video.metadata:', video.metadata);
        
        return {
          id: video._id,
          title: title,
          url: video.hls?.video_url || '',
          duration: video.metadata?.duration || 0,
          thumbnail: video.hls?.thumbnail_urls?.[0] || '',
          summary: `Synced from Twelve Labs - ${video.metadata?.engine_ids?.join(', ') || 'Indexed'}`,
          indexed: true,
          indexId: indexId,
          videoId: video._id,
          uploadedAt: new Date(video.created_at),
          status: 'ready' as const
        };
      });
  
      console.log('✅ Converted videos:', syncedVideos.map(v => ({ videoId: v.videoId, title: v.title })));
      
      // Save all synced videos (we cleared before, so no need to merge)
      saveVideos(syncedVideos);
      
      const videoList = syncedVideos.map((v, i) => `${i + 1}. ${v.title}`).join('\n');
      alert(`✅ Successfully synced ${syncedVideos.length} video(s) from your index!\n\nVideos:\n${videoList}`);
    } catch (error) {
      console.error('Failed to sync videos:', error);
      alert('Failed to sync videos from index.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, MOV, AVI, WEBM)');
        return;
      }
      
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        alert('File size must be less than 2GB');
        return;
      }
      
      setSelectedFile(file);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const uploadVideo = async () => {
    if (!apiKey) {
      alert('Please add your API key to src/env.json file');
      return;
    }

    if (!indexId) {
      alert('Please create or enter an Index ID first');
      return;
    }

    if (!videoTitle || !selectedFile) {
      alert('Please provide a video title and select a file');
      return;
    }

    // Debug logging
    console.log('Upload attempt - indexId:', indexId);
    console.log('Upload attempt - apiKey:', apiKey ? 'Present' : 'Missing');
    console.log('Upload attempt - videoTitle:', videoTitle);
    console.log('Upload attempt - selectedFile:', selectedFile?.name);

    // Additional validation for indexId
    if (!indexId || indexId === 'undefined' || indexId.trim() === '') {
      alert('Please create an index first in the Settings tab');
      return;
    }

    const newVideo: VideoAsset = {
      id: Date.now().toString(),
      title: videoTitle,
      url: URL.createObjectURL(selectedFile),
      duration: 0,
      summary: 'Uploading...',
      indexed: false,
      uploadedAt: new Date(),
      status: 'indexing'
    };

    const updatedVideos = [...videos, newVideo];
    saveVideos(updatedVideos);

    setLoading(true);
    setUploadProgress({ [newVideo.id]: 10 });

    try {
      const formData = new FormData();
      formData.append('video_file', selectedFile);
      formData.append('index_id', indexId);
      formData.append('apiKey', apiKey);

      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      newVideo.taskId = data._id;
      saveVideos(updatedVideos);
      
      // Start polling for status
      pollTaskStatus(data._id, newVideo.id);
      
      // Reset form
      setVideoTitle('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      newVideo.status = 'failed';
      newVideo.summary = 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error');
      saveVideos(updatedVideos);
      
      if (error instanceof Error && error.message.includes('fetch')) {
        alert('Failed to connect to backend server. Please ensure the server is running on port 3001.');
      } else {
        alert('Failed to upload video: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const pollTaskStatus = async (taskId: string, videoId: string) => {
    const maxAttempts = 120; // Increased from 60 to 120 (10 minutes total)
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      try {
        console.log(`Checking task status - Attempt ${attempts + 1}/${maxAttempts} for task ${taskId}`);
        
        const response = await fetch(`http://localhost:3001/api/tasks/${taskId}?apiKey=${apiKey}`);
        
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const data = await response.json();
        console.log('Task status response:', data);
        
        // Update progress based on attempts
        const progress = Math.min(95, (attempts / maxAttempts) * 100);
        setUploadProgress(prev => ({ 
          ...prev, 
          [videoId]: progress
        }));

        if (data.status === 'ready') {
          console.log('Task completed successfully!');
          
          // Use a function to get the latest videos state
          setVideos(currentVideos => {
            const videoIndex = currentVideos.findIndex(v => v.id === videoId);
            if (videoIndex !== -1) {
              const updatedVideos = [...currentVideos];
              updatedVideos[videoIndex] = {
                ...updatedVideos[videoIndex],
                status: 'ready' as const,
                indexed: true,
                videoId: data.video_id,
                duration: data.metadata?.duration || 0,
                summary: data.metadata?.summary || 'Video indexed successfully'
              };
              
              // Save to localStorage
              localStorage.setItem('twelvelabs_videos', JSON.stringify(updatedVideos));
              return updatedVideos;
            }
            return currentVideos;
          });
          
          // Clear progress
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[videoId];
            return newProgress;
          });
          return;
        } else if (data.status === 'failed') {
          console.log('Task failed:', data);
          
          setVideos(currentVideos => {
            const videoIndex = currentVideos.findIndex(v => v.id === videoId);
            if (videoIndex !== -1) {
              const updatedVideos = [...currentVideos];
              updatedVideos[videoIndex] = {
                ...updatedVideos[videoIndex],
                status: 'failed' as const,
                summary: data.error || 'Indexing failed'
              };
              
              localStorage.setItem('twelvelabs_videos', JSON.stringify(updatedVideos));
              return updatedVideos;
            }
            return currentVideos;
          });
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[videoId];
            return newProgress;
          });
          return;
        } else {
          console.log(`Task status: ${data.status}, continuing to poll...`);
        }

        attempts++;
        if (attempts < maxAttempts) {
          // Increase delay for longer videos (up to 10 seconds)
          const delay = Math.min(10000, 2000 + (attempts * 100));
          setTimeout(() => checkStatus(), delay);
        } else {
          console.log('Polling timeout reached');
          
          // Timeout after max attempts
          setVideos(currentVideos => {
            const videoIndex = currentVideos.findIndex(v => v.id === videoId);
            if (videoIndex !== -1) {
              const updatedVideos = [...currentVideos];
              updatedVideos[videoIndex] = {
                ...updatedVideos[videoIndex],
                status: 'failed' as const,
                summary: 'Indexing timeout - please check manually'
              };
              
              localStorage.setItem('twelvelabs_videos', JSON.stringify(updatedVideos));
              return updatedVideos;
            }
            return currentVideos;
          });
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[videoId];
            return newProgress;
          });
        }
      } catch (error) {
        console.error('Status check failed:', error);
        attempts++;
        if (attempts < maxAttempts) {
          // Retry with exponential backoff
          const delay = Math.min(30000, 2000 * Math.pow(2, attempts - 1));
          setTimeout(() => checkStatus(), delay);
        } else {
          console.error('Max retry attempts reached');
          
          setVideos(currentVideos => {
            const videoIndex = currentVideos.findIndex(v => v.id === videoId);
            if (videoIndex !== -1) {
              const updatedVideos = [...currentVideos];
              updatedVideos[videoIndex] = {
                ...updatedVideos[videoIndex],
                status: 'failed' as const,
                summary: 'Status check failed - please refresh and check manually'
              };
              
              localStorage.setItem('twelvelabs_videos', JSON.stringify(updatedVideos));
              return updatedVideos;
            }
            return currentVideos;
          });
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[videoId];
            return newProgress;
          });
        }
      }
    };

    // Start polling immediately
    checkStatus();
  };

  const searchVideos = async () => {
    if (!apiKey || !indexId || !searchQuery) {
      alert('Please configure API key and Index ID first');
      return;
    }

    console.log('🔍 STARTING VIDEO SEARCH');
    console.log('API Key:', apiKey ? '✅ Present' : '❌ Missing');
    console.log('Index ID:', indexId);
    console.log('Search Query:', searchQuery);

    setLoading(true);
    try {
      const searchBody = {
        apiKey: apiKey,
        index_id: indexId,
        query: searchQuery,
        options: ['visual']
      };
      
      console.log('📤 Sending search request:', searchBody);
      
      const response = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchBody)
      });
      
      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Search failed:', errorData);
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      console.log('✅ Search response data:', data);
      
      if (data.data && data.data.length > 0) {
        // Twelve Labs returns results grouped by video with clips
        const results: SearchResult[] = [];
        
        console.log('🔍 Available videos for matching:');
        videos.forEach(v => {
          console.log(`  - videoId: "${v.videoId}" → title: "${v.title}"`);
        });
        
        data.data.forEach((videoGroup: any) => {
          const videoId = videoGroup.id;
          
          // Try to find matching video - check both exact match and if stored ID contains search ID
          let matchedVideo = videos.find(v => v.videoId === videoId);
          
          if (!matchedVideo) {
            // Sometimes IDs might be different formats, try partial match
            matchedVideo = videos.find(v => v.videoId?.includes(videoId) || videoId?.includes(v.videoId || ''));
          }
          
          console.log(`🔍 Search result video ID: "${videoId}"`);
          console.log(`   → Matched video: ${matchedVideo ? `"${matchedVideo.title}"` : 'NOT FOUND'}`);
          
          // Process each clip in this video
          if (videoGroup.clips && videoGroup.clips.length > 0) {
            videoGroup.clips.forEach((clip: any) => {
              results.push({
                videoId: videoId,
                title: matchedVideo?.title || `Video_${videoId.substring(0, 8)}`,
                confidence: clip.score / 100 || 0,  // Convert score to 0-1 range
                startTime: Math.floor(clip.start || 0),
                endTime: Math.floor(clip.end || 0),
                snippet: `${clip.confidence} confidence match - Score: ${clip.score.toFixed(1)}`
              });
            });
          }
        });
        
        console.log('📊 Final parsed results:', results);
        setSearchResults(results);
      } else {
        console.log('⚠️ No data in response');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      if (error instanceof Error && error.message.includes('fetch')) {
        alert('Failed to connect to backend server. Please ensure the server is running on port 3001.');
      } else {
        alert('Search failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      const updatedVideos = videos.filter(v => v.id !== videoId);
      saveVideos(updatedVideos);
    }
  };

  const refreshVideoStatus = async (video: VideoAsset) => {
    if (!video.taskId) {
      alert('No task ID found for this video');
      return;
    }

    try {
      console.log(`Manually checking status for task: ${video.taskId}`);
      const response = await fetch(`http://localhost:3001/api/tasks/${video.taskId}?apiKey=${apiKey}`);
      
      if (!response.ok) {
        throw new Error('Failed to check status');
      }

      const data = await response.json();
      console.log('Manual status check response:', data);

      const updatedVideos = videos.map(v => {
        if (v.id === video.id) {
          if (data.status === 'ready') {
            return {
              ...v,
              status: 'ready' as const,
              indexed: true,
              videoId: data.video_id,
              duration: data.metadata?.duration || 0,
              summary: data.metadata?.summary || 'Video indexed successfully'
            };
          } else if (data.status === 'failed') {
            return {
              ...v,
              status: 'failed' as const,
              summary: data.error || 'Indexing failed'
            };
          } else {
            return {
              ...v,
              status: 'indexing' as const,
              summary: `Status: ${data.status} - Still processing...`
            };
          }
        }
        return v;
      });

      saveVideos(updatedVideos);
      
      if (data.status === 'ready') {
        alert('Video has been successfully indexed!');
      } else if (data.status === 'failed') {
        alert('Video indexing failed. Please try uploading again.');
      } else {
        alert(`Video is still processing. Status: ${data.status}`);
      }
    } catch (error) {
      console.error('Manual status check failed:', error);
      alert('Failed to check video status. Please try again.');
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds === 0) {
      return '--:--';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const indexedCount = videos.filter(v => v.indexed).length;
  const totalDuration = videos.reduce((acc, v) => acc + v.duration, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <VideoCameraIcon className="h-8 w-8 text-blue-600" />
            Video Intelligence Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage video assets with AI-powered search
          </p>
        </div>

        {/* API Key Warning */}
        {!apiKey && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>API Key Missing:</strong> Please add your Twelve Labs API key to <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">src/env.json</code>:
                <pre className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-800 rounded">
{`{
  "TwLabs": "tlk_YOUR_KEY_HERE"
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-8">
            {['overview', 'videos', 'search', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Videos"
                icon={<VideoCameraIcon className="h-6 w-6" />}  
                label="Total Videos"
                value={videos.length}
                color="blue"
              />
              <StatCard
                icon={<SparklesIcon className="h-6 w-6" />}
                label="Total Videos"
                value={videos.length}
                color="blue"
              />
              <StatCard title="Indexed Videos"
                icon={<ClockIcon className="h-6 w-6" />}
                label="Indexed Videos"
                value={indexedCount}
                color="green"
              />
              <StatCard title="Total Duration"
                icon={<ClockIcon className="h-6 w-6" />}
                label="Total Duration"
                value={formatDuration(totalDuration)}
                color="purple"
              />
              <StatCard
                icon={<FolderIcon className="h-6 w-6" />}
                label="Index Status"
                value={indexId ? 'Configured' : 'Not Set'}
                color={indexId ? 'green' : 'orange'}
              />
            </div>

            {/* Recent Videos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Recent Videos</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {videos.slice(0, 5).map((video) => (
                  <div key={video.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <PlayIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {video.summary}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDuration(video.duration)}
                          </span>
                          <StatusBadge status={video.status} />
                        </div>
                      </div>
                    </div>
                    {uploadProgress[video.id] && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[video.id]}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {videos.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No videos yet. Create an index and upload your first video!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {/* Info Box */}
            {indexId && videos.length === 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> If you've already uploaded videos to Twelve Labs, click the <strong>"Sync from Index"</strong> button below to load them into this dashboard!
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Upload New Video</h3>
              
              {!indexId && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Please create an index in the Settings tab before uploading videos.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Video Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter video title..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    disabled={!indexId}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Select Video File</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                      disabled={!indexId}
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="mt-2">
                        <span className="text-blue-600 font-medium">Click to upload</span>
                        {' or drag and drop'}
                      </p>
                      {selectedFile && (
                        <p className="text-sm text-green-600 mt-2">✓ {selectedFile.name}</p>
                      )}
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={uploadVideo}
                  disabled={!indexId || indexId === 'undefined' || !apiKey || loading || !selectedFile || !videoTitle}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </div>

            {/* Video List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Video Library ({videos.length})</h3>
                <button
                  onClick={syncVideosFromIndex}
                  disabled={!indexId || !apiKey || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  title="Load videos from your Twelve Labs index"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Syncing...' : 'Sync from Index'}
                </button>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {videos.map((video) => (
                  <div key={video.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <PlayIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{video.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {video.summary}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDuration(video.duration)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {video.uploadedAt.toLocaleDateString()}
                            </span>
                            <StatusBadge status={video.status} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(video.status === 'indexing' || video.status === 'pending') && (
                          <button
                            onClick={() => refreshVideoStatus(video)}
                            className="text-blue-600 hover:text-blue-700 p-2"
                            title="Refresh status"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Delete video"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {uploadProgress[video.id] && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Indexing...</span>
                          <span>{Math.round(uploadProgress[video.id])}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[video.id]}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {videos.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No videos uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Sync Reminder */}
            {videos.length === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>No videos loaded!</strong> Please go to the <strong>Videos</strong> tab and click <strong>"Sync from Index"</strong> to load your videos before searching.
                  </div>
                </div>
              </div>
            )}
            
            {/* Debug Info */}
            {videos.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>✅ {videos.length} videos loaded.</strong> Stored video IDs:
                  <div className="mt-2 space-y-1 font-mono text-xs">
                    {videos.slice(0, 3).map(v => (
                      <div key={v.id}>• {v.videoId} = "{v.title}"</div>
                    ))}
                    {videos.length > 3 && <div>... and {videos.length - 3} more</div>}
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Search Videos</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search for content in videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
                <button
                  onClick={searchVideos}
                  disabled={loading || !indexId || !apiKey || !searchQuery}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold">Results ({searchResults.length})</h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="p-6">
                      <h4 className="font-medium">{result.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {result.snippet}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
                          {formatDuration(result.startTime)} - {formatDuration(result.endTime)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Confidence: {Math.round(result.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-6">Twelve Labs Configuration</h3>
              
              <div className="space-y-6">
                {/* API Key Status */}
                <div>
                  <label className="block text-sm font-medium mb-2">API Key Status</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {apiKey ? (
                      <div>
                        <span className="text-green-600 dark:text-green-400">✓ API Key loaded from env.json</span>
                        <p className="text-xs text-gray-500 mt-1">Key: tlk_...{apiKey.slice(-4)}</p>
                      </div>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">✗ No API key found in src/env.json</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    To add or update your API key, edit <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">src/env.json</code>
                  </p>
                </div>

                {/* Current Index Status */}
                {indexId && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800 dark:text-green-200">✓ Index Configured</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Index ID: <code className="bg-green-100 dark:bg-green-800 px-1 rounded">{indexId}</code>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={syncVideosFromIndex}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                          title="Load videos from this index"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sync Videos
                        </button>
                        <button
                          onClick={deleteIndex}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          title="Delete this index"
                        >
                          Delete Index
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider with "OR" */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 font-medium">
                      Choose one option below
                    </span>
                  </div>
                </div>

                {/* Option 1: Use Existing Index */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <span className="text-purple-600 dark:text-purple-400">Option 1:</span> Use Existing Index
                  </label>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      If you already have an index from Twelve Labs, enter the Index ID below:
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={indexId}
                        onChange={(e) => setIndexId(e.target.value)}
                        placeholder="Enter your existing Index ID (e.g., 65f8a3b2c1d4e5f6...)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        disabled={!apiKey}
                      />
                      <button
                        onClick={() => verifyExistingIndex(indexId)}
                        disabled={!apiKey || !indexId || loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {loading ? 'Verifying...' : 'Verify & Use'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider with "OR" */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 font-medium">OR</span>
                  </div>
                </div>

                {/* Option 2: Create New Index */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <span className="text-blue-600 dark:text-blue-400">Option 2:</span> Create New Index
                  </label>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Create a brand new index for your video library:
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={indexName}
                        onChange={(e) => setIndexName(e.target.value)}
                        placeholder="Enter index name (e.g., My Video Library)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        disabled={!apiKey}
                      />
                      <button
                        onClick={createIndex}
                        disabled={!apiKey || !indexName || creatingIndex}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {creatingIndex ? 'Creating...' : 'Create New'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold mb-2">Quick Setup Guide</h4>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>
                      <strong>Setup Backend Server:</strong>
                      <pre className="mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs">
cd backend
npm init -y
npm install express cors multer form-data node-fetch
node server.js
                      </pre>
                    </li>
                    <li>
                      <strong>Add API Key:</strong> Edit <code className="bg-white dark:bg-gray-800 px-1 rounded">src/env.json</code> with your Twelve Labs API key
                    </li>
                    <li>
                      <strong>Create Index:</strong> Use the form above to create a new index
                    </li>
                    <li>
                      <strong>Upload Videos:</strong> Go to the Videos tab to start uploading content
                    </li>
                  </ol>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> The backend server handles all API calls to avoid CORS issues.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}