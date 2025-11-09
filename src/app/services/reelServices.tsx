import { databases, storage, ID, Query } from "@/lib/appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REELS_COLLECTION_ID;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export const reelService = {
  // Create a new reel
  async createReel(reelData, thumbnailFile = null) {
    try {
      let thumbnailUrl = reelData.thumbnailUrl;

      // If thumbnail file is provided, upload it
      if (thumbnailFile) {
        console.log("Uploading thumbnail file...");
        const uploadedFile = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          thumbnailFile
        );
        console.log("File uploaded successfully:", uploadedFile.$id);

        // Use getFileView instead of getFilePreview
        thumbnailUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);
        console.log("Thumbnail URL generated:", thumbnailUrl);
      }

      // Prepare data according to your schema
      const finalReelData = {
        reelTitle: reelData.reelTitle?.substring(0, 256) || "",
        reelUrl: reelData.reelUrl?.substring(0, 512) || "",
        thumbnailUrl: thumbnailUrl?.substring(0, 512) || "",
        durationInSeconds: parseInt(reelData.durationInSeconds) || 0,
        description: reelData.description?.substring(0, 1024) || "",
        tags: Array.isArray(reelData.tags) ? reelData.tags.slice(0, 10) : [],
        isPublished: Boolean(reelData.isPublished),
        category: reelData.category?.substring(0, 50) || "entertainment",
        publishedDate: reelData.publishedDate || new Date().toISOString(),
        likes: parseInt(reelData.likes) || 0, // Added for completeness, assuming schema includes it
        views: parseInt(reelData.views) || 0, // Added for completeness, assuming schema includes it
      };

      // Validate required fields
      if (!finalReelData.reelTitle || finalReelData.reelTitle.trim() === "") {
        throw new Error("Reel title is required");
      }

      if (!finalReelData.reelUrl || finalReelData.reelUrl.trim() === "") {
        throw new Error("Reel URL is required");
      }

      if (
        !finalReelData.durationInSeconds ||
        finalReelData.durationInSeconds < 1
      ) {
        throw new Error("Valid duration is required (1-60 seconds)");
      }

      if (finalReelData.durationInSeconds > 60) {
        throw new Error("Reels cannot be longer than 60 seconds");
      }

      console.log("Creating reel with data:", finalReelData);

      const result = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        finalReelData
      );

      console.log("Reel created successfully:", result.$id);
      return result;
    } catch (error) {
      console.error("Error creating reel:", error);

      if (error.code === 401) {
        throw new Error(
          "Authentication failed. Please check Appwrite permissions."
        );
      } else if (error.code === 400) {
        throw new Error(`Invalid data: ${error.message}`);
      } else if (error.code === 404) {
        throw new Error(
          "Database or collection not found. Check your environment variables."
        );
      } else {
        throw new Error(error.message || "Failed to create reel");
      }
    }
  },

  // Get all reels
  async getReels(queries = []) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        queries
      );
      return response;
    } catch (error) {
      console.error("Error fetching reels:", error);
      throw error;
    }
  },

  // Get published reels - FIXED: Try multiple query formats
  async getPublishedReels() {
    try {
      // Try different query formats to find what works
      let result;

      // Method 1: Try with Query class
      try {
        result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.equal("isPublished", true),
        ]);
        return result;
      } catch (queryError) {
        console.log("Query class failed, trying string format...");
      }

      // Method 2: Try with query string (alternative format)
      try {
        result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
          `equal("isPublished", true)`,
        ]);
        return result;
      } catch (stringError) {
        console.log("String format failed, trying without filters...");
      }

      // Method 3: Get all documents and filter client-side as last resort
      const allDocuments = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID
      );
      const filteredDocuments = {
        ...allDocuments,
        documents: allDocuments.documents.filter(
          (doc) => doc.isPublished === true
        ),
      };
      return filteredDocuments;
    } catch (error) {
      console.error("Error fetching published reels:", error);
      throw error;
    }
  },

  // Get all reels without filters (for testing)
  async getAllReels() {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    } catch (error) {
      console.error("Error fetching all reels:", error);
      throw error;
    }
  },

  // Get reel by ID
  async getReelById(reelId) {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        reelId
      );

      // If thumbnail exists and is from storage, ensure it uses getFileView
      if (
        document.thumbnailUrl &&
        document.thumbnailUrl.includes("/storage/")
      ) {
        const fileId = this.extractFileIdFromUrl(document.thumbnailUrl);
        if (fileId) {
          document.thumbnailUrl = storage.getFileView(BUCKET_ID, fileId);
        }
      }

      return document;
    } catch (error) {
      console.error("Error fetching reel:", error);
      throw error;
    }
  },

  // Update reel - FIXED: Only update provided fields (title, description, likes, views)
  // Assumes thumbnailFile is not used in your component; ignores it for partial updates
  async updateReel(reelId, reelData) {
    try {
      // Build finalReelData with ONLY the fields that are actually provided
      const finalReelData = {};

      // Only include fields if they are passed in reelData
      if (reelData.reelTitle !== undefined) {
        finalReelData.reelTitle = (reelData.reelTitle || "").substring(0, 256);
      }
      if (reelData.description !== undefined) {
        finalReelData.description = (reelData.description || "").substring(
          0,
          1024
        );
      }
      if (reelData.likes !== undefined) {
        finalReelData.likes = parseInt(reelData.likes) || 0;
      }
      if (reelData.views !== undefined) {
        finalReelData.views = parseInt(reelData.views) || 0;
      }

      // Validate that at least one field is being updated
      if (Object.keys(finalReelData).length === 0) {
        throw new Error("No valid fields provided for update");
      }

      console.log("Updating reel with data:", finalReelData);

      const result = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        reelId,
        finalReelData
      );

      console.log("Reel updated successfully:", result.$id);
      return result;
    } catch (error) {
      console.error("Error updating reel:", error);
      if (error.code === 401) {
        throw new Error(
          "Authentication failed. Check Appwrite permissions for update."
        );
      } else if (error.code === 400) {
        throw new Error(`Invalid data: ${error.message}`);
      } else if (error.code === 404) {
        throw new Error("Reel not found.");
      } else {
        throw new Error(error.message || "Failed to update reel");
      }
    }
  },

  // Delete reel - FIXED: Improved error handling and logging; ensures file deletion only if ID is valid
  async deleteReel(reelId) {
    try {
      const reel = await this.getReelById(reelId);

      console.log("Deleting reel document:", reelId);
      const deleteResult = await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        reelId
      );
      console.log("Document deleted successfully");

      // Delete thumbnail from storage if it exists and we can extract a valid file ID
      if (
        reel.thumbnailUrl &&
        typeof reel.thumbnailUrl === "string" &&
        reel.thumbnailUrl.includes("/storage/")
      ) {
        const fileId = this.extractFileIdFromUrl(reel.thumbnailUrl);
        if (fileId) {
          console.log("Deleting thumbnail file:", fileId);
          await storage.deleteFile(BUCKET_ID, fileId);
          console.log("Thumbnail file deleted successfully");
        } else {
          console.warn(
            "Could not extract file ID from thumbnail URL; skipping file deletion"
          );
        }
      } else {
        console.log("No valid thumbnail URL found; skipping file deletion");
      }

      return deleteResult;
    } catch (error) {
      console.error("Error deleting reel:", error);
      if (error.code === 401) {
        throw new Error(
          "Authentication failed. Check Appwrite permissions for delete."
        );
      } else if (error.code === 404) {
        throw new Error("Reel not found.");
      } else if (error.code === 409 && error.type === "document_conflict") {
        throw new Error("Delete conflict; try again.");
      } else {
        throw new Error(error.message || "Failed to delete reel");
      }
    }
  },

  // Helper function to extract file ID from URL
  extractFileIdFromUrl(url) {
    if (!url || typeof url !== "string") return null;
    // Try both preview and view patterns (more robust regex for full Appwrite URLs)
    const previewMatches = url.match(
      /\/storage\/v1\/files\/([^\/]+)(?:\/preview|\?|$)/
    );
    const viewMatches = url.match(
      /\/storage\/v1\/files\/([^\/]+)(?:\/view|\?|$)/
    );
    return previewMatches
      ? previewMatches[1]
      : viewMatches
      ? viewMatches[1]
      : null;
  },

  // Helper function to convert existing preview URLs to view URLs
  convertPreviewToView(url) {
    if (!url) return url;
    return url.replace(/\/preview(?:\?|$)/, "/view$1");
  },
};
