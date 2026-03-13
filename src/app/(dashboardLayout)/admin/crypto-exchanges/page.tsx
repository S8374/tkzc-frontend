/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  Upload,
  Link2,
  CheckCircle,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { cryptoExchangeService, CryptoExchange } from "@/services/api/cryptoExchange.service";

// Available gradient options
const gradientFromOptions = [
  'from-blue-500', 'from-orange-500', 'from-gray-500', 'from-pink-500',
  'from-purple-500', 'from-green-500', 'from-red-500', 'from-yellow-500',
  'from-indigo-500', 'from-cyan-500', 'from-emerald-500', 'from-rose-500'
];

const gradientToOptions = [
  'to-cyan-500', 'to-red-500', 'to-gray-700', 'to-rose-500',
  'to-pink-500', 'to-emerald-500', 'to-orange-500', 'to-yellow-500',
  'to-purple-500', 'to-blue-500', 'to-green-500', 'to-indigo-500'
];

export default function CryptoExchangeManagement() {
  const [exchanges, setExchanges] = useState<CryptoExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExchange, setEditingExchange] = useState<CryptoExchange | null>(null);
  
  // Upload states
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconUploadStatus, setIconUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
    order: 0,
    isActive: true
  });

  // Fetch exchanges
  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const response = await cryptoExchangeService.getAllExchanges();
      if (response?.success) {
        setExchanges(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch exchanges:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate slug from name
  const generateSlug = (text: string) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  // Image upload to ImageBB
  const uploadImageToImageBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMAGEBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Image upload failed');
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIcon(true);
      setIconUploadStatus('uploading');
      
      const imageUrl = await uploadImageToImageBB(file);
      
      setFormData(prev => ({ ...prev, icon: imageUrl }));
      setIconUploadStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setIconUploadStatus('idle'), 3000);
    } catch (error) {
      console.error("Error uploading icon:", error);
      setIconUploadStatus('error');
      alert("Failed to upload icon");
    } finally {
      setUploadingIcon(false);
    }
  };

  // Auto-generate slug when name changes
  useEffect(() => {
    if (!editingExchange && formData.name && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name)
      }));
    }
  }, [formData.name, editingExchange]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle create
  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.slug || !formData.icon || !formData.gradientFrom || !formData.gradientTo) {
        alert("Please fill in all required fields");
        return;
      }

      await cryptoExchangeService.createExchange({
        name: formData.name,
        slug: generateSlug(formData.slug),
        icon: formData.icon,
        gradientFrom: formData.gradientFrom,
        gradientTo: formData.gradientTo,
        order: formData.order,
        isActive: formData.isActive
      });

      setShowModal(false);
      resetForm();
      fetchExchanges();
      alert("Exchange created successfully!");
    } catch (error: any) {
      console.error("Error creating exchange:", error);
      if (error.response?.data?.message?.includes("duplicate key")) {
        alert(`An exchange with slug "${generateSlug(formData.slug)}" already exists.`);
      } else {
        alert("Failed to create exchange");
      }
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editingExchange) return;

    try {
      await cryptoExchangeService.updateExchange(editingExchange._id, {
        name: formData.name,
        slug: generateSlug(formData.slug),
        icon: formData.icon,
        gradientFrom: formData.gradientFrom,
        gradientTo: formData.gradientTo,
        order: formData.order,
        isActive: formData.isActive
      });

      setShowModal(false);
      setEditingExchange(null);
      resetForm();
      fetchExchanges();
      alert("Exchange updated successfully!");
    } catch (error: any) {
      console.error("Error updating exchange:", error);
      if (error.response?.data?.message?.includes("duplicate key")) {
        alert(`An exchange with slug "${generateSlug(formData.slug)}" already exists.`);
      } else {
        alert("Failed to update exchange");
      }
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exchange?")) return;

    try {
      await cryptoExchangeService.deleteExchange(id);
      fetchExchanges();
      alert("Exchange deleted successfully!");
    } catch (error) {
      console.error("Error deleting exchange:", error);
      alert("Failed to delete exchange");
    }
  };

  // Handle toggle active
  const handleToggleActive = async (exchange: CryptoExchange) => {
    try {
      await cryptoExchangeService.updateExchange(exchange._id, {
        isActive: !exchange.isActive
      });
      fetchExchanges();
    } catch (error) {
      console.error("Error toggling exchange status:", error);
      alert("Failed to update exchange status");
    }
  };

  // Handle move order
  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const index = exchanges.findIndex(e => e._id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === exchanges.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const currentExchange = exchanges[index];
    const swapExchange = exchanges[newIndex];

    try {
      await cryptoExchangeService.updateExchange(currentExchange._id, { order: swapExchange.order });
      await cryptoExchangeService.updateExchange(swapExchange._id, { order: currentExchange.order });
      fetchExchanges();
    } catch (error) {
      console.error("Error reordering exchanges:", error);
      alert("Failed to reorder exchanges");
    }
  };

  // Open edit modal
  const openEditModal = (exchange: CryptoExchange) => {
    setEditingExchange(exchange);
    setFormData({
      name: exchange.name,
      slug: exchange.slug,
      icon: exchange.icon,
      gradientFrom: exchange.gradientFrom,
      gradientTo: exchange.gradientTo,
      order: exchange.order,
      isActive: exchange.isActive
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-red-500',
      order: exchanges.length,
      isActive: true
    });
    setIconUploadStatus('idle');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Crypto Exchange Management</h1>
          <button
            onClick={() => {
              setEditingExchange(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Exchange
          </button>
        </div>

        {/* Exchanges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exchanges.map((exchange, index) => (
            <div
              key={exchange._id}
              className={`bg-gray-800 rounded-lg p-4 border ${
                exchange.isActive ? 'border-green-600/50' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Icon Preview */}
                  {exchange.icon ? (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${exchange.gradientFrom} ${exchange.gradientTo} flex items-center justify-center p-1`}>
                      <img 
                        src={exchange.icon} 
                        alt={exchange.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${exchange.gradientFrom} ${exchange.gradientTo} flex items-center justify-center`}>
                      <ImageIcon size={20} className="text-white opacity-50" />
                    </div>
                  )}

                  {/* Info */}
                  <div>
                    <h3 className="text-white font-semibold">{exchange.name}</h3>
                    <p className="text-sm text-gray-400">Slug: {exchange.slug}</p>
                    <p className="text-xs text-gray-500">Order: {exchange.order}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  exchange.isActive
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {exchange.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Gradient Preview */}
              <div className={`h-2 rounded-full bg-gradient-to-r ${exchange.gradientFrom} ${exchange.gradientTo} mb-3`} />

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-700">
                {/* Order Controls */}
                <div className="flex gap-1 mr-auto">
                  <button
                    onClick={() => handleMoveOrder(exchange._id, 'up')}
                    disabled={index === 0}
                    className={`p-1.5 rounded ${
                      index === 0
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(exchange._id, 'down')}
                    disabled={index === exchanges.length - 1}
                    className={`p-1.5 rounded ${
                      index === exchanges.length - 1
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Toggle Active */}
                <button
                  onClick={() => handleToggleActive(exchange)}
                  className={`p-1.5 rounded ${
                    exchange.isActive
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/40'
                      : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/40'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEditModal(exchange)}
                  className="p-1.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(exchange._id)}
                  className="p-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {exchanges.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400">No exchanges found. Add your first exchange!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal with Icon Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingExchange ? 'Edit Exchange' : 'Add New Exchange'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingExchange(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingExchange ? handleUpdate() : handleCreate();
            }} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Exchange Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Binance"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slug (unique identifier) *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    slug: generateSlug(e.target.value)
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., binance"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Slug preview: {formData.slug || generateSlug(formData.name)}
                </p>
              </div>

              {/* Icon Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Exchange Icon *
                </label>
                <div className="space-y-3">
                  {/* Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                      id="exchange-icon-upload"
                      disabled={uploadingIcon}
                    />
                    <label
                      htmlFor="exchange-icon-upload"
                      className={`flex items-center justify-center w-full rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors ${
                        iconUploadStatus === 'success' 
                          ? 'border-green-500 bg-green-500/10' 
                          : iconUploadStatus === 'error'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-600 hover:border-blue-500 bg-gray-700/50'
                      }`}
                    >
                      <div className="text-center">
                        {uploadingIcon ? (
                          <>
                            <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-400 animate-spin" />
                            <p className="text-sm text-gray-300">Uploading...</p>
                          </>
                        ) : iconUploadStatus === 'success' ? (
                          <>
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <p className="text-sm text-green-400">Upload Successful!</p>
                          </>
                        ) : iconUploadStatus === 'error' ? (
                          <>
                            <X className="w-8 h-8 mx-auto mb-2 text-red-500" />
                            <p className="text-sm text-red-400">Upload Failed. Try again.</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-300">Click to upload icon</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Preview or URL Input */}
                  {formData.icon && (
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${formData.gradientFrom} ${formData.gradientTo} flex items-center justify-center p-1`}>
                        <img 
                          src={formData.icon} 
                          alt="Icon preview" 
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 truncate">{formData.icon}</p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                          className="text-xs text-red-400 hover:text-red-300 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual URL Input */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      Or enter icon URL manually
                    </label>
                    <input
                      type="url"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      placeholder="https://example.com/icon.png"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient From */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Gradient From *
                </label>
                <select
                  name="gradientFrom"
                  value={formData.gradientFrom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  {gradientFromOptions.map(gradient => (
                    <option key={gradient} value={gradient}>
                      {gradient}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gradient To */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Gradient To *
                </label>
                <select
                  name="gradientTo"
                  value={formData.gradientTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  {gradientToOptions.map(gradient => (
                    <option key={gradient} value={gradient}>
                      {gradient}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gradient Preview with Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Preview
                </label>
                <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${formData.gradientFrom} ${formData.gradientTo} flex items-center justify-center`}>
                    {formData.icon ? (
                      <img 
                        src={formData.icon} 
                        alt="Preview" 
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-white opacity-50" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{formData.name || 'Exchange Name'}</p>
                    <p className="text-xs text-gray-400">Gradient: {formData.gradientFrom} → {formData.gradientTo}</p>
                  </div>
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                  Active
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExchange(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingIcon}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploadingIcon ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingExchange ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}