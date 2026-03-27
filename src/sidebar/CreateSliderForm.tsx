"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { sliderService, SliderData } from "@/services/api/slider.service";
import { sliderTypeService } from "@/services/api/slider.types";
import { uploadImageToImageBB } from "@/lib/imageUpload";

export default function CreateSliderForm() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [manualImageLink, setManualImageLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sliderTypeId, setSliderTypeId] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [imageRedirectLink, setImageRedirectLink] = useState("");
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sliderTypes, setSliderTypes] = useState<any[]>([]);

  // Fetch slider types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await sliderTypeService.getAllSliderTypes();
        setSliderTypes(res.data || []);
      } catch (err) {
        toast.error("Failed to fetch slider types");
      }
    };
    fetchTypes();
  }, []);

  // Handle ImageBB upload
  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true);
      const url = await uploadImageToImageBB(file);
      setImageUrl(url);
      setManualImageLink(""); // clear manual link
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Use manual link
  const handleManualLinkChange = (link: string) => {
    setManualImageLink(link);
    setImageUrl(link); // update main imageUrl
    setImageFile(null); // clear file selection
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title is required");
    if (!imageUrl) return toast.error("Please upload or enter an image URL");
    if (!sliderTypeId) return toast.error("Select a slider type");
    if (!imageRedirectLink.trim()) return toast.error("Image redirect link is required");

    const payload: SliderData = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      image: imageUrl,
      sliderTypeId,
      buttonText: buttonText.trim() || undefined,
      buttonLink: buttonLink.trim() || undefined,
      imageRedirectLink: imageRedirectLink.trim(),
      order,
    };

    try {
      setLoading(true);
      const res = await sliderService.createSlider(payload);
      toast.success("Slider created successfully!");
      console.log("Created Slider:", res);

      // Reset form
      setTitle("");
      setSubtitle("");
      setDescription("");
      setImageFile(null);
      setManualImageLink("");
      setImageUrl("");
      setSliderTypeId("");
      setButtonText("");
      setButtonLink("");
      setImageRedirectLink("");
      setOrder(0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create slider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Create Slider And Game Library</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-gray-300 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Slider title"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-gray-300 mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Optional subtitle"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            rows={3}
          />
        </div>

        {/* Image Options */}
        <div className="space-y-2">
          <label className="block text-gray-300 mb-1">Image *</label>

          {/* Upload file */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
            className="w-full text-gray-300"
          />

          <span className="block text-center text-gray-400">OR</span>

          {/* Manual URL */}
          <input
            type="text"
            value={manualImageLink}
            onChange={(e) => handleManualLinkChange(e.target.value)}
            placeholder="Enter image URL manually"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          {/* Preview */}
          {imageUrl && (
            <img src={imageUrl} alt="Selected" className="mt-2 h-32 object-cover rounded" />
          )}
        </div>

        {/* Slider Type */}
        <div>
          <label className="block text-gray-300 mb-1">Slider Type *</label>
          <select
            value={sliderTypeId}
            onChange={(e) => setSliderTypeId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          >
            <option value="">Select Type</option>
            {sliderTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Button Text */}
        <div>
          <label className="block text-gray-300 mb-1">Button Text</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="Optional button text"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Button Link */}
        <div>
          <label className="block text-gray-300 mb-1">Button Link</label>
          <input
            type="text"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="Optional button link"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Image Redirect Link */}
        <div>
          <label className="block text-gray-300 mb-1">Image Redirect Link *</label>
          <input
            type="text"
            value={imageRedirectLink}
            onChange={(e) => setImageRedirectLink(e.target.value)}
            placeholder="Where should image link redirect?"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        {/* Order */}
        <div>
          <label className="block text-gray-300 mb-1">Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-bold text-white
                     bg-gradient-to-r from-yellow-500 to-orange-600
                     hover:opacity-90 transition"
        >
          {loading ? "Creating..." : "Create Slider"}
        </button>
      </form>
    </div>
  );
}
