"use client";

import { videoService } from "@/app/services/dbServices";
import { useState, useRef } from "react";
// import { videoService } from "@app/services/videoService";

export default function VideoForm() {
  const [formData, setFormData] = useState({
    videoTitle: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    durationInSeconds: "",
    publishedDate: "",
    isFeatured: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const videoData = {
        videoTitle: formData.videoTitle,
        description: formData.description,
        videoUrl: formData.videoUrl,
        thumbnailUrl: formData.thumbnailUrl, // Fallback URL if no file uploaded
        durationInSeconds: parseInt(formData.durationInSeconds),
        publishedDate: formData.publishedDate,
        isFeatured: formData.isFeatured,
      };

      await videoService.createVideo(videoData, thumbnailFile);
      setMessage("Video saved successfully!");

      // Reset form
      setFormData({
        videoTitle: "",
        description: "",
        videoUrl: "",
        thumbnailUrl: "",
        durationInSeconds: "",
        publishedDate: "",
        isFeatured: false,
      });
      setThumbnailFile(null);
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setMessage("Error saving video: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size should be less than 5MB");
        return;
      }

      setThumbnailFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e): any => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear URL input when file is selected
      setFormData((prev) => ({ ...prev, thumbnailUrl: "" }));
    }
  };

  const removeSelectedFile = () => {
    setThumbnailFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Featured Video</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Video Title *
          </label>
          <input
            type="text"
            name="videoTitle"
            value={formData.videoTitle}
            onChange={handleChange}
            required
            maxLength={256}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="Enter video title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={1024}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="Enter video description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Video URL *
          </label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            required
            maxLength={512}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        {/* Thumbnail Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>

            {/* File Upload */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, WebP. Max size: 5MB
              </p>
            </div>

            {/* OR separator */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Use Image URL
              </label>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                disabled={thumbnailFile}
                maxLength={512}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Thumbnail preview"
                  className="h-32 w-auto rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duration (Seconds) *
          </label>
          <input
            type="number"
            name="durationInSeconds"
            value={formData.durationInSeconds}
            onChange={handleChange}
            required
            min="1"
            max="21600"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="150"
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be between 1 and 21600 seconds (6 hours)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Published Date *
          </label>
          <input
            type="datetime-local"
            name="publishedDate"
            value={formData.publishedDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Featured Video
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Video"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
