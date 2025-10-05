import React from 'react';
import { VideoCameraIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import VideoSearchService from '../service/VideoSearchService';

interface VideoSearchStatusProps {
  className?: string;
}

const VideoSearchStatus: React.FC<VideoSearchStatusProps> = ({ className = '' }) => {
  const isVideoSearchAvailable = VideoSearchService.isVideoSearchAvailable();

  if (isVideoSearchAvailable) {
    return (
      <div className={`flex items-center gap-2 text-green-600 dark:text-green-400 ${className}`}>
        <VideoCameraIcon className="h-4 w-4" />
        <span className="text-sm">Video search available</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 ${className}`}>
      <ExclamationTriangleIcon className="h-4 w-4" />
      <span className="text-sm">Upload videos to enable video search</span>
    </div>
  );
};

export default VideoSearchStatus;
