// app/(dashboard)/slider/edit-type/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { SliderTypeData, sliderTypeService } from "@/services/api/slider.types";
import { uploadImageToImageBB } from "@/lib/imageUpload";
import toast from "react-hot-toast";
import { oracleService } from "@/services/api/oracel.service";
import {
    ArrowLeft,
    Upload,
    Link2,
    Save,
    RefreshCw,
    X,
    Check,
    AlertCircle,
    Image as ImageIcon,
    Type,
    FileText,
    Eye,
    EyeOff,
    Trash2,
    Camera,
    Globe,
    FolderOpen
} from "lucide-react";

type OracleProvider = {
    _id: string;
    providerCode: string;
    providerName: string;
    gameType: string;
};

type OracleProviderResponse = {
    success: boolean;
    count: number;
    data: OracleProvider[];
};

const sliderTypeToGameTypeMap: Record<string, string[]> = {
    hot: ["SLOT", "CASINO", "FISHING"],
    "recent-views": [],
    "slot-game": ["SLOT"],
    live: ["CASINO"],
    "fishing-game": ["FISHING"],
    lottory: ["LOTTERY"],
    sport: ["SPORTS"],
    "table-game": ["CASINO"],
    promotion: []
};

export default function EditSliderTypePage() {
    const router = useRouter();
    const params = useParams();
    const typeId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
    const [iconPreview, setIconPreview] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [providers, setProviders] = useState<OracleProvider[]>([]);
    const [existingProviders, setExistingProviders] = useState<OracleProvider[]>([]);
    const [selectedProviderCodes, setSelectedProviderCodes] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        iconUrl: "",
        isActive: true
    });

    const selectedSliderType = formData.name;
    const shouldMatchProviders = selectedSliderType !== "home" && selectedSliderType !== "hero";

    const mergedProviders = (() => {
        const map = new Map<string, OracleProvider>();
        providers.forEach((provider) => map.set(provider.providerCode, provider));
        existingProviders.forEach((provider) => {
            if (!map.has(provider.providerCode)) {
                map.set(provider.providerCode, provider);
            }
        });
        return Array.from(map.values());
    })();

    const matchedProviders = shouldMatchProviders
        ? mergedProviders.filter((provider) => {
            const gameTypes = sliderTypeToGameTypeMap[selectedSliderType] || [];
            if (!gameTypes.length) return false;

            const providerTypes = provider.gameType
                .split(",")
                .map((type) => type.trim().toUpperCase());

            return gameTypes.some((type) => providerTypes.includes(type));
        })
        : [];

    const providerSelectionPool = shouldMatchProviders
        ? (() => {
            const gameTypes = sliderTypeToGameTypeMap[selectedSliderType] || [];
            if (!gameTypes.length) return mergedProviders;

            const selectedFromMerged = mergedProviders.filter((provider) =>
                selectedProviderCodes.includes(provider.providerCode)
            );

            const map = new Map<string, OracleProvider>();
            matchedProviders.forEach((provider) => map.set(provider.providerCode, provider));
            selectedFromMerged.forEach((provider) => map.set(provider.providerCode, provider));
            return Array.from(map.values());
        })()
        : [];

    const toggleProviderSelection = (providerCode: string) => {
        setSelectedProviderCodes((prev) =>
            prev.includes(providerCode)
                ? prev.filter((code) => code !== providerCode)
                : [...prev, providerCode]
        );
    };

    const selectAllProviders = () => {
        setSelectedProviderCodes(providerSelectionPool.map((provider) => provider.providerCode));
    };

    const clearSelectedProviders = () => {
        setSelectedProviderCodes([]);
    };

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const response = await oracleService.getProviders() as OracleProviderResponse;
                setProviders(response?.data || []);
            } catch (error) {
                console.error("Failed to fetch providers:", error);
            }
        };

        const fetchType = async () => {
            try {
                const res = await sliderTypeService.getSliderTypeById(typeId);
                const type = res.data;
                setFormData({
                    name: type.name || "",
                    description: type.description || "",
                    iconUrl: type.iconUrl || "",
                    isActive: type.isActive ?? true
                });
                setSelectedProviderCodes(
                    (type.providerCode || "")
                        .split(",")
                        .map((code: string) => code.trim())
                        .filter(Boolean)
                );

                const providerCodes = (type.providerCode || "")
                    .split(",")
                    .map((code: string) => code.trim())
                    .filter(Boolean);
                const providerNames = (type.providerName || "")
                    .split(",")
                    .map((name: string) => name.trim());

                setExistingProviders(
                    providerCodes.map((code: string, index: number) => ({
                        _id: `existing-${code}`,
                        providerCode: code,
                        providerName: providerNames[index] || code,
                        gameType: ""
                    }))
                );

                if (type.iconUrl) {
                    setIconPreview(type.iconUrl);
                }
            } catch (error) {
                toast.error("Failed to fetch slider type");
                router.push("/slider");
            } finally {
                setFetching(false);
            }
        };

        fetchProviders();
        fetchType();
    }, [typeId, router]);

    const validateField = (name: string, value: string) => {
        if (name === 'name' && !value.trim()) {
            return 'Name is required';
        }
        if (name === 'iconUrl' && uploadMethod === 'url' && value && !isValidUrl(value)) {
            return 'Please enter a valid URL';
        }
        return '';
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Validate on change
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field as keyof typeof formData] as string);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleIconUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        try {
            setLoading(true);
            const url = await uploadImageToImageBB(file);
            setFormData(prev => ({ ...prev, iconUrl: url }));
            setIconPreview(url);
            setErrors(prev => ({ ...prev, iconUrl: '' }));
            toast.success('Icon uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload icon');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            handleIconUpload(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (uploadMethod === 'url' && formData.iconUrl && !isValidUrl(formData.iconUrl)) {
            newErrors.iconUrl = 'Please enter a valid URL';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({ name: true, iconUrl: true });
            toast.error('Please fix the errors before submitting');
            return;
        }

        if (shouldMatchProviders && providerSelectionPool.length > 0 && selectedProviderCodes.length === 0) {
            toast.error('Please select at least one provider');
            return;
        }

        try {
            setLoading(true);
            const selectedProviders = mergedProviders.filter((provider) =>
                selectedProviderCodes.includes(provider.providerCode)
            );

            const uniqueGameTypes = Array.from(
                new Set(
                    selectedProviders.flatMap((provider) =>
                        provider.gameType
                            .split(",")
                            .map((type) => type.trim().toUpperCase())
                            .filter(Boolean)
                    )
                )
            );

            const payload: Partial<SliderTypeData> = {
                description: formData.description,
                iconUrl: formData.iconUrl,
                isActive: formData.isActive,
                gameType: uniqueGameTypes.length ? uniqueGameTypes.join(",") : undefined,
                providerCode: selectedProviders.length
                    ? selectedProviders.map((provider) => provider.providerCode).join(",")
                    : undefined,
                providerName: selectedProviders.length
                    ? selectedProviders.map((provider) => provider.providerName).join(",")
                    : undefined
            };

            await sliderTypeService.updateSliderType(typeId, payload);
            toast.success('Slider type updated successfully!');
            router.push('/admin/slider-controll');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update slider type');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.push('/admin/slider-controll');
        }
    };

    const clearIcon = () => {
        setFormData(prev => ({ ...prev, iconUrl: '' }));
        setIconPreview('');
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FolderOpen className="w-8 h-8 text-yellow-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-gray-400 mt-4">Loading slider type...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 p-6">
            <div className=" mx-auto">
                {/* Header with breadcrumb */}
                <div className="mb-8">
                    <Link
                        href="/slider"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group mb-4"
                    >
                        <div className="p-1.5 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span>Back to Slider Management</span>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                            {iconPreview ? (
                                <img src={iconPreview} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                                <FolderOpen className="w-7 h-7 text-yellow-500" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Edit Slider Type
                            </h1>
                            <p className="text-gray-400 mt-1 flex items-center gap-2">
                                <Type className="w-4 h-4" />
                                Update your slider type information
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Form */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                        {/* Form Header */}
                        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-yellow-500" />
                                Basic Information
                            </h2>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        readOnly
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/40 border ${
                                            touched.name && errors.name
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-gray-700 focus:border-yellow-500/50'
                                        } text-gray-300 placeholder-gray-500 focus:outline-none transition-colors cursor-not-allowed`}
                                        placeholder="Enter slider type name (e.g., Homepage Banner)"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Name is locked and cannot be changed.</p>
                            </div>

                            {selectedSliderType && shouldMatchProviders && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Providers
                                        </label>
                                        <span className="text-xs px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                            {selectedProviderCodes.length}/{providerSelectionPool.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={selectAllProviders}
                                            className="text-xs px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearSelectedProviders}
                                            className="text-xs px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>

                                    {providerSelectionPool.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-2 max-h-44 overflow-auto pr-1 rounded-xl border border-gray-700 bg-gray-900/40 p-3">
                                            {providerSelectionPool.map((provider) => {
                                                const isSelected = selectedProviderCodes.includes(provider.providerCode);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={provider._id}
                                                        onClick={() => toggleProviderSelection(provider.providerCode)}
                                                        className={`text-xs px-2 py-1 rounded-md border transition-colors ${isSelected
                                                            ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                                                            : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        {provider.providerName}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">
                                            No provider matches this slider type.
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedSliderType && !shouldMatchProviders && (
                                <div className="mt-1 rounded-xl border border-gray-700 bg-gray-900/40 p-3">
                                    <p className="text-xs text-gray-400">
                                        Provider matching is not required for Home and Hero.
                                    </p>
                                </div>
                            )}

                            {/* Description Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Description <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
                                    placeholder="Enter a description for this slider type (e.g., Main homepage banners that appear in the hero section)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.description.length}/500 characters
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Icon Upload Card */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-yellow-500" />
                                Icon / Thumbnail
                            </h2>
                        </div>

                        <div className="p-6">
                            {/* Upload Method Toggle */}
                            <div className="flex gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setUploadMethod("file")}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                                        uploadMethod === "file"
                                            ? "bg-linear-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/25"
                                            : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700"
                                    }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload File</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMethod("url")}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                                        uploadMethod === "url"
                                            ? "bg-linear-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/25"
                                            : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700"
                                    }`}
                                >
                                    <Globe className="w-4 h-4" />
                                    <span>Image URL</span>
                                </button>
                            </div>

                            {/* Upload Input */}
                            {uploadMethod === "file" ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="icon-upload"
                                        />
                                        <label
                                            htmlFor="icon-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-700 hover:border-yellow-500/50 transition-colors cursor-pointer bg-gray-900/30 hover:bg-gray-900/50"
                                        >
                                            <Camera className="w-8 h-8 text-gray-500 mb-2" />
                                            <span className="text-sm text-gray-400">
                                                Click to upload or drag and drop
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                PNG, JPG, GIF up to 5MB
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="url"
                                            name="iconUrl"
                                            value={formData.iconUrl}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('iconUrl')}
                                            className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-900/50 border ${
                                                touched.iconUrl && errors.iconUrl
                                                    ? 'border-red-500/50 focus:border-red-500'
                                                    : 'border-gray-700 focus:border-yellow-500/50'
                                            } text-white placeholder-gray-500 focus:outline-none transition-colors`}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {formData.iconUrl && (
                                            <button
                                                type="button"
                                                onClick={clearIcon}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {touched.iconUrl && errors.iconUrl && (
                                        <p className="text-sm text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.iconUrl}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Preview */}
                            {iconPreview && (
                                <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                    <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-700 bg-gray-800">
                                            <img
                                                src={iconPreview}
                                                alt="Icon preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Current icon</p>
                                            <p className="text-sm text-white truncate">{formData.iconUrl || 'Uploaded image'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearIcon}
                                            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                            title="Remove icon"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-yellow-500" />
                                Status
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Active Status</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {formData.isActive 
                                            ? 'This slider type is visible and can be used'
                                            : 'This slider type is hidden from the application'
                                        }
                                    </p>
                                </div>
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
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading || Object.keys(errors).length > 0}
                            className="flex-1 py-3 px-6 bg-linear-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Update Slider Type</span>
                                </>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            <span>Cancel</span>
                        </button>
                    </div>
                </form>

                {/* Help Section */}
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-400">About Slider Types</h3>
                            <p className="text-xs text-blue-300/70 mt-1">
                                Slider types help organize your sliders into categories. Each type can contain multiple sliders.
                                The icon will be displayed in the slider management interface for easy identification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}