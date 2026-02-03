import { useState, useRef, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Play, X, Loader2 } from 'lucide-react';

export default function MotivationalVideo() {
  const { identity } = useInternetIdentity();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset loading state when dialog opens
  useEffect(() => {
    if (isOpen && videoRef.current) {
      setIsLoading(true);
      setCanPlay(false);
      videoRef.current.load();
    }
  }, [isOpen]);

  // Only show for authenticated users
  if (!identity) {
    return null;
  }

  const handleOpenVideo = () => {
    setIsOpen(true);
    setIsLoading(true);
    setIsPlaying(false);
    setCanPlay(false);
  };

  const handleCloseVideo = () => {
    setIsOpen(false);
    setIsPlaying(false);
    setCanPlay(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setCanPlay(true);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setCanPlay(true);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleManualPlay = () => {
    if (videoRef.current && canPlay) {
      videoRef.current.play().catch((error) => {
        console.error('Error playing video:', error);
      });
    }
  };

  return (
    <>
      {/* Gold accent button for motivational video */}
      <div className="mb-6 sm:mb-8">
        <Button
          onClick={handleOpenVideo}
          className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-600 hover:via-yellow-700 hover:to-amber-700 text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base py-5 sm:py-6 px-6 sm:px-8"
        >
          <Play className="mr-2 h-5 w-5" />
          Zero Tolerance – A Reminder of Strength and Justice
        </Button>
      </div>

      {/* Video Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black border-2 border-primary">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={handleCloseVideo}
              className="absolute top-4 right-4 z-50 bg-black/80 hover:bg-black text-white rounded-full p-2 transition-colors"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video container */}
            <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-white text-lg font-semibold">Loading video...</p>
                  <p className="text-white/70 text-sm mt-2">Please wait while the video buffers</p>
                </div>
              )}

              {/* Manual play button overlay - shown when video is ready but not playing */}
              {!isLoading && canPlay && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <button
                    onClick={handleManualPlay}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-6 transition-all duration-300 shadow-2xl hover:scale-110"
                    aria-label="Play video"
                  >
                    <Play className="h-12 w-12" />
                  </button>
                </div>
              )}

              {/* Video element with full preloading - using optimized 720p version */}
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full"
                controls
                preload="auto"
                playsInline
                onCanPlay={handleCanPlay}
                onLoadedData={handleLoadedData}
                onPlay={handlePlay}
                onPause={handlePause}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
              >
                <source src="/assets/generated/police-arrest-scene-optimized.dim_720x480.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Caption */}
            <div className="bg-gradient-to-r from-primary/90 to-destructive/90 p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-white text-lg sm:text-xl font-bold">
                  Zero Tolerance – A Reminder of Strength and Justice
                </DialogTitle>
                <DialogDescription className="text-white/90 text-sm sm:text-base mt-2">
                  This video serves as a powerful reminder that accountability is real, justice is possible, 
                  and your safety matters. Every report you file, every piece of evidence you document, 
                  brings you one step closer to protection and peace.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
