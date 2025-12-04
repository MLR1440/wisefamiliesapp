import { Play } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  videoType: string;
  title: string;
}

const VideoPlayer = ({ videoUrl, videoType, title }: VideoPlayerProps) => {
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

    if (videoType === 'youtube') {
      const embedUrl = getYouTubeEmbedUrl(videoUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    if (videoType === 'vimeo') {
      const embedUrl = getVimeoEmbedUrl(videoUrl);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    if (videoType === 'direct') {
      return (
        <video controls className="h-full w-full">
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
            title={title}
            className="h-full w-full"
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
            title={title}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    // Default to video element for direct URLs
    return (
      <video controls className="h-full w-full">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="aspect-video">{renderPlayer()}</div>
    </div>
  );
};

export default VideoPlayer;
