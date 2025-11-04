import { databases, storage, ID } from "@/lib/appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

export const storageService = {
  async uploadFile(file) {
    try {
      return await storage.createFile(BUCKET_ID, ID.unique(), file);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  getFilePreview(fileId) {
    try {
      return storage.getFilePreview(BUCKET_ID, fileId);
    } catch (error) {
      console.error("Error getting file preview:", error);
      throw error;
    }
  },

  getFileView(fileId) {
    try {
      return storage.getFileView(BUCKET_ID, fileId);
    } catch (error) {
      console.error("Error getting file view:", error);
      throw error;
    }
  },

  async deleteFile(fileId) {
    try {
      return await storage.deleteFile(BUCKET_ID, fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  async listFiles(queries = []) {
    try {
      return await storage.listFiles(BUCKET_ID, queries);
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  },
};

export const videoService = {
  async createVideo(videoData, thumbnailFile = null) {
    try {
      let thumbnailUrl = videoData.thumbnailUrl;

      if (thumbnailFile) {
        const uploadedFile = await storageService.uploadFile(thumbnailFile);
        thumbnailUrl = storageService.getFilePreview(uploadedFile.$id);
      }

      const finalVideoData = {
        videoTitle: videoData.videoTitle,
        description: videoData.description || "",
        videoUrl: videoData.videoUrl,
        thumbnailUrl: thumbnailUrl || "",
        durationInSeconds: parseInt(videoData.durationInSeconds),
        publishedDate: videoData.publishedDate,
        isFeatured: Boolean(videoData.isFeatured),
        tags: videoData.tags || [],
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        finalVideoData
      );

      return result;
    } catch (error) {
      console.error("Error creating video:", error);
      throw error;
    }
  },

  async getVideos(queries = []) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        queries
      );
      return response;
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw error;
    }
  },

  async getFeaturedVideos() {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        'equal("isFeatured", true)',
      ]);
    } catch (error) {
      console.error("Error fetching featured videos:", error);
      throw error;
    }
  },

  async getVideoById(videoId) {
    try {
      return await databases.getDocument(DATABASE_ID, COLLECTION_ID, videoId);
    } catch (error) {
      console.error("Error fetching video:", error);
      throw error;
    }
  },

  async updateVideo(videoId, videoData, thumbnailFile = null) {
    try {
      let thumbnailUrl = videoData.thumbnailUrl;

      if (thumbnailFile) {
        const uploadedFile = await storageService.uploadFile(thumbnailFile);
        thumbnailUrl = storageService.getFilePreview(uploadedFile.$id);
      }

      const finalVideoData = {
        ...videoData,
        thumbnailUrl: thumbnailUrl || videoData.thumbnailUrl,
      };

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        videoId,
        finalVideoData
      );
    } catch (error) {
      console.error("Error updating video:", error);
      throw error;
    }
  },

  async deleteVideo(videoId) {
    try {
      const video = await this.getVideoById(videoId);

      const result = await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        videoId
      );

      if (video.thumbnailUrl && video.thumbnailUrl.includes("/storage/")) {
        const fileId = this.extractFileIdFromUrl(video.thumbnailUrl);
        if (fileId) {
          await storageService.deleteFile(fileId);
        }
      }

      return result;
    } catch (error) {
      console.error("Error deleting video:", error);
      throw error;
    }
  },

  extractFileIdFromUrl(url) {
    const matches = url.match(/\/storage\/v1\/files\/([^\/]+)\/preview/);
    return matches ? matches[1] : null;
  },
};
