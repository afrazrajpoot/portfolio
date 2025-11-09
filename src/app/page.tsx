"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import BioSection from "./components/BioSection";
import VideoSlider from "./components/VideoSlider";
import GallerySection from "./components/GallerySection";
import ContactSection from "./components/Contact";
import { ScrollArea } from "@/components/ui/scroll-area";
import { videoService } from "./services/dbServices";
import { reelService } from "./services/reelServices";
import { galleryItems } from "./components/staticData";
import type { GalleryItemType } from "./components/GallerySection"; // Adjust path if needed to import the type

export default function VideoEditorPortfolio() {
  const [videos, setVideos] = useState([]);
  const [reels, setReels] = useState<GalleryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const featuredVideosRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const scrollToSection = useCallback((section: string) => {
    let targetRef: React.RefObject<HTMLDivElement> | null = null;
    switch (section) {
      case "features":
      case "videos":
        targetRef = featuredVideosRef;
        break;
      case "reels":
        targetRef = galleryRef;
        break;
      default:
        return;
    }
    const target = targetRef?.current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch videos
      const videoResponse = await videoService.getVideos();
      const transformedVideos = videoResponse.documents.map((doc) => ({
        id: doc.$id,
        videoUrl: doc.videoUrl,
        thumbnail: convertToViewUrl(doc.thumbnailUrl),
        title: doc.videoTitle || "Untitled Video",
        duration: formatDuration(doc.durationInSeconds),
        tags: doc.tags || [],
        description: doc.description || "",
        isFeatured: doc.isFeatured,
        publishedDate: doc.publishedDate,
      }));
      setVideos(transformedVideos);

      // Fetch initial published reels for gallery - paginated
      try {
        const params = { limit: LIMIT, offset: 0 };
        const reelResponse = await reelService.getPublishedReels(params);
        const transformedReels = reelResponse.documents.map((doc) => ({
          $id: doc.$id,
          id: doc.$id,
          reelTitle: doc.reelTitle || "Untitled Reel",
          title: doc.reelTitle || "Untitled Reel",
          image: convertToViewUrl(doc.thumbnailUrl),
          thumbnailUrl: convertToViewUrl(doc.thumbnailUrl),
          durationInSeconds: doc.durationInSeconds,
          duration: formatDuration(doc.durationInSeconds),
          tags: doc.tags || [],
          description: doc.description || "",
          category: doc.category || "entertainment",
          type: doc.category || "entertainment",
          publishedDate: doc.publishedDate,
          videoUrl: doc.reelUrl,
          reelUrl: doc.reelUrl,
          views: doc.views || 0,
          likes: doc.likes || 0,
        }));
        setReels(transformedReels);
        setOffset(LIMIT);
        setHasMore(reelResponse.documents.length === LIMIT);
      } catch (reelError) {
        console.error("Error fetching reels:", reelError);
        // Fallback: load all reels (non-paginated for simplicity)
        try {
          const allReelsResponse = await reelService.getAllReels();
          const publishedReels = allReelsResponse.documents.filter(
            (doc) => doc.isPublished === true
          );
          const transformedReels = publishedReels.map((doc) => ({
            $id: doc.$id,
            id: doc.$id,
            reelTitle: doc.reelTitle || "Untitled Reel",
            title: doc.reelTitle || "Untitled Reel",
            image: convertToViewUrl(doc.thumbnailUrl),
            thumbnailUrl: convertToViewUrl(doc.thumbnailUrl),
            durationInSeconds: doc.durationInSeconds,
            duration: formatDuration(doc.durationInSeconds),
            tags: doc.tags || [],
            description: doc.description || "",
            category: doc.category || "entertainment",
            type: doc.category || "entertainment",
            publishedDate: doc.publishedDate,
            videoUrl: doc.reelUrl,
            reelUrl: doc.reelUrl,
            views: doc.views || 0,
            likes: doc.likes || 0,
          }));
          setReels(transformedReels);
          setHasMore(false); // All loaded in fallback
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          setReels([]);
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReels = useCallback(async () => {
    if (!hasMore || offset === 0) return;

    try {
      const params = { limit: LIMIT, offset };
      const response = await reelService.getPublishedReels(params);
      if (response.documents.length === 0) {
        setHasMore(false);
        return;
      }

      const newReels = response.documents.map((doc) => ({
        $id: doc.$id,
        id: doc.$id,
        reelTitle: doc.reelTitle || "Untitled Reel",
        title: doc.reelTitle || "Untitled Reel",
        image: convertToViewUrl(doc.thumbnailUrl),
        thumbnailUrl: convertToViewUrl(doc.thumbnailUrl),
        durationInSeconds: doc.durationInSeconds,
        duration: formatDuration(doc.durationInSeconds),
        tags: doc.tags || [],
        description: doc.description || "",
        category: doc.category || "entertainment",
        type: doc.category || "entertainment",
        publishedDate: doc.publishedDate,
        videoUrl: doc.reelUrl,
        reelUrl: doc.reelUrl,
        views: doc.views || 0,
        likes: doc.likes || 0,
      }));

      setReels((prev) => [...prev, ...newReels]);
      setOffset((prev) => prev + LIMIT);
      setHasMore(response.documents.length === LIMIT);
    } catch (error) {
      console.error("Error loading more reels:", error);
    }
  }, [offset, hasMore]);

  // Helper function to convert preview URLs to view URLs
  const convertToViewUrl = (url) => {
    if (!url) return "/placeholder-image.jpg";
    if (url.includes("/preview")) {
      return url.replace("/preview", "/view");
    }
    return url;
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Content</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <ScrollArea className="h-full w-full">
        <BioSection scrollToSection={scrollToSection} />
        <div ref={featuredVideosRef}>
          <VideoSlider videos={videos} />
        </div>
        <div ref={galleryRef}>
          <GallerySection
            items={reels}
            loadMore={loadMoreReels}
            hasMore={hasMore}
          />
        </div>
        <ContactSection />
      </ScrollArea>
    </div>
  );
}
