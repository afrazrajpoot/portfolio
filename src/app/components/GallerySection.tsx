import { useRef, useMemo, useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GallerySection({ items }) {
  const galleryRef = useRef(null);
  const headerRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  console.log(items, "items reel");
  // Improved random column distribution with more variety
  const columnItems = useMemo(() => {
    if (!items || !items.length)
      return { leftCol: [], middleCol: [], rightCol: [] };

    // Shuffle items for random distribution
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    const columns = [[], [], []];
    shuffledItems.forEach((item, index) => {
      columns[index % 3].push(item);
    });

    return {
      leftCol: columns[0],
      middleCol: columns[1],
      rightCol: columns[2],
    };
  }, [items]);

  // GSAP Animations
  useEffect(() => {
    if (!galleryRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        });
      }

      // Gallery items staggered animation
      const galleryItems = galleryRef.current.querySelectorAll(".gallery-item");

      galleryItems.forEach((item, index) => {
        gsap.from(item, {
          opacity: 0,
          y: 100,
          scale: 0.8,
          rotation: -5,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
          },
          delay: (index % 3) * 0.1, // Stagger based on column
        });

        // Hover animations
        item.addEventListener("mouseenter", () => {
          gsap.to(item, {
            scale: 1.05,
            y: -10,
            duration: 0.4,
            ease: "power2.out",
          });

          const playButton = item.querySelector(".play-button");
          if (playButton) {
            gsap.to(playButton, {
              scale: 1.2,
              duration: 0.3,
              ease: "back.out(1.7)",
            });
          }

          const img = item.querySelector("img");
          if (img) {
            gsap.to(img, {
              scale: 1.1,
              duration: 0.6,
              ease: "power2.out",
            });
          }
        });

        item.addEventListener("mouseleave", () => {
          gsap.to(item, {
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          });

          const playButton = item.querySelector(".play-button");
          if (playButton) {
            gsap.to(playButton, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }

          const img = item.querySelector("img");
          if (img) {
            gsap.to(img, {
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
            });
          }
        });
      });
    }, galleryRef);

    return () => ctx.revert();
  }, [items]);

  // Modal animation
  useEffect(() => {
    if (isModalOpen) {
      gsap.from(".modal-content", {
        opacity: 0,
        scale: 0.9,
        y: 50,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }, [isModalOpen]);

  const handleVideoPlay = (item) => {
    setSelectedVideo(item);
    setIsModalOpen(true);
    setVideoError(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    setVideoError(false);
  };

  return (
    <>
      <section ref={galleryRef} className="py-20 px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          <div ref={headerRef} className="text-center mb-16 gallery-header">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Video Portfolio
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Explore my creative work across {items?.length || 0}+ projects
              with stunning visual storytelling
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              columnItems.leftCol,
              columnItems.middleCol,
              columnItems.rightCol,
            ].map((column, colIndex) => (
              <div key={colIndex} className="space-y-8 lg:space-y-10">
                {column.map((item, itemIndex) => (
                  <DynamicGalleryItem
                    key={item?.id || `${colIndex}-${itemIndex}`}
                    item={item}
                    index={colIndex * 10 + itemIndex}
                    onPlayClick={handleVideoPlay}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="text-center mt-16 text-gray-400 text-lg">
            Displaying {items?.length || 0} curated projects
          </div>
        </div>
      </section>

      {/* YouTube Video Modal - Increased Size */}
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full bg-transparent border-none p-0 overflow-hidden">
          <div className="relative modal-content w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={handleClose}
              className="absolute top-6 right-6 z-50 bg-black/80 text-white hover:bg-black border border-white/20 backdrop-blur-sm rounded-full w-12 h-12"
              size="sm"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Video Container - Full Size */}
            <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 w-full h-full max-w-[90vw] max-h-[80vh]">
              <div className="w-full h-full">
                {videoError ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <p className="text-lg mb-2">Unable to load video</p>
                      <p className="text-sm text-gray-400">
                        Please check the video URL
                      </p>
                      <Button
                        variant="default"
                        onClick={() => setVideoError(false)}
                        className="mt-4"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : selectedVideo ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideo.videoUrl)}
                    title={selectedVideo.title || "Video"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                    onError={() => setVideoError(true)}
                  />
                ) : null}
              </div>
            </div>

            {/* Video Info - Positioned below video */}
            {selectedVideo && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
                <h3 className="text-xl font-bold mb-2">
                  {selectedVideo.title || "Untitled Video"}
                </h3>
                <p className="text-gray-300">
                  {selectedVideo.description || ""}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Improved YouTube URL handling
function getYouTubeVideoId(url) {
  if (!url) return "";

  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /youtube\.com\/embed\/([^"&?\/\s]{11})/,
    /youtube\.com\/watch\?v=([^"&?\/\\s]{11})/,
    /youtu\.be\/([^"&?\/\s]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  return "";
}

// Create proper YouTube embed URL
function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return "";
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
}

// Helper function for type colors
function getTypeColorClass(itemType) {
  const colors = {
    film: "bg-purple-500",
    music: "bg-pink-500",
    commercial: "bg-blue-500",
    documentary: "bg-green-500",
    fashion: "bg-red-500",
    sports: "bg-orange-500",
    food: "bg-amber-500",
    architecture: "bg-cyan-500",
    review: "bg-indigo-500",
    fitness: "bg-lime-500",
    educational: "bg-teal-500",
    event: "bg-violet-500",
  };
  return colors[itemType] || "bg-purple-500";
}

// Gallery Item Component with Random Layout
function DynamicGalleryItem({ item, index, onPlayClick }) {
  // Safe data access with fallbacks
  const safeItem = item || {};
  const title = safeItem.title || "Untitled Project";
  const category = safeItem.category || safeItem.type || "General";
  const duration = safeItem.duration || "0:00";
  const thumbnail =
    safeItem.image || safeItem.thumbnail || "/placeholder-image.jpg";
  const videoUrl = safeItem.videoUrl || safeItem.reelUrl || "";
  const description = safeItem.description || "";
  const tags = safeItem.tags || [];

  // More varied aspect ratios for random grid
  const aspectRatios = [
    { type: "vertical", class: "aspect-[3/4]" },
    { type: "square", class: "aspect-square" },
    { type: "horizontal", class: "aspect-video" },
    { type: "tall", class: "aspect-[2/3]" },
    { type: "wide", class: "aspect-[4/3]" },
    { type: "portrait", class: "aspect-[4/5]" },
    { type: "landscape", class: "aspect-[16/9]" },
    { type: "square", class: "aspect-square" },
    { type: "vertical", class: "aspect-[3/4]" },
    { type: "horizontal", class: "aspect-video" },
  ];

  // Random selection for more dynamic layout
  const currentAspect =
    aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

  const getTypeColor = (itemType) => {
    const colors = {
      film: "from-purple-500/90 to-purple-600/90",
      music: "from-pink-500/90 to-pink-600/90",
      commercial: "from-blue-500/90 to-blue-600/90",
      documentary: "from-green-500/90 to-green-600/90",
      fashion: "from-red-500/90 to-red-600/90",
      sports: "from-orange-500/90 to-orange-600/90",
      food: "from-amber-500/90 to-amber-600/90",
      architecture: "from-cyan-500/90 to-cyan-600/90",
      review: "from-indigo-500/90 to-indigo-600/90",
      fitness: "from-lime-500/90 to-lime-600/90",
      educational: "from-teal-500/90 to-teal-600/90",
      event: "from-violet-500/90 to-violet-600/90",
      entertainment: "from-purple-500/90 to-purple-600/90",
      general: "from-gray-500/90 to-gray-600/90",
    };
    return (
      colors[itemType?.toLowerCase()] || "from-purple-500/90 to-purple-600/90"
    );
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoUrl) {
      onPlayClick({
        ...safeItem,
        videoUrl: videoUrl,
        title: title,
        description: description,
      });
    }
  };

  return (
    <div
      className="gallery-item group relative cursor-pointer overflow-hidden rounded-3xl shadow-2xl transition-shadow duration-300"
      onClick={handlePlayClick}
    >
      <div
        className={`w-full ${currentAspect.class} relative overflow-hidden bg-gray-800`}
      >
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-600"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = "/placeholder-image.jpg";
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={handlePlayClick}
            className="play-button w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
            variant="ghost"
            size="lg"
            aria-label={`Play ${title}`}
          >
            <Play className="w-6 h-6 lg:w-8 lg:h-8 text-white ml-1" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Badge
            variant="secondary"
            className={`mb-3 text-xs font-semibold bg-gradient-to-r ${getTypeColor(
              category
            )} text-white backdrop-blur-sm border border-white/20`}
          >
            {(category || "GENERAL").toUpperCase()}
          </Badge>
          <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-gray-300 text-sm font-medium">
            {duration} • {safeItem.views || "0"} views
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
