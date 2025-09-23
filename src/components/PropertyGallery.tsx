import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Maximize2, X, Images, ArrowLeft, Share2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  hasVideo?: boolean;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  images,
  title,
  hasVideo = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerMode, setViewerMode] = useState<'lightbox' | 'grid'>('lightbox');

  // Fallback dummy images to guarantee a rich gallery for demo/testing
  const dummyImages = useMemo(
    () => [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3b2e73?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5f6?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1507090960745-befb773dc0cd?auto=format&fit=crop&w=1600&q=80'
    ],
    []
  );

  // Ensure we always have at least 5 images like Airbnb collage
  const filledImages = useMemo(() => {
    const base = Array.isArray(images) ? images.filter(Boolean) : [];
    const needed = Math.max(5 - base.length, 0);
    return needed > 0 ? [...base, ...dummyImages.slice(0, needed)] : base;
  }, [images, dummyImages]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % filledImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + filledImages.length) % filledImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const openLightbox = (index: number = 0) => {
    setCurrentIndex(index);
    setViewerMode('lightbox');
    setIsFullscreen(true);
  };

  const openGrid = () => {
    setViewerMode('grid');
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  // Shared image error handler to swap broken images to placeholder once
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget as HTMLImageElement;
    if (target && target.src.indexOf('/placeholder.svg') === -1) {
      target.onerror = null; // prevent infinite loop
      target.src = '/placeholder.svg';
    }
  };

  if (!filledImages || filledImages.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto">
            <Maximize2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Airbnb-style Collage */}
      <div className="relative">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden">
          {/* Large left image */}
          <button
            onClick={() => openLightbox(0)}
            className="col-span-2 row-span-2 relative group"
          >
            <img
              src={filledImages[0] || '/placeholder.svg'}
              alt={`${title} - Image 1`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            {hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black/40 text-white">
                  <Play className="h-6 w-6" />
                </span>
              </div>
            )}
          </button>

          {/* Four small images on the right */}
          {filledImages.slice(1, 5).map((img, idx) => (
            <button
              key={idx}
              onClick={() => openLightbox(idx + 1)}
              className="relative group"
            >
              <img src={img || '/placeholder.svg'} alt={`${title} - Image ${idx + 2}`} className="w-full h-full object-cover" onError={handleImageError} />
            </button>
          ))}
        </div>

        {/* Show all photos button */}
        <Button
          onClick={openGrid}
          className="absolute bottom-4 right-4 bg-white text-foreground hover:bg-white/90 shadow-sm rounded-full px-4 py-2 h-auto"
          variant="secondary"
        >
          <div className="flex items-center space-x-2 text-sm">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
              <Images className="h-3.5 w-3.5" />
            </span>
            <span>Show all photos</span>
          </div>
        </Button>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            {viewerMode === 'grid' ? (
              <div className="max-w-7xl mx-auto">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-border">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                    <button onClick={() => setIsFullscreen(false)} className="inline-flex items-center space-x-2 text-sm font-medium">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                        <Share2 className="h-4 w-4 mr-2" /> Share
                      </Button>
                      <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                        <Heart className="h-4 w-4 mr-2" /> Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
                        <X className="h-4 w-4 mr-2" /> Close
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-6">
                  <h2 className="text-2xl font-heading font-bold mb-6">Photo tour</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filledImages.map((img, idx) => (
                      <div key={idx} className="overflow-hidden rounded-xl">
                        <img src={img || '/placeholder.svg'} alt={`${title} - Photo ${idx + 1}`} className="w-full h-full object-cover" onError={handleImageError} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4">
                <div className="relative max-w-7xl max-h-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(false)}
                    className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="relative">
                    <img
                      src={filledImages[currentIndex] || '/placeholder.svg'}
                      alt={`${title} - Fullscreen ${currentIndex + 1}`}
                      className="max-w-full max-h-[80vh] object-contain rounded-lg"
                      onError={handleImageError}
                    />

                    {filledImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => prevImage()}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => nextImage()}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>

                  {filledImages.length > 1 && (
                    <div className="flex justify-center space-x-2 mt-4">
                      {filledImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentIndex
                              ? 'border-white'
                              : 'border-white/50 hover:border-white/80'
                          }`}
                        >
                          <img
                            src={image || '/placeholder.svg'}
                            alt={`${title} - Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};