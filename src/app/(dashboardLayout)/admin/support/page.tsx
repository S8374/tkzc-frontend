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
  Send,
  Headphones,
  Crown,
  ShieldCheck,
  Bot,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";
import { supportService, Support } from "@/services/api/support.service";

// Available icon options
const iconOptions = [
  { name: 'Send', component: Send },
  { name: 'Headphones', component: Headphones },
  { name: 'Crown', component: Crown },
  { name: 'ShieldCheck', component: ShieldCheck },
  { name: 'Bot', component: Bot },
  { name: 'MessageCircle', component: MessageCircle },
  { name: 'Phone', component: Phone },
  { name: 'Mail', component: Mail },
];

export default function SupportManagement() {
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupport, setEditingSupport] = useState<Support | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    label: '',
    icon: 'Send',
    link: '',
    buttonText: '',
    buttonUrl: '',
    order: 0,
    isActive: true
  });

  // Fetch supports
  useEffect(() => {
    fetchSupports();
  }, []);

  const fetchSupports = async () => {
    try {
      setLoading(true);
      const response = await supportService.getAllSupports();
      if (response?.success) {
        setSupports(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch supports:", error);
    } finally {
      setLoading(false);
    }
  };

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
      if (!formData.label || !formData.icon || !formData.link || !formData.buttonText || !formData.buttonUrl) {
        alert("Please fill in all required fields");
        return;
      }

      await supportService.createSupport(formData);
      setShowModal(false);
      resetForm();
      fetchSupports();
      alert("Support item created successfully!");
    } catch (error) {
      console.error("Error creating support:", error);
      alert("Failed to create support item");
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editingSupport) return;

    try {
      await supportService.updateSupport(editingSupport._id, formData);
      setShowModal(false);
      setEditingSupport(null);
      resetForm();
      fetchSupports();
      alert("Support item updated successfully!");
    } catch (error) {
      console.error("Error updating support:", error);
      alert("Failed to update support item");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this support item?")) return;

    try {
      await supportService.deleteSupport(id);
      fetchSupports();
      alert("Support item deleted successfully!");
    } catch (error) {
      console.error("Error deleting support:", error);
      alert("Failed to delete support item");
    }
  };

  // Handle toggle active
  const handleToggleActive = async (support: Support) => {
    try {
      await supportService.updateSupport(support._id, {
        isActive: !support.isActive
      });
      fetchSupports();
    } catch (error) {
      console.error("Error toggling support status:", error);
      alert("Failed to update support status");
    }
  };

  // Handle move order
  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const index = supports.findIndex(s => s._id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === supports.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const currentSupport = supports[index];
    const swapSupport = supports[newIndex];

    try {
      await supportService.updateSupport(currentSupport._id, { order: swapSupport.order });
      await supportService.updateSupport(swapSupport._id, { order: currentSupport.order });
      fetchSupports();
    } catch (error) {
      console.error("Error reordering supports:", error);
      alert("Failed to reorder support items");
    }
  };

  // Open edit modal
  const openEditModal = (support: Support) => {
    setEditingSupport(support);
    setFormData({
      label: support.label,
      icon: support.icon,
      link: support.link,
      buttonText: support.buttonText,
      buttonUrl: support.buttonUrl,
      order: support.order,
      isActive: support.isActive
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      label: '',
      icon: 'Send',
      link: '',
      buttonText: '',
      buttonUrl: '',
      order: supports.length,
      isActive: true
    });
  };

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(i => i.name === iconName);
    return icon?.component || Send;
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
          <h1 className="text-2xl font-bold text-white">Support Management</h1>
          <button
            onClick={() => {
              setEditingSupport(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Support
          </button>
        </div>

        {/* Supports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supports.map((support, index) => {
            const IconComponent = getIconComponent(support.icon);
            
            return (
              <div
                key={support._id}
                className={`bg-gray-800 rounded-lg p-4 border ${
                  support.isActive ? 'border-green-600/50' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Icon Preview */}
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-yellow-400" />
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-white font-semibold">{support.label}</h3>
                      <p className="text-xs text-gray-400">Icon: {support.icon}</p>
                      <p className="text-xs text-gray-500">Order: {support.order}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    support.isActive
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {support.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-sm mb-3">
                  <p className="text-gray-300 truncate">
                    <span className="text-gray-500">Link:</span> {support.link}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Button:</span> {support.buttonText}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-700">
                  {/* Order Controls */}
                  <div className="flex gap-1 mr-auto">
                    <button
                      onClick={() => handleMoveOrder(support._id, 'up')}
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
                      onClick={() => handleMoveOrder(support._id, 'down')}
                      disabled={index === supports.length - 1}
                      className={`p-1.5 rounded ${
                        index === supports.length - 1
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleActive(support)}
                    className={`p-1.5 rounded ${
                      support.isActive
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/40'
                        : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/40'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(support)}
                    className="p-1.5 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(support._id)}
                    className="p-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {supports.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400">No support items found. Add your first support!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingSupport ? 'Edit Support' : 'Add New Support'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSupport(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingSupport ? handleUpdate() : handleCreate();
            }} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Telegram, Online Service"
                  required
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Icon *
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  {iconOptions.map(icon => (
                    <option key={icon.name} value={icon.name}>
                      {icon.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Preview:</span>
                  {(() => {
                    const IconComp = iconOptions.find(i => i.name === formData.icon)?.component || Send;
                    return <IconComp className="w-5 h-5 text-yellow-400" />;
                  })()}
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Link / URL *
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="https://t.me/username"
                  required
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Button Text *
                </label>
                <input
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Consult, Contact"
                  required
                />
              </div>

              {/* Button URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Button URL *
                </label>
                <input
                  type="url"
                  name="buttonUrl"
                  value={formData.buttonUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="https://example.com/contact"
                  required
                />
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
                    setEditingSupport(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingSupport ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}