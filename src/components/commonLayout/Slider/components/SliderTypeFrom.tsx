"use client";

import { SliderTypeData, sliderTypeService } from "@/services/api/slider.types";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateSliderTypeForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Name is required");

    const payload: SliderTypeData = {
      name: name.trim(),
      description: description.trim() || undefined,
      iconUrl: iconUrl.trim() || undefined,
      isActive,
    };

    try {
      setLoading(true);
      const res = await sliderTypeService.createSliderType(payload);
      toast.success("Slider Type created successfully 🎉");
      console.log("Created Slider Type:", res);

      // Reset form
      setName("");
      setDescription("");
      setIconUrl("");
      setIsActive(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create slider type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Create Slider Type</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-gray-300 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Hero, Banner, etc."
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
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

        {/* Icon URL */}
        <div>
          <label className="block text-gray-300 mb-1">Icon URL</label>
          <input
            type="text"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            placeholder="Optional icon URL"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive((prev) => !prev)}
            className="accent-yellow-500 w-5 h-5"
            id="isActive"
          />
          <label htmlFor="isActive" className="text-gray-300">
            Active
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-bold text-white
                     bg-gradient-to-r from-yellow-500 to-orange-600
                     hover:opacity-90 transition"
        >
          {loading ? "Creating..." : "Create Slider Type"}
        </button>
      </form>
    </div>
  );
}
