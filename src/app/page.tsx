"use client";
import { useState, useEffect } from "react";
import BioSection from "./components/BioSection";
import VideoSlider from "./components/VideoSlider";
import GallerySection from "./components/GallerySection";
import ContactSection from "./components/Contact";
import { ScrollArea } from "@/components/ui/scroll-area";
import { videoService } from "./services/dbServices";
import { reelService } from "./services/reelServices";
// import { reelService } from "./services/dbServices"; // Assuming reelService is exported from the same file or adjust path as needed

export default function VideoEditorPortfolio() {
  const [videos, setVideos] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // In your page.tsx
  // In your page.tsx
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

      // Fetch published reels for gallery - with better error handling
      try {
        const reelResponse = await reelService.getPublishedReels();
        const transformedReels = reelResponse.documents.map((doc) => ({
          id: doc.$id,
          image: convertToViewUrl(doc.thumbnailUrl),
          title: doc.reelTitle || "Untitled Reel",
          duration: formatDuration(doc.durationInSeconds),
          tags: doc.tags || [],
          description: doc.description || "",
          category: doc.category || "entertainment",
          publishedDate: doc.publishedDate,
          videoUrl: doc.reelUrl,
        }));
        setReels(transformedReels);
      } catch (reelError) {
        console.error("Error fetching reels:", reelError);
        // If published reels fail, try getting all reels
        try {
          const allReelsResponse = await reelService.getAllReels();
          const publishedReels = allReelsResponse.documents.filter(
            (doc) => doc.isPublished === true
          );
          const transformedReels = publishedReels.map((doc) => ({
            id: doc.$id,
            image: convertToViewUrl(doc.thumbnailUrl),
            title: doc.reelTitle || "Untitled Reel",
            duration: formatDuration(doc.durationInSeconds),
            tags: doc.tags || [],
            description: doc.description || "",
            category: doc.category || "entertainment",
            publishedDate: doc.publishedDate,
            videoUrl: doc.reelUrl,
          }));
          setReels(transformedReels);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          setReels([]); // Set empty array if both methods fail
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
        <BioSection />
        <VideoSlider videos={videos} />
        <GallerySection items={reels} />
        <ContactSection />
      </ScrollArea>
    </div>
  );
}
