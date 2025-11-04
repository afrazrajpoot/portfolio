"use client";

import { useState, useRef } from "react";
// import { reelService } from "@/services/reelService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Play, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { reelService } from "@/app/services/reelServices";

export default function ReelUploadPage() {
  const [formData, setFormData] = useState({
    reelTitle: "",
    reelUrl: "",
    thumbnailUrl: "",
    durationInSeconds: "",
    description: "",
    tags: "",
    category: "entertainment",
    isPublished: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const fileInputRef = useRef(null);

  const categories = [
    "entertainment",
    "comedy",
    "educational",
    "music",
    "dance",
    "sports",
    "cooking",
    "travel",
    "fashion",
    "technology",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validate required fields
      if (!formData.reelTitle.trim()) {
        throw new Error("Reel title is required");
      }

      if (!formData.reelUrl.trim()) {
        throw new Error("Reel URL is required");
      }

      if (
        !formData.durationInSeconds ||
        parseInt(formData.durationInSeconds) < 1
      ) {
        throw new Error("Please enter a valid duration (1-60 seconds)");
      }

      const duration = parseInt(formData.durationInSeconds);
      if (duration > 60) {
        throw new Error("Reels cannot be longer than 60 seconds");
      }

      const reelData = {
        reelTitle: formData.reelTitle,
        reelUrl: formData.reelUrl,
        thumbnailUrl: formData.thumbnailUrl,
        durationInSeconds: duration,
        description: formData.description,
        tags: tags,
        category: formData.category,
        isPublished: formData.isPublished,
        publishedDate: new Date().toISOString(),
      };

      await reelService.createReel(reelData, thumbnailFile);
      setMessage("Reel uploaded successfully!");

      // Reset form
      setFormData({
        reelTitle: "",
        reelUrl: "",
        thumbnailUrl: "",
        durationInSeconds: "",
        description: "",
        tags: "",
        category: "entertainment",
        isPublished: true,
      });
      setThumbnailFile(null);
      setImagePreview("");
      setTags([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading reel:", error);
      setMessage(error.message);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size should be less than 5MB");
        return;
      }

      setThumbnailFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

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

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Upload Reel</h1>
          <p className="text-gray-400 text-lg">
            Share your short videos with the world (max 60 seconds)
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Back to Portfolio
              </Button>
            </Link>
            <Link href="/reels">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-400"
              >
                View All Reels
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Play className="w-6 h-6 text-purple-400" />
              Reel Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              Fill in the details about your reel video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reel Title */}
              <div>
                <Label htmlFor="reelTitle" className="text-gray-300">
                  Reel Title *
                </Label>
                <Input
                  id="reelTitle"
                  name="reelTitle"
                  value={formData.reelTitle}
                  onChange={handleChange}
                  required
                  maxLength={256}
                  className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter an engaging title for your reel"
                />
              </div>

              {/* Reel URL */}
              <div>
                <Label htmlFor="reelUrl" className="text-gray-300">
                  Video URL *
                </Label>
                <Input
                  id="reelUrl"
                  name="reelUrl"
                  type="url"
                  value={formData.reelUrl}
                  onChange={handleChange}
                  required
                  maxLength={512}
                  className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                />
              </div>

              {/* Thumbnail Section */}
              <div className="space-y-4">
                <Label className="text-gray-300">Thumbnail Image</Label>

                {/* File Upload */}
                <div>
                  <Label
                    htmlFor="thumbnailFile"
                    className="text-sm text-gray-400"
                  >
                    Upload Thumbnail
                  </Label>
                  <Input
                    ref={fileInputRef}
                    id="thumbnailFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 bg-gray-700 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, WebP. Max size: 5MB
                  </p>
                </div>

                {/* OR separator */}
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-600"></div>
                  <span className="mx-4 text-sm text-gray-500">OR</span>
                  <div className="flex-grow border-t border-gray-600"></div>
                </div>

                {/* URL Input */}
                <div>
                  <Label
                    htmlFor="thumbnailUrl"
                    className="text-sm text-gray-400"
                  >
                    Use Image URL
                  </Label>
                  <Input
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    disabled={thumbnailFile}
                    maxLength={512}
                    className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-600"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <Label className="text-sm text-gray-400 mb-2">
                      Thumbnail Preview
                    </Label>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Thumbnail preview"
                        className="h-32 w-auto rounded-lg border border-gray-600"
                      />
                      <Button
                        type="button"
                        onClick={removeSelectedFile}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Duration and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duration */}
                <div>
                  <Label htmlFor="durationInSeconds" className="text-gray-300">
                    Duration (Seconds) *
                  </Label>
                  <div className="relative">
                    <Input
                      id="durationInSeconds"
                      name="durationInSeconds"
                      type="number"
                      value={formData.durationInSeconds}
                      onChange={handleChange}
                      required
                      min="1"
                      max="60"
                      className="mt-1 bg-gray-700 border-gray-600 text-white pl-10"
                      placeholder="15"
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be between 1 and 60 seconds
                  </p>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-gray-300">
                    Category
                  </Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={1024}
                  rows={3}
                  className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Describe your reel content..."
                />
              </div>

              {/* Tags */}
              <div>
                <Label
                  htmlFor="tags"
                  className="text-gray-300 flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Tags
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Add a tag and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Add
                  </Button>
                </div>

                {/* Tags Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-600 text-white flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          onClick={() => removeTag(tag)}
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-purple-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <Label htmlFor="isPublished" className="text-gray-300">
                  Publish immediately
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading Reel...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Reel
                  </div>
                )}
              </Button>

              {/* Message */}
              {message && (
                <div
                  className={`p-4 rounded-md text-center ${
                    message.includes("Error") || message.includes("cannot")
                      ? "bg-red-900/50 text-red-200 border border-red-700"
                      : "bg-green-900/50 text-green-200 border border-green-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
