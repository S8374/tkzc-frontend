"use client";

import { useEffect, useState } from "react";
import { marqueeService, Marquee } from "@/services/api/marquee.service";
import { 
    Pencil, 
    Trash2, 
    Eye, 
    EyeOff, 
    ArrowUp, 
    ArrowDown, 
    Plus, 
    X,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Save,
    Menu,
    Hash,
    Type,
    CalendarDays,
    Activity,
    Layers,
    Search,
    Filter
} from "lucide-react";

const MarqueeAdmin = () => {
    const [marquees, setMarquees] = useState<Marquee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMarquee, setEditingMarquee] = useState<Marquee | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [formData, setFormData] = useState({
        textEn: "",
        textZh: "",
        textVi: "",
        textBn: "",
        isActive: true,
        order: 0,
        startDate: "",
        endDate: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Fetch all marquees
    const fetchMarquees = async () => {
        try {
            setLoading(true);
            const res = await marqueeService.getAllMarquees();
            if (res?.success) {
                setMarquees(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch marquees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarquees();
    }, []);

    // Handle form input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        
        if (field === 'textEn' && !formData.textEn.trim()) {
            setErrors(prev => ({ ...prev, textEn: 'English marquee text is required' }));
        }
    };

    // Open create modal
    const openCreateModal = () => {
        setEditingMarquee(null);
        setFormData({
            textEn: "",
            textZh: "",
            textVi: "",
            textBn: "",
            isActive: true,
            order: marquees.length + 1,
            startDate: "",
            endDate: "",
        });
        setErrors({});
        setTouched({});
        setShowModal(true);
    };

    // Open edit modal
    const openEditModal = (marquee: Marquee) => {
        setEditingMarquee(marquee);
        const textEn = marquee.textTranslations?.en || marquee.text || "";
        setFormData({
            textEn,
            textZh: marquee.textTranslations?.zh || "",
            textVi: marquee.textTranslations?.vi || "",
            textBn: marquee.textTranslations?.bn || "",
            isActive: marquee.isActive,
            order: marquee.order,
            startDate: marquee.startDate ? new Date(marquee.startDate).toISOString().split('T')[0] : "",
            endDate: marquee.endDate ? new Date(marquee.endDate).toISOString().split('T')[0] : "",
        });
        setErrors({});
        setTouched({});
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setEditingMarquee(null);
    };

    // Validate form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.textEn.trim()) {
            newErrors.textEn = 'English marquee text is required';
        }
        
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                newErrors.endDate = 'End date must be after start date';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Create marquee
    const handleCreate = async () => {
        if (!validateForm()) return;

        try {
            const textEn = formData.textEn.trim();
            const textZh = formData.textZh.trim();
            const textVi = formData.textVi.trim();
            const textBn = formData.textBn.trim();
            const dataToSend: any = {
                text: textEn,
                textTranslations: {
                    en: textEn,
                    ...(textZh ? { zh: textZh } : {}),
                    ...(textVi ? { vi: textVi } : {}),
                    ...(textBn ? { bn: textBn } : {}),
                },
                isActive: formData.isActive,
                order: formData.order,
            };

            if (formData.startDate) {
                dataToSend.startDate = new Date(formData.startDate);
            }
            if (formData.endDate) {
                dataToSend.endDate = new Date(formData.endDate);
            }

            await marqueeService.createMarquee(dataToSend);
            closeModal();
            fetchMarquees();
        } catch (error) {
            console.error("Failed to create marquee", error);
            alert("Failed to create marquee");
        }
    };

    // Update marquee
    const handleUpdate = async () => {
        if (!editingMarquee) return;
        if (!validateForm()) return;

        try {
            const textEn = formData.textEn.trim();
            const textZh = formData.textZh.trim();
            const textVi = formData.textVi.trim();
            const textBn = formData.textBn.trim();
            const dataToSend: any = {
                text: textEn,
                textTranslations: {
                    en: textEn,
                    ...(textZh ? { zh: textZh } : {}),
                    ...(textVi ? { vi: textVi } : {}),
                    ...(textBn ? { bn: textBn } : {}),
                },
                isActive: formData.isActive,
                order: formData.order,
            };

            if (formData.startDate) {
                dataToSend.startDate = new Date(formData.startDate);
            } else {
                dataToSend.startDate = null;
            }
            
            if (formData.endDate) {
                dataToSend.endDate = new Date(formData.endDate);
            } else {
                dataToSend.endDate = null;
            }

            await marqueeService.updateMarquee(editingMarquee._id, dataToSend);
            closeModal();
            fetchMarquees();
        } catch (error) {
            console.error("Failed to update marquee", error);
            alert("Failed to update marquee");
        }
    };

    // Delete marquee
    const handleDelete = async (id: string, text: string) => {
        if (!confirm(`Are you sure you want to delete "${text}"?`)) return;

        try {
            await marqueeService.deleteMarquee(id);
            fetchMarquees();
        } catch (error) {
            console.error("Failed to delete marquee", error);
            alert("Failed to delete marquee");
        }
    };

    // Toggle active status
    const toggleActive = async (id: string, current: boolean) => {
        try {
            await marqueeService.updateMarquee(id, {
                isActive: !current,
            });
            fetchMarquees();
        } catch (error) {
            console.error("Failed to toggle marquee status", error);
        }
    };

    // Move order up/down
    const moveOrder = async (id: string, direction: 'up' | 'down') => {
        const currentIndex = marquees.findIndex(m => m._id === id);
        if (direction === 'up' && currentIndex === 0) return;
        if (direction === 'down' && currentIndex === marquees.length - 1) return;

        const newMarquees = [...marquees];
        const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        // Swap orders
        const tempOrder = newMarquees[currentIndex].order;
        newMarquees[currentIndex].order = newMarquees[swapIndex].order;
        newMarquees[swapIndex].order = tempOrder;

        try {
            // Update both marquees
            await marqueeService.updateMarquee(newMarquees[currentIndex]._id, {
                order: newMarquees[currentIndex].order
            });
            await marqueeService.updateMarquee(newMarquees[swapIndex]._id, {
                order: newMarquees[swapIndex].order
            });
            
            setMarquees(newMarquees.sort((a, b) => a.order - b.order));
        } catch (error) {
            console.error("Failed to reorder marquees", error);
            fetchMarquees(); // Refresh to correct state
        }
    };

    // Filter marquees
    const filteredMarquees = marquees
        .filter(m => {
            const query = searchTerm.toLowerCase();
            const localizedPool = [
                m.text,
                m.textTranslations?.en,
                m.textTranslations?.zh,
                m.textTranslations?.vi,
                m.textTranslations?.bn,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return localizedPool.includes(query);
        })
        .filter(m => {
            if (filterStatus === 'all') return true;
            return filterStatus === 'active' ? m.isActive : !m.isActive;
        })
        .sort((a, b) => a.order - b.order);

    // Statistics
    const totalMarquees = marquees.length;
    const activeMarquees = marquees.filter(m => m.isActive).length;
    const inactiveMarquees = totalMarquees - activeMarquees;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Menu className="w-8 h-8 text-yellow-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-gray-400 mt-4">Loading marquees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
            <div className=" mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            Marquee Management
                        </h1>
                        <p className="text-gray-400 mt-1 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Manage your scrolling announcement marquees
                        </p>
                    </div>
                    
                    <button
                        onClick={openCreateModal}
                        className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all flex items-center gap-2 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span>Add New Marquee</span>
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Marquees</p>
                                <p className="text-3xl font-bold text-white mt-1">{totalMarquees}</p>
                            </div>
                            <div className="p-4 bg-yellow-500/10 rounded-2xl group-hover:bg-yellow-500/20 transition-all">
                                <Menu className="w-8 h-8 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Active Marquees</p>
                                <p className="text-3xl font-bold text-white mt-1">{activeMarquees}</p>
                            </div>
                            <div className="p-4 bg-green-500/10 rounded-2xl group-hover:bg-green-500/20 transition-all">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Inactive Marquees</p>
                                <p className="text-3xl font-bold text-white mt-1">{inactiveMarquees}</p>
                            </div>
                            <div className="p-4 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-all">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search marquees by text..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                            />
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>

                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterStatus("all");
                                }}
                                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:border-yellow-500/50 transition-colors"
                                title="Clear filters"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Marquee List */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-5 bg-gray-800/50 border-b border-gray-700/50 text-sm font-medium text-gray-400">
                        <div className="col-span-1 flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            <span>Order</span>
                        </div>
                        <div className="col-span-5 flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            <span>Text</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            <span>Status</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            <span>Date Range</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            <span>Actions</span>
                        </div>
                    </div>

                    {/* Table Body */}
                    {filteredMarquees.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Menu className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Marquees Found</h3>
                            <p className="text-gray-400 mb-6">
                                {searchTerm || filterStatus !== 'all' 
                                    ? "No marquees match your search criteria. Try adjusting your filters."
                                    : "Get started by creating your first marquee."}
                            </p>
                            {(searchTerm || filterStatus !== 'all') ? (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterStatus("all");
                                    }}
                                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all inline-flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </button>
                            ) : (
                                <button
                                    onClick={openCreateModal}
                                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all inline-flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create First Marquee
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredMarquees.map((marquee) => (
                            <div
                                key={marquee._id}
                                className="grid grid-cols-12 gap-4 p-5 border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors group"
                            >
                                <div className="col-span-1 text-white flex items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm font-medium border border-gray-700">
                                            {marquee.order}
                                        </span>
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => moveOrder(marquee._id, 'up')}
                                                className="text-gray-500 hover:text-yellow-500 disabled:text-gray-700 disabled:hover:text-gray-700 transition-colors"
                                                disabled={marquee.order === 1}
                                                title="Move up"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                onClick={() => moveOrder(marquee._id, 'down')}
                                                className="text-gray-500 hover:text-yellow-500 disabled:text-gray-700 disabled:hover:text-gray-700 transition-colors"
                                                disabled={marquee.order === filteredMarquees.length}
                                                title="Move down"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-span-5 text-white">
                                    <p className="truncate font-medium" title={marquee.text}>
                                        {marquee.text}
                                    </p>
                                </div>
                                
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                        marquee.isActive 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                        {marquee.isActive ? (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3.5 h-3.5" />
                                                Inactive
                                            </>
                                        )}
                                    </span>
                                </div>
                                
                                <div className="col-span-2 text-white text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                        <span>
                                            {marquee.startDate 
                                                ? new Date(marquee.startDate).toLocaleDateString() 
                                                : 'No start'}
                                        </span>
                                    </div>
                                    {marquee.endDate && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                                            <span>
                                                {new Date(marquee.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="col-span-2 flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(marquee._id, marquee.isActive)}
                                        className={`p-2 rounded-lg transition-all ${
                                            marquee.isActive 
                                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30' 
                                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                                        }`}
                                        title={marquee.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {marquee.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    
                                    <button
                                        onClick={() => openEditModal(marquee)}
                                        className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all border border-blue-500/30"
                                        title="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDelete(marquee._id, marquee.text)}
                                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all border border-red-500/30"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800/90 rounded-2xl max-w-lg w-full border border-gray-700/50 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                                    {editingMarquee ? <Pencil className="w-5 h-5 text-yellow-500" /> : <Plus className="w-5 h-5 text-yellow-500" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {editingMarquee ? 'Edit Marquee' : 'Create New Marquee'}
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        {editingMarquee ? 'Update marquee information' : 'Add a new scrolling marquee'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Text (multi-language) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Marquee Text (English) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <textarea
                                        name="textEn"
                                        value={formData.textEn}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('textEn')}
                                        rows={3}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border ${
                                            touched.textEn && errors.textEn
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-gray-700 focus:border-yellow-500/50'
                                        } text-white placeholder-gray-500 focus:outline-none transition-colors resize-none`}
                                        placeholder="Enter marquee text in English..."
                                    />
                                </div>
                                {touched.textEn && errors.textEn && (
                                    <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.textEn}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400">Chinese (ZH)</label>
                                    <textarea
                                        name="textZh"
                                        value={formData.textZh}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
                                        placeholder="Optional Chinese text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400">Vietnamese (VI)</label>
                                    <textarea
                                        name="textVi"
                                        value={formData.textVi}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
                                        placeholder="Optional Vietnamese text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-400">Bangla (BN)</label>
                                    <textarea
                                        name="textBn"
                                        value={formData.textBn}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
                                        placeholder="Optional Bangla text"
                                    />
                                </div>
                            </div>

                            {/* Order */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Display Order
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Lower numbers appear first</p>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                                        formData.isActive ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                            formData.isActive ? 'translate-x-8' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                                <div>
                                    <p className="text-white font-medium">
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formData.isActive 
                                            ? 'Marquee will be displayed on the site' 
                                            : 'Marquee is hidden from view'}
                                    </p>
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-gray-300">Schedule (Optional)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400">
                                            Start Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                className="w-full pl-9 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400">
                                            End Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                className="w-full pl-9 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {errors.endDate && (
                                    <p className="text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.endDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-700/50">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all flex items-center gap-2"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                onClick={editingMarquee ? handleUpdate : handleCreate}
                                className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all flex items-center gap-2"
                            >
                                <Save size={16} />
                                {editingMarquee ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarqueeAdmin;