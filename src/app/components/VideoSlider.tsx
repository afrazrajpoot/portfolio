"use client";

import { useState, useRef, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, X, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Video {
  id: string;
  videoUrl: string;
  thumbnail: string;
  title: string;
  duration: string;
  tags?: string[];
}

interface VideoSliderProps {
  videos: Video[];
}

const VideoSlider: React.FC<VideoSliderProps> = ({ videos }) => {
  const sliderRef = useRef<HTMLElement>(null);
  const slidesWrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const youtubePlayersRef = useRef<(YT.Player | null)[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [playersReady, setPlayersReady] = useState<boolean[]>([]);

  // Initialize slide refs
  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, videos.length);
    youtubePlayersRef.current = youtubePlayersRef.current.slice(
      0,
      videos.length
    );
    setPlayersReady(new Array(videos.length).fill(false));
  }, [videos]);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayers();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onload = () => {
      console.log("YouTube API loaded");
    };
    tag.onerror = () => {
      console.error("Failed to load YouTube API");
    };
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initializePlayers;

    return () => {
      // Clean up YouTube players
      youtubePlayersRef.current.forEach((player, index) => {
        if (player && typeof player.destroy === "function") {
          try {
            player.destroy();
          } catch (error) {
            console.error(`Error destroying player ${index}:`, error);
          }
        }
      });
    };
  }, [videos]);

  const initializePlayers = () => {
    console.log("Initializing YouTube players...");
    videos.forEach((video, index) => {
      createYouTubePlayer(video, index);
    });
  };

  // Create YouTube player for each video
  const createYouTubePlayer = (video: Video, index: number) => {
    const youtubeId = getYouTubeId(video.videoUrl);
    if (!youtubeId) {
      console.error(`Invalid YouTube URL for video ${index}:`, video.videoUrl);
      return;
    }

    try {
      const player = new window.YT.Player(`youtube-player-${index}`, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          mute: 1,
          playlist: youtubeId,
        },
        events: {
          onReady: (event) => onPlayerReady(event, index),
          onStateChange: (event) => onPlayerStateChange(event, index),
          onError: (event) => onPlayerError(event, index),
        },
      });

      youtubePlayersRef.current[index] = player;
    } catch (error) {
      console.error(`Error creating YouTube player ${index}:`, error);
    }
  };

  const onPlayerReady = (event: any, index: number) => {
    console.log(`YouTube player ${index} ready`);
    // Mark player as ready
    setPlayersReady((prev) => {
      const newReady = [...prev];
      newReady[index] = true;
      return newReady;
    });

    // If this is the current slide, play the video
    if (index === currentSlide) {
      setTimeout(() => {
        safePlayVideo(index);
      }, 1000);
    }
  };

  const onPlayerError = (event: any, index: number) => {
    console.error(`YouTube player ${index} error:`, event.data);
    // Mark player as not ready on error
    setPlayersReady((prev) => {
      const newReady = [...prev];
      newReady[index] = false;
      return newReady;
    });
  };

  const onPlayerStateChange = (event: any, index: number) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      if (index === currentSlide) {
        setIsVideoPlaying(true);
      }
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      if (index === currentSlide) {
        setIsVideoPlaying(false);
      }
    } else if (event.data === window.YT.PlayerState.ENDED) {
      // Loop the video
      if (index === currentSlide) {
        setTimeout(() => {
          safePlayVideo(index);
        }, 500);
      }
    }
  };

  // Safe method to play video with error handling
  const safePlayVideo = (index: number) => {
    const player = youtubePlayersRef.current[index];
    if (
      player &&
      playersReady[index] &&
      typeof player.playVideo === "function"
    ) {
      try {
        player.playVideo();
      } catch (error) {
        console.error(`Error playing video ${index}:`, error);
        // Retry after delay
        setTimeout(() => {
          if (player && typeof player.playVideo === "function") {
            try {
              player.playVideo();
            } catch (retryError) {
              console.error(`Retry failed for video ${index}:`, retryError);
            }
          }
        }, 1000);
      }
    }
  };

  // Safe method to pause video with error handling
  const safePauseVideo = (index: number) => {
    const player = youtubePlayersRef.current[index];
    if (
      player &&
      playersReady[index] &&
      typeof player.pauseVideo === "function"
    ) {
      try {
        player.pauseVideo();
      } catch (error) {
        console.error(`Error pausing video ${index}:`, error);
      }
    }
  };

  // Safe method to seek video with error handling
  const safeSeekTo = (index: number, seconds: number) => {
    const player = youtubePlayersRef.current[index];
    if (player && playersReady[index] && typeof player.seekTo === "function") {
      try {
        player.seekTo(seconds, true);
      } catch (error) {
        console.error(`Error seeking video ${index}:`, error);
      }
    }
  };

  // Play YouTube video when slide becomes active
  useEffect(() => {
    // Play current slide video
    if (playersReady[currentSlide]) {
      setTimeout(() => {
        safePlayVideo(currentSlide);
      }, 300);
    }

    // Pause all other YouTube videos
    youtubePlayersRef.current.forEach((player, index) => {
      if (index !== currentSlide && playersReady[index]) {
        safePauseVideo(index);
        safeSeekTo(index, 0);
      }
    });
  }, [currentSlide, playersReady]);

  // Auto-play first video when all players are ready
  useEffect(() => {
    const allReady =
      playersReady.length > 0 && playersReady.every((ready) => ready);
    if (allReady) {
      console.log("All players ready, auto-playing current slide");
      setTimeout(() => {
        safePlayVideo(currentSlide);
      }, 1500);
    }
  }, [playersReady, currentSlide]);

  // Initial page load animations + Scroll-triggered animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: "power3.out",
      });

      // Parallax effect for the slider content
      gsap.to(slidesWrapperRef.current, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: sliderRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Initial slide animation - EXCLUDE main play button from fade animations
      if (slideRefs.current[0]) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sliderRef.current,
            start: "top 80%",
          },
        });

        tl.from(slideRefs.current[0].querySelector(".video-container"), {
          scale: 1.3,
          duration: 1.5,
          ease: "power3.out",
        }).from(
          slideRefs.current[0].querySelector(".slide-content"),
          {
            y: 100,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6"
        );
      }

      // Navigation buttons animation
      gsap.from(".prev-btn, .next-btn", {
        opacity: 0,
        scale: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.1,
        delay: 0.5,
        scrollTrigger: {
          trigger: sliderRef.current,
          start: "top 80%",
        },
      });

      // Dots animation
      gsap.from(".dot-indicator", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.05,
        delay: 0.8,
        scrollTrigger: {
          trigger: sliderRef.current,
          start: "top 80%",
        },
      });

      // Main play button animation - separate and always visible
      gsap.from(".modal-play-btn", {
        scale: 0,
        rotation: 180,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.3,
        scrollTrigger: {
          trigger: sliderRef.current,
          start: "top 80%",
        },
      });

      // Play button hover animations
      const playBtns = sliderRef.current?.querySelectorAll(".modal-play-btn");
      playBtns?.forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          gsap.to(btn, {
            scale: 1.2,
            duration: 0.3,
            ease: "back.out(1.7)",
          });
        });

        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });

      // Navigation button hover effects
      const navBtns = sliderRef.current?.querySelectorAll(
        ".prev-btn, .next-btn"
      );
      navBtns?.forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          gsap.to(btn, {
            scale: 1.1,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            duration: 0.3,
            ease: "power2.out",
          });
        });

        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, {
            scale: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    }, sliderRef);

    return () => ctx.revert();
  }, [videos]);

  // Slide transition animation - Fixed to ensure main play button stays visible
  useEffect(() => {
    if (isAnimating) return;

    const currentSlideEl = slideRefs.current[currentSlide];
    if (!currentSlideEl) return;

    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    // Fade out all other slides
    slideRefs.current.forEach((slide, index) => {
      if (index !== currentSlide && slide) {
        gsap.to(slide, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
        });
      }
    });

    // Animate current slide - EXCLUDE main play button from scale animation
    tl.to(currentSlideEl, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
    })
      .from(
        currentSlideEl.querySelector(".video-container"),
        {
          scale: 1.2,
          duration: 1.2,
          ease: "power3.out",
        },
        0
      )
      .from(
        currentSlideEl.querySelector(".slide-content"),
        {
          y: 50,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        0.4
      );

    // Always ensure main play button is visible with proper animation
    const mainPlayBtn = currentSlideEl.querySelector(".modal-play-btn");
    if (mainPlayBtn) {
      gsap.fromTo(
        mainPlayBtn,
        {
          scale: 0,
          rotation: 90,
        },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          delay: 0.3,
        }
      );
    }
  }, [currentSlide]);

  const nextSlide = () => {
    if (isAnimating) return;
    setCurrentSlide((prev) => (prev + 1) % videos.length);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setCurrentSlide((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToSlide = (index: number) => {
    if (index === currentSlide || isAnimating) return;
    setCurrentSlide(index);
  };

  const openModal = (video: Video) => {
    setCurrentVideo(video);
    setIsModalOpen(true);
    // Pause the current autoplaying YouTube video when modal opens
    safePauseVideo(currentSlide);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
    // Resume autoplay when modal closes
    setTimeout(() => {
      safePlayVideo(currentSlide);
    }, 500);
  };

  // Toggle background YouTube video play/pause
  const toggleBackgroundVideo = () => {
    if (isVideoPlaying) {
      safePauseVideo(currentSlide);
    } else {
      safePlayVideo(currentSlide);
    }
  };

  // Force play current video (fallback function)
  const forcePlayCurrentVideo = () => {
    safePlayVideo(currentSlide);
  };

  // Extract YouTube ID from URL
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  return (
    <>
      <section ref={sliderRef} className="py-20 w-full overflow-hidden">
        <div ref={headerRef} className="w-full mx-auto px-4 mb-12">
          <h2 className="text-4xl font-bold text-center mb-4">Featured Work</h2>
          <p className="text-xl text-gray-400 text-center">
            Scroll smoothly through my featured video projects
          </p>
        </div>

        {/* Container without scaling animation - full size by default */}
        <div className="relative w-full flex justify-center">
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{
              width: "100%",
              transform: "scale(1)",
              borderRadius: "0px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
              <div ref={slidesWrapperRef} className="relative w-full h-full">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    ref={(el) => (slideRefs.current[index] = el)}
                    className={`slider-item absolute top-0 left-0 w-full h-full ${
                      index === currentSlide ? "z-10" : "z-0"
                    }`}
                    style={{
                      opacity: index === currentSlide ? 1 : 0,
                      willChange: "transform, opacity",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div className="relative w-full h-full">
                      {/* YouTube Video Container */}
                      <div className="video-container absolute inset-0 w-full h-full">
                        <div
                          id={`youtube-player-${index}`}
                          className="w-full h-full"
                        />
                        {/* Fallback thumbnail while YouTube loads */}
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            opacity: playersReady[index] ? 0 : 1,
                            transition: "opacity 0.5s ease",
                          }}
                        />

                        {/* Loading indicator */}
                        {!playersReady[index] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="text-white text-center">
                              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-sm">Loading video...</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Main Modal Play Button - Fixed positioning and z-index */}
                      <div className="absolute inset-0 flex items-center justify-center z-30">
                        <Button
                          onClick={() => openModal(video)}
                          variant="ghost"
                          className="modal-play-btn w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 hover:bg-white/30 hover:border-white/60 cursor-pointer transition-all duration-300 shadow-2xl"
                          size="lg"
                        >
                          <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
                        </Button>
                      </div>

                      {/* Background Video Control Button (Small) */}
                      <div className="absolute top-6 left-6 z-30">
                        <Button
                          onClick={toggleBackgroundVideo}
                          variant="ghost"
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-sm flex items-center justify-center border-2 transition-all duration-300 cursor-pointer shadow-lg ${
                            isVideoPlaying && index === currentSlide
                              ? "bg-green-600/80 border-green-400/50 hover:bg-green-700/80"
                              : "bg-yellow-600/80 border-yellow-400/50 hover:bg-yellow-700/80"
                          }`}
                          size="sm"
                        >
                          {isVideoPlaying && index === currentSlide ? (
                            <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          ) : (
                            <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" />
                          )}
                        </Button>
                      </div>

                      {/* Force play button (fallback) - Only show if video should be playing but isn't */}
                      {!isVideoPlaying &&
                        index === currentSlide &&
                        playersReady[index] && (
                          <div className="absolute top-6 right-6 z-30">
                            <Button
                              onClick={forcePlayCurrentVideo}
                              variant="ghost"
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600/80 backdrop-blur-sm flex items-center justify-center border-2 border-red-400/50 hover:bg-red-700/80 transition-all duration-300 cursor-pointer shadow-lg"
                              size="sm"
                            >
                              <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" />
                            </Button>
                          </div>
                        )}

                      <div className="slide-content absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
                        <div className="max-w-7xl mx-auto px-4">
                          <h3 className="text-2xl md:text-4xl font-bold mb-2 text-white">
                            {video.title}
                          </h3>
                          <p className="text-lg md:text-xl text-gray-300 mb-3">
                            {video.duration}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {video.tags?.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-purple-500/80 rounded-full text-sm text-white backdrop-blur-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <Button
              onClick={prevSlide}
              variant="ghost"
              className="prev-btn absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:border-white/40 transition-colors duration-300 z-40 cursor-pointer"
              size="sm"
              disabled={isAnimating}
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </Button>

            <Button
              onClick={nextSlide}
              variant="ghost"
              className="next-btn absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:border-white/40 transition-colors duration-300 z-40 cursor-pointer"
              size="sm"
              disabled={isAnimating}
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </Button>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-40">
              {videos.map((_, index) => (
                <Button
                  key={index}
                  onClick={() => goToSlide(index)}
                  variant="ghost"
                  className={`dot-indicator h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-purple-500 w-8"
                      : "bg-gray-600 w-4 hover:bg-gray-400"
                  } p-0 cursor-pointer`}
                  size="sm"
                  disabled={isAnimating}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-white border border-white/20 z-40">
              {currentSlide + 1} / {videos.length}
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isModalOpen && currentVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-6xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              onClick={closeModal}
              variant="ghost"
              className="absolute -top-12 right-0 md:-right-12 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 cursor-pointer z-10"
              size="sm"
            >
              <X className="w-5 h-5 text-white" />
            </Button>

            {/* YouTube Player in Modal */}
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(
                  currentVideo.videoUrl
                )}?autoplay=1&rel=0&controls=1&showinfo=0`}
                title={currentVideo.title}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Info */}
            <div className="mt-4 text-white">
              <h3 className="text-2xl font-bold mb-2">{currentVideo.title}</h3>
              <p className="text-lg text-gray-300 mb-3">
                {currentVideo.duration}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentVideo.tags?.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-3 py-1 bg-purple-500/80 rounded-full text-sm text-white backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default VideoSlider;
