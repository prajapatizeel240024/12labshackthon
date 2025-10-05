// Define VideoAsset interface locally to avoid circular dependency
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

export interface VideoSearchResult {
  videoId: string;
  title: string;
  confidence: number;
  startTime: number;
  endTime: number;
  snippet: string;
  videoUrl?: string;
}

export interface VideoSearchResponse {
  success: boolean;
  results: VideoSearchResult[];
  error?: string;
}

class VideoSearchService {
  private apiKey: string;
  private backendUrl: string = 'http://localhost:3001';

  constructor() {
    // Get API key from env.json
    this.apiKey = this.getApiKey();
  }

  private getApiKey(): string {
    try {
      // Import env config dynamically to avoid SSR issues
      const envConfig = require('../env.json');
      console.log('Loaded env config:', envConfig);
      return envConfig?.TwLabs || '';
    } catch (error) {
      console.error('Failed to load API key:', error);
      return '';
    }
  }

  private getIndexId(): string | null {
    return localStorage.getItem('twelvelabs_index_id');
  }

  /**
   * Search through uploaded videos based on user query
   */
  async searchVideos(query: string): Promise<VideoSearchResponse> {
    const indexId = this.getIndexId();
    
    if (!indexId || indexId === 'undefined') {
      return {
        success: false,
        results: [],
        error: 'No video index found. Please upload videos first.'
      };
    }

    if (!this.apiKey) {
      return {
        success: false,
        results: [],
        error: 'API key not configured.'
      };
    }

    try {
      // Use JSON instead of FormData
      const response = await fetch(`${this.backendUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          index_id: indexId,
          query: query,
          options: ['visual']
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          results: [],
          error: errorData.error || 'Search failed'
        };
      }

      const data = await response.json();
      
      if (data.data) {
        const videos = this.getStoredVideos();
        
        console.log('🔍 VideoSearchService - Available videos:', videos.map(v => ({ id: v.videoId, title: v.title })));
        
        const results: VideoSearchResult[] = [];
        
        data.data.forEach((videoGroup: any) => {
          const videoId = videoGroup.id;
          
          // Try exact match first, then partial match
          let video = videos.find(v => v.videoId === videoId);
          if (!video) {
            video = videos.find(v => v.videoId?.includes(videoId) || videoId?.includes(v.videoId || ''));
          }
          
          console.log(`🔍 Search result for videoId "${videoId}" → ${video ? `"${video.title}"` : 'NOT FOUND'}`);
          
          // Process clips
          if (videoGroup.clips && videoGroup.clips.length > 0) {
            videoGroup.clips.forEach((clip: any) => {
              results.push({
                videoId: videoId,
                title: video?.title || `Video_${videoId.substring(0, 8)}`,
                confidence: clip.score / 100 || 0,
                startTime: Math.floor(clip.start || 0),
                endTime: Math.floor(clip.end || 0),
                snippet: `${clip.confidence} confidence - Score: ${clip.score.toFixed(1)}`,
                videoUrl: video?.url
              });
            });
          }
        });

        return {
          success: true,
          results: results
        };
      }

      return {
        success: true,
        results: []
      };
    } catch (error) {
      console.error('Video search error:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Get stored videos from localStorage
   */
  private getStoredVideos(): VideoAsset[] {
    try {
      const saved = localStorage.getItem('twelvelabs_videos');
      if (saved) {
        return JSON.parse(saved).map((v: any) => ({
          ...v,
          uploadedAt: new Date(v.uploadedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load stored videos:', error);
      return [];
    }
  }

  /**
   * Check if video search is available
   */
  isVideoSearchAvailable(): boolean {
    const indexId = this.getIndexId();
    return !!(this.apiKey && indexId && indexId !== 'undefined');
  }

  /**
   * Get video information for a specific video ID
   */
  getVideoInfo(videoId: string): VideoAsset | null {
    const videos = this.getStoredVideos();
    return videos.find(v => v.videoId === videoId) || null;
  }

  /**
   * Format video search results for display
   */
  formatSearchResults(results: VideoSearchResult[]): string {
    if (results.length === 0) {
      return 'No relevant videos found for your query.';
    }

    let formatted = `Found ${results.length} relevant video(s):\n\n`;
    
    results.forEach((result, index) => {
      const startTime = this.formatTime(result.startTime);
      const endTime = this.formatTime(result.endTime);
      const confidence = Math.round(result.confidence * 100);
      
      formatted += `${index + 1}. **${result.title}**\n`;
      formatted += `   - Time: ${startTime} - ${endTime}\n`;
      formatted += `   - Confidence: ${confidence}%\n`;
      formatted += `   - Content: ${result.snippet}\n\n`;
    });

    return formatted;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export default new VideoSearchService();
