"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, X, Save, Power, Upload, Loader2, CheckCircle } from "lucide-react";
import {
  DownloadApp,
  DownloadAppData,
  DownloadCategory,
  downloadAppService,
} from "@/services/api/downloadApp.service";

const initialForm: DownloadAppData = {
  name: "",
  slug: "",
  icon: "",
  category: "VPN",
  downloadUrl: "",
  description: "",
  order: 0,
  isActive: true,
};

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function SoftwareDownloadsAdminPage() {
  const [apps, setApps] = useState<DownloadApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DownloadApp | null>(null);
  const [form, setForm] = useState<DownloadAppData>(initialForm);
  const [filter, setFilter] = useState<"ALL" | DownloadCategory>("ALL");
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const uploadImageToImageBB = async (file: File): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY;
    if (!apiKey) {
      throw new Error("Image upload key is missing");
    }

    const data = new FormData();
    data.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: data,
    });

    const json = await response.json();
    if (!json?.success || !json?.data?.url) {
      throw new Error("Image upload failed");
    }

    return json.data.url;
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIcon(true);
      const url = await uploadImageToImageBB(file);
      setForm((prev) => ({ ...prev, icon: url }));
    } catch (error: any) {
      alert(error?.message || "Failed to upload icon");
    } finally {
      setUploadingIcon(false);
      e.target.value = "";
    }
  };

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await downloadAppService.getAllApps();
      if (response?.success) {
        setApps(response.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filteredApps = useMemo(() => {
    if (filter === "ALL") return apps;
    return apps.filter((app) => app.category === filter);
  }, [apps, filter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...initialForm, order: apps.length });
    setShowModal(true);
  };

  const openEdit = (app: DownloadApp) => {
    setEditing(app);
    setForm({
      name: app.name,
      slug: app.slug,
      icon: app.icon,
      category: app.category,
      downloadUrl: app.downloadUrl,
      description: app.description || "",
      order: app.order,
      isActive: app.isActive,
    });
    setShowModal(true);
  };

  const submitForm = async () => {
    if (!form.name || !form.icon || !form.downloadUrl) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ...form,
      slug: toSlug(form.slug || form.name),
    };

    if (editing) {
      await downloadAppService.updateApp(editing._id, payload);
    } else {
      await downloadAppService.createApp(payload as DownloadAppData);
    }

    setShowModal(false);
    setEditing(null);
    setForm(initialForm);
    fetchApps();
  };

  const toggleActive = async (app: DownloadApp) => {
    await downloadAppService.updateApp(app._id, { isActive: !app.isActive });
    fetchApps();
  };

  const removeApp = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await downloadAppService.deleteApp(id);
    fetchApps();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Software Downloads Management</h1>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(["ALL", "VPN", "WALLET"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-md text-sm ${
                filter === type ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No items found</div>
          ) : (
            <table className="w-full text-white">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left text-xs px-4 py-3">Name</th>
                  <th className="text-left text-xs px-4 py-3">Category</th>
                  <th className="text-left text-xs px-4 py-3">Order</th>
                  <th className="text-left text-xs px-4 py-3">Status</th>
                  <th className="text-right text-xs px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app._id} className="border-t border-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={app.icon} alt={app.name} className="w-8 h-8 rounded object-contain bg-gray-900" />
                        <div>
                          <p className="text-sm font-medium">{app.name}</p>
                          <p className="text-xs text-gray-400">{app.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{app.category}</td>
                    <td className="px-4 py-3 text-sm">{app.order}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${app.isActive ? "bg-green-600/20 text-green-400" : "bg-gray-600/20 text-gray-300"}`}>
                        {app.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => toggleActive(app)} className="p-1.5 rounded bg-gray-700 hover:bg-gray-600">
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(app)} className="p-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeApp(app._id)} className="p-1.5 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 w-full max-w-lg rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">{editing ? "Edit Item" : "Add Item"}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: toSlug(e.target.value) }))}
                placeholder="Name"
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
              />
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: toSlug(e.target.value) }))}
                placeholder="Slug"
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
              />
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as DownloadCategory }))}
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
              >
                <option value="VPN">VPN</option>
                <option value="WALLET">WALLET</option>
              </select>
              <div className="space-y-2">
                <label className="block text-xs text-gray-300">Icon Upload</label>
                <input
                  id="download-app-icon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                  disabled={uploadingIcon}
                />
                <label
                  htmlFor="download-app-icon-upload"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-700 text-white cursor-pointer hover:bg-gray-600"
                >
                  {uploadingIcon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingIcon ? "Uploading..." : "Upload Icon"}
                </label>
                {form.icon && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Icon ready
                  </div>
                )}
              </div>
              <input
                value={form.icon}
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                placeholder="Icon URL"
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
              />
              <input
                value={form.downloadUrl}
                onChange={(e) => setForm((p) => ({ ...p, downloadUrl: e.target.value }))}
                placeholder="Download URL"
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
              />
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                rows={3}
              />
              <input
                type="number"
                value={form.order || 0}
                onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                placeholder="Order"
                className="w-full px-3 py-2 bg-gray-700 rounded text-white"
              />
              <label className="flex items-center gap-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                }}
                className="px-4 py-2 rounded bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button onClick={submitForm} className="px-4 py-2 rounded bg-blue-600 text-white inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
