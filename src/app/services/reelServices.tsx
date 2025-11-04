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

  // Update reel
  async updateReel(reelId, reelData, thumbnailFile = null) {
    try {
      let thumbnailUrl = reelData.thumbnailUrl;

      if (thumbnailFile) {
        const uploadedFile = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          thumbnailFile
        );
        // Use getFileView instead of getFilePreview
        thumbnailUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);
      }

      const finalReelData = {
        reelTitle: reelData.reelTitle?.substring(0, 256),
        reelUrl: reelData.reelUrl?.substring(0, 512),
        thumbnailUrl: thumbnailUrl?.substring(0, 512) || reelData.thumbnailUrl,
        durationInSeconds: parseInt(reelData.durationInSeconds),
        description: reelData.description?.substring(0, 1024),
        tags: Array.isArray(reelData.tags)
          ? reelData.tags.slice(0, 10)
          : reelData.tags,
        isPublished: Boolean(reelData.isPublished),
        category: reelData.category?.substring(0, 50),
      };

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        reelId,
        finalReelData
      );
    } catch (error) {
      console.error("Error updating reel:", error);
      throw error;
    }
  },

  // Delete reel
  async deleteReel(reelId) {
    try {
      const reel = await this.getReelById(reelId);

      const result = await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        reelId
      );

      // Delete thumbnail from storage if exists
      if (reel.thumbnailUrl && reel.thumbnailUrl.includes("/storage/")) {
        const fileId = this.extractFileIdFromUrl(reel.thumbnailUrl);
        if (fileId) {
          await storage.deleteFile(BUCKET_ID, fileId);
        }
      }

      return result;
    } catch (error) {
      console.error("Error deleting reel:", error);
      throw error;
    }
  },

  // Helper function to extract file ID from URL
  extractFileIdFromUrl(url) {
    if (!url) return null;
    // Try both preview and view patterns
    const previewMatches = url.match(/\/storage\/v1\/files\/([^\/]+)\/preview/);
    const viewMatches = url.match(/\/storage\/v1\/files\/([^\/]+)\/view/);
    return previewMatches
      ? previewMatches[1]
      : viewMatches
      ? viewMatches[1]
      : null;
  },

  // Helper function to convert existing preview URLs to view URLs
  convertPreviewToView(url) {
    if (!url) return url;
    return url.replace("/preview", "/view");
  },
};
