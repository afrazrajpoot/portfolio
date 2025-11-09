import { useRef, useMemo, useState, useEffect, memo } from "react";
import { Play, X, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { account } from "@/lib/appwrite";
import { reelService } from "../services/reelServices";
import type { MouseEvent } from "react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GalleryItemType {
  $id?: string;
  id?: string;
  reelTitle?: string;
  title?: string;
  reelUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  image?: string;
  thumbnail?: string;
  durationInSeconds?: number;
  duration?: string;
  description?: string;
  tags?: string[];
  views?: number;
  likes?: number;
  category?: string;
  type?: string;
  _aspect?: string; // Stable aspect ratio for optimization
}

interface GallerySectionProps {
  items?: GalleryItemType[];
  loadMore?: () => void;
  hasMore?: boolean;
}

export default function GallerySection({
  items = [],
  loadMore,
  hasMore = false,
}: GallerySectionProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [localItems, setLocalItems] = useState<GalleryItemType[]>(items);
  const [selectedVideo, setSelectedVideo] = useState<GalleryItemType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<GalleryItemType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Define aspect ratios early for use in useMemo
  const aspectRatios = [
    "aspect-[3/4]",
    "aspect-square",
    "aspect-video",
    "aspect-[2/3]",
    "aspect-[4/3]",
  ];

  // Sync localItems with props and normalize data
  useEffect(() => {
    const normalizedItems = items.map((item) => ({
      ...item,
      // Normalize title fields - use reelTitle as primary, fallback to title
      reelTitle: item.reelTitle || item.title || "",
      title: item.reelTitle || item.title || "",
      // Normalize ID field
      $id: item.$id || item.id,
    }));
    setLocalItems(normalizedItems);
  }, [items]);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Clear editItem when modal closes
  useEffect(() => {
    if (!isEditOpen) {
      setEditItem(null);
    }
  }, [isEditOpen]);

  // Optimized column distribution with ID validation and stable aspect ratios
  const columnItems = useMemo(() => {
    if (!localItems || !localItems.length)
      return { leftCol: [], middleCol: [], rightCol: [] } as {
        leftCol: GalleryItemType[];
        middleCol: GalleryItemType[];
        rightCol: GalleryItemType[];
      };

    // Filter valid items only (those with an ID, either $id or id)
    const validItems = localItems.filter((item) => item?.$id || item?.id);

    // Assign stable aspect ratios based on global index to prevent layout shift on re-renders
    const validItemsWithAspect = validItems.map((item, index) => ({
      ...item,
      _aspect: aspectRatios[index % aspectRatios.length],
    }));

    const columns: GalleryItemType[][] = [[], [], []];
    validItemsWithAspect.forEach((item, index) => {
      columns[index % 3].push(item);
    });

    return {
      leftCol: columns[0],
      middleCol: columns[1],
      rightCol: columns[2],
    };
  }, [localItems, aspectRatios]);

  // Smooth scroll animations only
  useEffect(() => {
    if (!galleryRef.current) return;

    const ctx = gsap.context(() => {
      // Header smooth fade in
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            once: true,
          },
        });
      }

      // Gallery items smooth stagger
      const galleryItems =
        galleryRef?.current?.querySelectorAll(".gallery-item");

      galleryItems?.forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          y: 40,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            once: true,
          },
        });
      });
    }, galleryRef);

    return () => ctx.revert();
  }, [localItems]);

  const handleVideoPlay = (item: GalleryItemType) => {
    setSelectedVideo(item);
    setIsModalOpen(true);
    setVideoError(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    setVideoError(false);
  };

  const handleEdit = (itemId: string) => {
    // Always fetch fresh item from localItems to ensure latest data
    const foundItem = localItems.find(
      (i) => i.$id === itemId || i.id === itemId
    );
    if (!foundItem) {
      console.warn("Item not found for edit");
      return;
    }
    // Use consistent field - reelTitle as the primary title field
    const normalizedItem: GalleryItemType = {
      ...foundItem,
      $id: itemId,
      reelTitle: foundItem.reelTitle || foundItem.title || "",
    };
    setEditItem(normalizedItem);
    setIsEditOpen(true);
  };

  const handleDelete = async (reelId: string) => {
    // Validate reelId (handles both $id and id from parent)
    if (!reelId) {
      console.warn("Cannot delete: Missing reel ID");
      return; // Silent skip; no alert for invalid items
    }
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      setIsLoading(true);
      await reelService.deleteReel(reelId);
      // Filter using either $id or id
      setLocalItems((prev) =>
        prev.filter((i) => i.$id !== reelId && i.id !== reelId)
      );
    } catch (error) {
      console.error("Error deleting reel:", error);
      alert("Failed to delete video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    // Get normalized ID
    const reelId = editItem.$id;
    if (!reelId) {
      alert("Cannot update: Missing reel ID");
      return;
    }
    try {
      setIsLoading(true);
      const updated = await reelService.updateReel(reelId, {
        reelTitle: editItem.reelTitle,
        description: editItem.description,
        likes: editItem.likes,
        views: editItem.views,
      });
      // Normalize updated item with consistent field mapping
      const normalizedUpdated: GalleryItemType = {
        ...updated,
        $id: updated.$id || updated.id || reelId,
        // Ensure both title fields are synchronized
        reelTitle: updated.reelTitle,
        title: updated.reelTitle || updated.title,
      };
      // Update local items with normalized data
      setLocalItems((prev) =>
        prev.map((i) => {
          const itemId = i.$id || i.id;
          if (itemId === reelId) {
            return {
              ...i,
              ...normalizedUpdated,
              // Maintain aspect ratio and other UI-specific properties
              _aspect: i._aspect,
            };
          }
          return i;
        })
      );
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating reel:", error);
      alert("Failed to update video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (
    field: keyof GalleryItemType,
    value: string | number
  ) => {
    setEditItem((prev) => ({ ...prev, [field]: value } as GalleryItemType));
  };

  return (
    <>
      <section ref={galleryRef} className="py-20 px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          <div ref={headerRef} className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Video Portfolio
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Explore my creative work across {localItems?.length || 0}+
              projects with stunning visual storytelling
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                {[
                  columnItems.leftCol,
                  columnItems.middleCol,
                  columnItems.rightCol,
                ].map((column, colIndex) => (
                  <div key={colIndex} className="space-y-8 lg:space-y-10">
                    {column.map((item, itemIndex) => (
                      <GalleryItem
                        key={
                          item?.$id || item?.id || `${colIndex}-${itemIndex}`
                        }
                        item={item}
                        onPlayClick={handleVideoPlay}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoggedIn={isLoggedIn}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {hasMore && loadMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMore}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Load More Projects
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="text-center mt-16 text-gray-400 text-lg">
            Displaying {localItems?.length || 0} curated projects
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full bg-transparent border-none p-0 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="absolute top-6 right-6 z-50 bg-black/80 text-white hover:bg-black border border-white/20 backdrop-blur-sm rounded-full w-12 h-12"
              size="sm"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </Button>

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
                    src={getYouTubeEmbedUrl(
                      selectedVideo.reelUrl || selectedVideo.videoUrl
                    )}
                    title={
                      selectedVideo.reelTitle || selectedVideo.title || "Video"
                    }
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                    onError={() => setVideoError(true)}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={isEditOpen}
        onOpenChange={() => {
          setIsEditOpen(false);
        }}
      >
        <DialogContent className="max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Edit Video</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editItem?.reelTitle || ""}
                  onChange={(e) =>
                    handleEditChange("reelTitle", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editItem?.description || ""}
                  onChange={(e) =>
                    handleEditChange("description", e.target.value)
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  value={editItem?.likes || 0}
                  onChange={(e) =>
                    handleEditChange("likes", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <Label htmlFor="views">Views</Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  value={editItem?.views || 0}
                  onChange={(e) =>
                    handleEditChange("views", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getYouTubeVideoId(url: string | undefined): string {
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

function getYouTubeEmbedUrl(url: string | undefined): string {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return "";
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
}

function getTypeColor(itemType: string | undefined): string {
  const colors: Record<string, string> = {
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
    colors[itemType?.toLowerCase() as keyof typeof colors] ||
    "from-purple-500/90 to-purple-600/90"
  );
}

interface GalleryItemProps {
  item: GalleryItemType;
  onPlayClick: (item: GalleryItemType) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoggedIn: boolean;
}

// Memoized GalleryItem to prevent unnecessary re-renders
const GalleryItem = memo(
  ({ item, onPlayClick, onEdit, onDelete, isLoggedIn }: GalleryItemProps) => {
    const safeItem = item || {};
    // Normalize ID for key and actions
    const itemId = safeItem.$id || safeItem.id;
    const title = safeItem.reelTitle || safeItem.title || "Untitled Project";
    const category = safeItem.category || safeItem.type || "General";
    const duration = safeItem.durationInSeconds
      ? `${Math.floor(safeItem.durationInSeconds / 60)}:${(
          safeItem.durationInSeconds % 60
        )
          .toString()
          .padStart(2, "0")}`
      : safeItem.duration || "0:00";
    const thumbnail =
      safeItem.thumbnailUrl ||
      safeItem.image ||
      safeItem.thumbnail ||
      "/placeholder-image.jpg";
    const videoUrl = safeItem.reelUrl || safeItem.videoUrl || "";
    const description = safeItem.description || "";
    const tags = safeItem.tags || [];
    const views = safeItem.views || 0;
    const likes = safeItem.likes || 0;

    // Use stable aspect from item
    const currentAspect = safeItem._aspect || "aspect-video";

    const handlePlayClick = (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (videoUrl) {
        onPlayClick({
          ...safeItem,
          videoUrl: videoUrl,
          title: title,
          description: description,
        } as GalleryItemType);
      }
    };

    const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!itemId) {
        console.warn("Cannot edit: Missing item ID");
        return;
      }
      onEdit(itemId);
    };

    const handleDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!itemId) {
        console.warn("Cannot delete: Missing item ID");
        return; // Prevent call with undefined
      }
      onDelete(itemId);
    };

    return (
      <div
        className="gallery-item group relative cursor-pointer overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
        onClick={handlePlayClick}
      >
        <div
          className={`w-full ${currentAspect} relative overflow-hidden bg-gray-800`}
        >
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = "/placeholder-image.jpg";
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={handlePlayClick}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110"
              variant="ghost"
              size="lg"
              aria-label={`Play ${title}`}
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge
              variant="secondary"
              className={`mb-3 text-xs font-bold bg-gradient-to-r ${getTypeColor(
                category
              )} text-white border-none px-3 py-1`}
            >
              {(category || "GENERAL").toUpperCase()}
            </Badge>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-gray-300 text-sm font-medium mb-2">
              {duration} • {views} views • {likes} likes
            </p>

            {description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-2 line-clamp-2">
                {description}
              </p>
            )}

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

            {isLoggedIn && (
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-white/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="text-white hover:bg-white/10 h-8 w-8 p-0"
                  aria-label="Edit video"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300 h-8 w-8 p-0"
                  aria-label="Delete video"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

GalleryItem.displayName = "GalleryItem";
