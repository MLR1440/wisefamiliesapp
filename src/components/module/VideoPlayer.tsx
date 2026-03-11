import { useState, useRef, useEffect } from 'react';
import { Play, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  videoType: string;
  title: string;
  onPlay?: () => void;
}

const VideoPlayer = ({ videoUrl, videoType, title, onPlay }: VideoPlayerProps) => {
  const hasTrackedPlay = useRef(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  // Extract Vimeo video ID
  const getVimeoEmbedUrl = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    // Track play on first load (for iframes, this is the best we can do)
    if (!hasTrackedPlay.current && onPlay) {
      hasTrackedPlay.current = true;
      onPlay();
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Error state
  if (hasError) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="aspect-video flex items-center justify-center bg-muted">
          <div className="text-center px-6 py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">
              Video unavailable
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
              The video couldn't be loaded. You can still use the chat below.
            </p>
            <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine video type and render appropriate player
  const renderPlayer = () => {
    if (!videoUrl || videoType === 'none') {
      return (
        <div className="flex aspect-video items-center justify-center bg-muted">
          <div className="text-center">
            <Play className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No video for this module</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      title,
      className: 'h-full w-full',
      onLoad: handleLoad,
      onError: handleError,
    };

    if (videoType === 'youtube') {
      const embedUrl = getYouTubeEmbedUrl(videoUrl);
      if (embedUrl) {
        return (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <iframe
              src={embedUrl}
              {...commonProps}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </>
        );
      }
    }

    if (videoType === 'vimeo') {
      const embedUrl = getVimeoEmbedUrl(videoUrl);
      if (embedUrl) {
        return (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <iframe
              src={embedUrl}
              {...commonProps}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </>
        );
      }
    }

    if (videoType === 'direct') {
      return (
        <video 
          controls 
          className="h-full w-full" 
          onLoadedData={handleLoad} 
          onError={handleError}
          onPlay={() => {
            if (!hasTrackedPlay.current && onPlay) {
              hasTrackedPlay.current = true;
              onPlay();
            }
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Fallback: try to auto-detect
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const embedUrl = getYouTubeEmbedUrl(videoUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            {...commonProps}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    if (videoUrl.includes('vimeo.com')) {
      const embedUrl = getVimeoEmbedUrl(videoUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            {...commonProps}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    // Default to video element for direct URLs
    return (
      <video 
        controls 
        className="h-full w-full" 
        onLoadedData={handleLoad} 
        onError={handleError}
        onPlay={() => {
          if (!hasTrackedPlay.current && onPlay) {
            hasTrackedPlay.current = true;
            onPlay();
          }
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="aspect-video relative">{renderPlayer()}</div>
    </div>
  );
};

export default VideoPlayer;
