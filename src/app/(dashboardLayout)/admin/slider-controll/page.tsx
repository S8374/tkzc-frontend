// app/(dashboard)/slider/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sliderTypeService } from "@/services/api/slider.types";
import { sliderService } from "@/services/api/slider.service";
import { oracleService } from "@/services/api/oracel.service";
import toast from "react-hot-toast";
import {
    LayoutGrid,
    Image as ImageIcon,
    Activity,
    Plus,
    Trash2,
    Edit3,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    FolderOpen,
    Settings,
    Calendar,
    Clock,
    Tag,
    Link2,
    Layers,
    Grid,
    List,
    RefreshCw,
    Download,
    Upload,
    Filter,
    Search,
    X,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    Copy,
    Star,
    StarOff,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Grid3x3,
    PanelTop,
    PanelBottom,
    PanelLeft,
    PanelRight,
    PanelTopClose,
    PanelBottomClose,
    PanelLeftClose,
    PanelRightClose
} from "lucide-react";

interface Slider {
    _id: string;
    title?: string;
    subtitle?: string;
    image?: string;
    buttonText?: string;
    buttonLink?: string;
    provider_code?: string;
    game_code?: string;
    game_type?: string;
    order: number;
    isActive: boolean;
    createdAt?: string;
}

interface SliderType {
    _id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    isActive: boolean;
    sliders?: Slider[];
}

const SliderManagementPage = () => {
    const [typesWithSliders, setTypesWithSliders] = useState<SliderType[]>([]);
    const [gameImageMap, setGameImageMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'sliders'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await sliderTypeService.getSliderTypeWithSliders();
            const types = res.data || [];
            setTypesWithSliders(types);
            await preloadGameImages(types);
            
            // Auto-expand first type if exists
            if (types.length > 0) {
                setExpandedTypes(new Set([types[0]._id]));
            }
        } catch (error) {
            toast.error("Failed to fetch slider data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const preloadGameImages = async (types: SliderType[]) => {
        const sliders = types.flatMap((type) => type.sliders || []);
        const providerCodes = Array.from(
            new Set(
                sliders
                    .filter((slider) => !slider.image && slider.provider_code && slider.game_code)
                    .map((slider) => slider.provider_code as string)
            )
        );

        if (!providerCodes.length) {
            setGameImageMap({});
            return;
        }

        try {
            const detailsList = await Promise.all(
                providerCodes.map((providerCode) => oracleService.getProviderDetails(providerCode))
            );

            const nextMap: Record<string, string> = {};
            detailsList.forEach((details: any) => {
                const games = details?.games || [];
                games.forEach((game: any) => {
                    if (game?.provider_code && game?.game_code && game?.image) {
                        nextMap[`${game.provider_code}:${game.game_code}`] = game.image;
                    }
                });
            });

            setGameImageMap(nextMap);
        } catch {
            setGameImageMap({});
        }
    };

    const getSliderImage = (slider: Slider) => {
        if (slider.image) return slider.image;
        if (!slider.provider_code || !slider.game_code) return "https://via.placeholder.com/800x400?text=No+Image";
        return gameImageMap[`${slider.provider_code}:${slider.game_code}`] || "https://via.placeholder.com/800x400?text=No+Image";
    };

    const toggleType = (typeId: string) => {
        const newExpanded = new Set(expandedTypes);
        if (newExpanded.has(typeId)) {
            newExpanded.delete(typeId);
        } else {
            newExpanded.add(typeId);
        }
        setExpandedTypes(newExpanded);
    };

    const expandAll = () => {
        const allIds = typesWithSliders.map(t => t._id);
        setExpandedTypes(new Set(allIds));
    };

    const collapseAll = () => {
        setExpandedTypes(new Set());
    };

    const handleDeleteSlider = async (sliderId: string, sliderTitle: string) => {
        if (!confirm(`Are you sure you want to delete "${sliderTitle}"?`)) return;

        try {
            await sliderService.deleteSlider(sliderId);
            toast.success("Slider deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete slider");
        }
    };

    const handleDeleteType = async (typeId: string, typeName: string) => {
        if (!confirm(`Are you sure you want to delete "${typeName}"? All associated sliders will also be deleted.`)) return;

        try {
            await sliderTypeService.deleteSliderType(typeId);
            toast.success("Slider type deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete slider type");
        }
    };

    const toggleSliderStatus = async (sliderId: string, currentStatus: boolean, sliderTitle: string) => {
        try {
            await sliderService.updateSlider(sliderId, { ...{}, isActive: !currentStatus } as any);
            toast.success(`"${sliderTitle}" ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchData();
        } catch (error) {
            toast.error("Failed to update slider status");
        }
    };

    const toggleTypeStatus = async (typeId: string, currentStatus: boolean, typeName: string) => {
        try {
            await sliderTypeService.updateSliderType(typeId, { isActive: !currentStatus });
            toast.success(`"${typeName}" ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchData();
        } catch (error) {
            toast.error("Failed to update slider type status");
        }
    };

    const duplicateSlider = async (slider: Slider) => {
        try {
            const { _id, ...sliderData } = slider;
            await sliderService.createSlider({
                ...sliderData,
                title: `${slider.title || slider.game_code || "Untitled Slider"} (Copy)`,
                sliderTypeId: "",
                imageRedirectLink: ""
            });
            toast.success("Slider duplicated successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to duplicate slider");
        }
    };

    // Filter and sort types
    const filteredTypes = typesWithSliders
        .filter(type => {
            if (filterStatus === 'all') return true;
            return filterStatus === 'active' ? type.isActive : !type.isActive;
        })
        .filter(type => 
            type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') {
                return sortOrder === 'asc' 
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            if (sortBy === 'sliders') {
                return sortOrder === 'asc'
                    ? (a.sliders?.length || 0) - (b.sliders?.length || 0)
                    : (b.sliders?.length || 0) - (a.sliders?.length || 0);
            }
            return 0;
        });

    // Calculate statistics
    const totalTypes = typesWithSliders.length;
    const totalSliders = typesWithSliders.reduce((acc, type) => acc + (type.sliders?.length || 0), 0);
    const activeSliders = typesWithSliders.reduce((acc, type) => 
        acc + (type.sliders?.filter(s => s.isActive).length || 0), 0
    );
    const activeTypes = typesWithSliders.filter(t => t.isActive).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                     
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 p-6">
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            Slider Management And Game Library
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Manage your slider types and their content
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="p-3 bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-yellow-500 rounded-xl transition-all border border-gray-700/50"
                        >
                            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                        </button>
                        
                        <Link
                            href="/admin/add-slider-type"
                            className="px-5 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl transition-all border border-gray-700/50 flex items-center gap-2 group"
                        >
                            <FolderOpen className="w-5 h-5 group-hover:text-yellow-500" />
                            <span>New Type</span>
                        </Link>
                        
                        <Link
                            href="/admin/sliders"
                            className="px-5 py-3 bg-linear-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all flex items-center gap-2 group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            <span>New Slider</span>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Types</p>
                                <p className="text-3xl font-bold text-white mt-1">{totalTypes}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    <span className="text-green-400">{activeTypes}</span> active
                                </p>
                            </div>
                            <div className="p-4 bg-yellow-500/10 rounded-2xl group-hover:bg-yellow-500/20 transition-all">
                                <LayoutGrid className="w-8 h-8 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Sliders</p>
                                <p className="text-3xl font-bold text-white mt-1">{totalSliders}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    <span className="text-green-400">{activeSliders}</span> active
                                </p>
                            </div>
                            <div className="p-4 bg-green-500/10 rounded-2xl group-hover:bg-green-500/20 transition-all">
                                <ImageIcon className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Active Rate</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {totalSliders ? Math.round((activeSliders / totalSliders) * 100) : 0}%
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {activeSliders} of {totalSliders} active
                                </p>
                            </div>
                            <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-all">
                                <Activity className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Avg per Type</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {totalTypes ? (totalSliders / totalTypes).toFixed(1) : 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    sliders per type
                                </p>
                            </div>
                            <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-all">
                                <Layers className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search types by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
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

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="sliders">Sort by Sliders</option>
                                <option value="date">Sort by Date</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:border-yellow-500/50 transition-colors"
                            >
                                {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={expandAll}
                                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:border-yellow-500/50 transition-colors text-sm"
                            >
                                Expand All
                            </button>

                            <button
                                onClick={collapseAll}
                                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:border-yellow-500/50 transition-colors text-sm"
                            >
                                Collapse All
                            </button>

                            <button
                                onClick={fetchData}
                                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:border-yellow-500/50 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Slider Types with Sliders */}
                <div className="space-y-4">
                    {filteredTypes.length === 0 ? (
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-16 text-center">
                            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Layers className="w-12 h-12 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-3">No Slider Types Found</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                {searchTerm || filterStatus !== 'all' 
                                    ? "No types match your search criteria. Try adjusting your filters."
                                    : "Get started by creating your first slider type to organize your sliders."}
                            </p>
                            {(searchTerm || filterStatus !== 'all') ? (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                    }}
                                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all inline-flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </button>
                            ) : (
                                <Link
                                    href="/admin/add-slider-type"
                                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all inline-flex items-center gap-2 group"
                                >
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    Create First Slider Type
                                </Link>
                            )}
                        </div>
                    ) : (
                        filteredTypes.map((type) => (
                            <div
                                key={type._id}
                                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-yellow-500/50 transition-all group"
                            >
                                {/* Type Header */}
                                <div className="p-5 flex items-center gap-4 bg-gray-800/50">
                                    <button
                                        onClick={() => toggleType(type._id)}
                                        className="text-gray-500 hover:text-yellow-500 transition-colors"
                                    >
                                        {expandedTypes.has(type._id) 
                                            ? <ChevronDown className="w-5 h-5" />
                                            : <ChevronRight className="w-5 h-5" />
                                        }
                                    </button>

                                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                                        {type.iconUrl ? (
                                            <img src={type.iconUrl} alt={type.name} className="w-8 h-8 rounded object-cover" />
                                        ) : (
                                            <FolderOpen className="w-6 h-6 text-yellow-500" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-white">{type.name}</h3>
                                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                                type.isActive
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                                {type.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {type.description && (
                                            <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1.5 bg-gray-900/50 rounded-xl border border-gray-700">
                                            <span className="text-sm text-gray-400">Sliders: </span>
                                            <span className="text-lg font-semibold text-white ml-1">
                                                {type.sliders?.length || 0}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => toggleTypeStatus(type._id, type.isActive, type.name)}
                                            className={`p-2.5 rounded-xl transition-all ${
                                                type.isActive
                                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                            title={type.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {type.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>

                                        <Link
                                            href={`/admin/add-slider-type/${type._id}`}
                                            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-yellow-500 rounded-xl transition-all"
                                            title="Edit Type"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Link>

                                        <button
                                            onClick={() => handleDeleteType(type._id, type.name)}
                                            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                                            title="Delete Type"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Sliders List */}
                                {expandedTypes.has(type._id) && (
                                    <div className="p-5 border-t border-gray-700/50">
                                        {type.sliders?.length === 0 ? (
                                            <div className="text-center py-12">
                                                <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-400">No sliders in this type</p>
                                                <Link
                                                    href="/admin/sliders"
                                                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all text-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add your first slider
                                                </Link>
                                            </div>
                                        ) : viewMode === 'grid' ? (
                                            // Grid View
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {type.sliders?.map((slider, index) => (
                                                    <div
                                                        key={slider._id}
                                                        className="bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-yellow-500/50 transition-all group/slider"
                                                    >
                                                        <div className="relative h-40">
                                                            <img
                                                                src={getSliderImage(slider)}
                                                                alt={slider.title || slider.game_code || "Slider image"}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                                                            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gray-900/90 border border-gray-700 flex items-center justify-center text-sm font-medium text-white">
                                                                {slider.order || index + 1}
                                                            </div>
                                                            <div className="absolute top-2 right-2">
                                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                                    slider.isActive
                                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                                }`}>
                                                                    {slider.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="p-4">
                                                            <h4 className="font-semibold text-white mb-1">{slider.title || slider.game_code || "Untitled Slider"}</h4>
                                                            {slider.subtitle && (
                                                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{slider.subtitle}</p>
                                                            )}
                                                            
                                                            {slider.buttonText && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                                                    <Link2 className="w-3 h-3" />
                                                                    <span>{slider.buttonText} →</span>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                                                                <button
                                                                    onClick={() => duplicateSlider(slider)}
                                                                    className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-blue-500 rounded-lg transition-all"
                                                                    title="Duplicate"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                </button>
                                                                
                                                                <button
                                                                    onClick={() => toggleSliderStatus(slider._id, slider.isActive, slider.title || slider.game_code || "Untitled Slider")}
                                                                    className={`p-1.5 rounded-lg transition-all ${
                                                                        slider.isActive
                                                                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                                    }`}
                                                                    title={slider.isActive ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {slider.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                                </button>

                                                                <Link
                                                                    href={`/admin/sliders/${slider._id}`}
                                                                    className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-yellow-500 rounded-lg transition-all"
                                                                    title="Edit"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </Link>

                                                                <button
                                                                    onClick={() => handleDeleteSlider(slider._id, slider.title || slider.game_code || "Untitled Slider")}
                                                                    className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            // List View
                                            <div className="space-y-3">
                                                {type.sliders?.map((slider, index) => (
                                                    <div
                                                        key={slider._id}
                                                        className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-all border border-gray-800/50 hover:border-yellow-500/50 group/slider"
                                                    >
                                                        {/* Order Badge */}
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-sm font-bold text-white border border-yellow-500/30">
                                                            {slider.order || index + 1}
                                                        </div>

                                                        {/* Image */}
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                                                            <img
                                                                src={getSliderImage(slider)}
                                                                alt={slider.title || slider.game_code || "Slider image"}
                                                                className="w-full h-full object-cover group-hover/slider:scale-110 transition-transform duration-300"
                                                            />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-medium text-white truncate">{slider.title || slider.game_code || "Untitled Slider"}</h4>
                                                                
                                                            </div>
                                                            
                                                            {slider.subtitle && (
                                                                <p className="text-sm text-gray-400 truncate">{slider.subtitle}</p>
                                                            )}
                                                            
                                                            {slider.buttonText && (
                                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                    <Link2 className="w-3 h-3" />
                                                                    {slider.buttonText} → {slider.buttonLink}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => duplicateSlider(slider)}
                                                                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-blue-500 rounded-lg transition-all"
                                                                title="Duplicate"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                onClick={() => toggleSliderStatus(slider._id, slider.isActive, slider.title || slider.game_code || "Untitled Slider")}
                                                                className={`p-2 rounded-lg transition-all ${
                                                                    slider.isActive
                                                                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                                }`}
                                                                title={slider.isActive ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {slider.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                            </button>

                                                            <Link
                                                                href={`/admin/sliders/${slider._id}`}
                                                                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-yellow-500 rounded-lg transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Link>

                                                            <button
                                                                onClick={() => handleDeleteSlider(slider._id, slider.title || slider.game_code || "Untitled Slider")}
                                                                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SliderManagementPage;