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
  Upload,
  Link2,
  CheckCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon
} from "lucide-react";
import { partnerService } from "@/services/api/partner.service";

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadStatus, setLogoUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    order: 0,
    isActive: true
  });

  // Fetch partners
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getAllPartners();
      if (response?.success) {
        setPartners(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch partners:", error);
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

  // Auto-generate slug when name changes
  useEffect(() => {
    if (!editingPartner && formData.name && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name)
      }));
    }
  }, [formData.name, editingPartner]);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      setLogoUploadStatus('uploading');
      
      const imageUrl = await uploadImageToImageBB(file);
      
      setFormData(prev => ({ ...prev, logo: imageUrl }));
      setLogoUploadStatus('success');
      
      setTimeout(() => setLogoUploadStatus('idle'), 3000);
    } catch (error) {
      console.error("Error uploading logo:", error);
      setLogoUploadStatus('error');
      alert("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle create
  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.slug || !formData.logo) {
        alert("Please fill in all required fields");
        return;
      }

      await partnerService.createPartner({
        name: formData.name,
        slug: generateSlug(formData.slug),
        logo: formData.logo,
        order: formData.order,
        isActive: formData.isActive
      });

      setShowModal(false);
      resetForm();
      fetchPartners();
      alert("Partner created successfully!");
    } catch (error: any) {
      console.error("Error creating partner:", error);
      if (error.response?.data?.message?.includes("duplicate key")) {
        alert(`A partner with slug "${generateSlug(formData.slug)}" already exists. Please use a different slug.`);
      } else {
        alert("Failed to create partner");
      }
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editingPartner) return;

    try {
      await partnerService.updatePartner(editingPartner._id, {
        name: formData.name,
        slug: generateSlug(formData.slug),
        logo: formData.logo,
        order: formData.order,
        isActive: formData.isActive
      });

      setShowModal(false);
      setEditingPartner(null);
      resetForm();
      fetchPartners();
      alert("Partner updated successfully!");
    } catch (error: any) {
      console.error("Error updating partner:", error);
      if (error.response?.data?.message?.includes("duplicate key")) {
        alert(`A partner with slug "${generateSlug(formData.slug)}" already exists. Please use a different slug.`);
      } else {
        alert("Failed to update partner");
      }
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;

    try {
      await partnerService.deletePartner(id);
      fetchPartners();
      alert("Partner deleted successfully!");
    } catch (error) {
      console.error("Error deleting partner:", error);
      alert("Failed to delete partner");
    }
  };

  // Handle toggle active
  const handleToggleActive = async (partner: Partner) => {
    try {
      await partnerService.updatePartner(partner._id, {
        isActive: !partner.isActive
      });
      fetchPartners();
    } catch (error) {
      console.error("Error toggling partner status:", error);
      alert("Failed to update partner status");
    }
  };

  // Handle move order
  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const index = partners.findIndex(p => p._id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === partners.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const currentPartner = partners[index];
    const swapPartner = partners[newIndex];

    try {
      await partnerService.updatePartner(currentPartner._id, { order: swapPartner.order });
      await partnerService.updatePartner(swapPartner._id, { order: currentPartner.order });
      fetchPartners();
    } catch (error) {
      console.error("Error reordering partners:", error);
      alert("Failed to reorder partners");
    }
  };

  // Open edit modal
  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      slug: partner.slug,
      logo: partner.logo,
      order: partner.order,
      isActive: partner.isActive
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      logo: '',
      order: partners.length,
      isActive: true
    });
    setLogoUploadStatus('idle');
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
          <h1 className="text-2xl font-bold text-white">Partner Management</h1>
          <button
            onClick={() => {
              setEditingPartner(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner, index) => (
            <div
              key={partner._id}
              className={`bg-gray-800 rounded-lg p-4 border ${
                partner.isActive ? 'border-green-600/50' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-white font-semibold">{partner.name}</h3>
                    <p className="text-sm text-gray-400">Slug: {partner.slug}</p>
                    <p className="text-xs text-gray-500">Order: {partner.order}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  partner.isActive
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {partner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-700">
                {/* Order Controls */}
                <div className="flex gap-1 mr-auto">
                  <button
                    onClick={() => handleMoveOrder(partner._id, 'up')}
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
                    onClick={() => handleMoveOrder(partner._id, 'down')}
                    disabled={index === partners.length - 1}
                    className={`p-1.5 rounded ${
                      index === partners.length - 1
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Toggle Active */}
                <button
                  onClick={() => handleToggleActive(partner)}
                  className={`p-1.5 rounded ${
                    partner.isActive
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/40'
                      : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/40'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEditModal(partner)}
                  className="p-1.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(partner._id)}
                  className="p-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {partners.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400">No partners found. Add your first partner!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPartner(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingPartner ? handleUpdate() : handleCreate();
            }} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Partner Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Evolution Gaming"
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
                  placeholder="e.g., evolution"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Slug preview: {formData.slug || generateSlug(formData.name)}
                </p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Partner Logo *
                </label>
                <div className="space-y-3">
                  {/* Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploadingLogo}
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`flex items-center justify-center w-full rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors ${
                        logoUploadStatus === 'success' 
                          ? 'border-green-500 bg-green-500/10' 
                          : logoUploadStatus === 'error'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-600 hover:border-blue-500 bg-gray-700/50'
                      }`}
                    >
                      <div className="text-center">
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-400 animate-spin" />
                            <p className="text-sm text-gray-300">Uploading...</p>
                          </>
                        ) : logoUploadStatus === 'success' ? (
                          <>
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <p className="text-sm text-green-400">Upload Successful!</p>
                          </>
                        ) : logoUploadStatus === 'error' ? (
                          <>
                            <X className="w-8 h-8 mx-auto mb-2 text-red-500" />
                            <p className="text-sm text-red-400">Upload Failed. Try again.</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-300">Click to upload logo</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Preview or URL Input */}
                  {formData.logo && (
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <img 
                        src={formData.logo} 
                        alt="Logo preview" 
                        className="w-12 h-12 rounded-lg object-contain"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 truncate">{formData.logo}</p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
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
                      Or enter logo URL manually
                    </label>
                    <input
                      type="url"
                      name="logo"
                      value={formData.logo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      placeholder="https://example.com/logo.png"
                    />
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
                    setEditingPartner(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingPartner ? 'Update' : 'Create'}
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