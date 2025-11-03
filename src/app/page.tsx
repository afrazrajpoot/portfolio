"use client";
import BioSection from "./components/BioSection";
import VideoSlider from "./components/VideoSlider";
import GallerySection from "./components/GallerySection";
// import ContactSection from "./components/ContactSection"; // New import
import { galleryItems, sliderVideos } from "./components/staticData";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContactSection from "./components/Contact";

export default function VideoEditorPortfolio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <ScrollArea className="h-full w-full">
        <BioSection />
        <VideoSlider videos={sliderVideos} />
        <GallerySection items={galleryItems} />
        <ContactSection /> {/* New section added */}
      </ScrollArea>
    </div>
  );
}
