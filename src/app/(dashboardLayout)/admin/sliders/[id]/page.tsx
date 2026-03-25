/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/slider/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { sliderService } from "@/services/api/slider.service";
import { sliderTypeService } from "@/services/api/slider.types";
import { uploadImageToImageBB } from "@/lib/imageUpload";
import {
    ArrowLeft,
    Link2,
    Upload,
    Type,
    FileText,
    Image as ImageIcon,
    Eye,
    Check,
    AlertCircle,
    X,
    Camera,
    Globe,
    Save,
    RefreshCw,
    Layers,
    Hash,
    ExternalLink,
    MessageSquare,
    Heading1,
    Heading2,
    Move,
    Edit3,
    BluetoothConnectedIcon
} from "lucide-react";

export default function EditSliderPage() {
    const router = useRouter();
    const params = useParams();
    const sliderId = params.id as string;

    const [sliderTypes, setSliderTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
    const [imagePreview, setImagePreview] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        image: "",
        sliderTypeId: "",
        buttonText: "",
        buttonLink: "",
        imageRedirectLink: "",
        order: 0,
        isActive: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch types and slider in parallel
                const [typesRes, sliderRes] = await Promise.all([
                    sliderTypeService.getAllSliderTypes(),
                    sliderService.getSliderById(sliderId)
                ]);

                setSliderTypes(typesRes.data || []);
                
                const slider = sliderRes.data;
                setFormData({
                    title: slider.title || "",
                    subtitle: slider.subtitle || "",
                    description: slider.description || "",
                    image: slider.image || "",
                    sliderTypeId: slider.sliderTypeId || "",
                    buttonText: slider.buttonText || "",
                    buttonLink: slider.buttonLink || "",
                    imageRedirectLink: slider.imageRedirectLink || "",
                    order: slider.order || 0,
                    isActive: slider.isActive ?? true
                });
                
                if (slider.image) {
                    setImagePreview(slider.image);
                }
            } catch (error) {
                toast.error("Failed to fetch slider data");
                router.push("/slider");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [sliderId, router]);

    const validateField = (name: string, value: any) => {
        switch (name) {
            case 'title':
                return !value ? 'Title is required' : '';
            case 'image':
                return !value ? 'Image is required' : '';
            case 'sliderTypeId':
                return !value ? 'Please select a slider type' : '';
            case 'imageRedirectLink':
                return !value ? 'Image redirect link is required' : '';
            case 'buttonLink':
                if (value && !isValidUrl(value) && !value.startsWith('/')) {
                    return 'Please enter a valid URL or path (e.g., /products)';
                }
                return '';
            default:
                return '';
        }
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === "number" ? parseInt(value) || 0 : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: parsedValue
        }));

        const error = validateField(name, parsedValue);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field as keyof typeof formData]);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleImageUpload = async (file: File) => {
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
            setFormData(prev => ({ ...prev, image: url }));
            setImagePreview(url);
            setErrors(prev => ({ ...prev, image: '' }));
            toast.success("Image uploaded successfully!");
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            handleImageUpload(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: Record<string, string> = {};
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.image) newErrors.image = 'Image is required';
        if (!formData.sliderTypeId) newErrors.sliderTypeId = 'Please select a slider type';
        if (!formData.imageRedirectLink) newErrors.imageRedirectLink = 'Image redirect link is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({
                title: true,
                image: true,
                sliderTypeId: true,
                imageRedirectLink: true
            });
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await sliderService.updateSlider(sliderId, formData);
            toast.success("Slider updated successfully!");
        } catch (error: any) {
            toast.error( "Failed to update slider");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.push('/admin/slider-controll');
        }
    };

    const clearImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
        setImagePreview('');
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Edit3 className="w-8 h-8 text-yellow-500 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
            <div className=" mx-auto">
                {/* Header with breadcrumb */}
                <div className="mb-8">
                    <Link
                        href="/admin/slider-controll"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group mb-4"
                    >
                        <div className="p-1.5 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span>Back to Slider Management</span>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                            <Edit3 className="w-7 h-7 text-yellow-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Edit Slider
                            </h1>
                            <p className="text-gray-400 mt-1 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Update your slider information
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-yellow-500" />
                                Basic Information
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Heading1 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('title')}
                                        placeholder="e.g., Summer Sale Banner"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border ${
                                            touched.title && errors.title
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-gray-700 focus:border-yellow-500/50'
                                        } text-white placeholder-gray-500 focus:outline-none transition-colors`}
                                    />
                                    {touched.title && !errors.title && formData.title && (
                                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                    )}
                                </div>
                                {touched.title && errors.title && (
                                    <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Subtitle */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Subtitle <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Heading2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Up to 50% off on all items"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Description <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter detailed description for this slider..."
                                        rows={4}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Card */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-yellow-500" />
                                Slider Image <span className="text-red-500">*</span>
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
                                            ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/25"
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
                                            ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/25"
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
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-700 hover:border-yellow-500/50 transition-colors cursor-pointer bg-gray-900/30 hover:bg-gray-900/50"
                                        >
                                            <Camera className="w-10 h-10 text-gray-500 mb-2" />
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
                                            name="image"
                                            value={formData.image}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('image')}
                                            className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-900/50 border ${
                                                touched.image && errors.image
                                                    ? 'border-red-500/50 focus:border-red-500'
                                                    : 'border-gray-700 focus:border-yellow-500/50'
                                            } text-white placeholder-gray-500 focus:outline-none transition-colors`}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {formData.image && (
                                            <button
                                                type="button"
                                                onClick={clearImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {touched.image && errors.image && (
                                        <p className="text-sm text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.image}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Image Preview */}
                            {(imagePreview || formData.image) && (
                                <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                    <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Current Image Preview
                                    </p>
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-700">
                                        <img
                                            src={imagePreview || formData.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Slider Type Card */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Type className="w-5 h-5 text-yellow-500" />
                                Slider Type <span className="text-red-500">*</span>
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="space-y-2">
                                <select
                                    name="sliderTypeId"
                                    value={formData.sliderTypeId}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('sliderTypeId')}
                                    className={`w-full appearance-none px-4 py-3 rounded-xl bg-gray-900/50 border ${
                                        touched.sliderTypeId && errors.sliderTypeId
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-gray-700 focus:border-yellow-500/50'
                                    } text-white focus:outline-none transition-colors cursor-pointer`}
                                >
                                    <option value="" className="bg-gray-900">Select a slider type</option>
                                    {sliderTypes.map((type) => (
                                        <option key={type._id} value={type._id} className="bg-gray-900">
                                            {type.name} {!type.isActive && "(Inactive)"}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-8 mt-[-38px] pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {touched.sliderTypeId && errors.sliderTypeId && (
                                    <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.sliderTypeId}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Button Configuration Card */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BluetoothConnectedIcon className="w-5 h-5 text-yellow-500" />
                                Button Configuration
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Button Text</label>
                                    <input
                                        type="text"
                                        name="buttonText"
                                        value={formData.buttonText}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Shop Now"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Button Link</label>
                                    <input
                                        type="text"
                                        name="buttonLink"
                                        value={formData.buttonLink}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('buttonLink')}
                                        placeholder="/products or https://"
                                        className={`w-full px-4 py-3 rounded-xl bg-gray-900/50 border ${
                                            touched.buttonLink && errors.buttonLink
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-gray-700 focus:border-yellow-500/50'
                                        } text-white placeholder-gray-500 focus:outline-none transition-colors`}
                                    />
                                    {touched.buttonLink && errors.buttonLink && (
                                        <p className="text-sm text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.buttonLink}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Redirect & Order Card */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-yellow-500" />
                                Redirect & Order
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Image Redirect Link */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Image Redirect Link <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="imageRedirectLink"
                                        value={formData.imageRedirectLink}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('imageRedirectLink')}
                                        placeholder="/promotion or https://example.com"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border ${
                                            touched.imageRedirectLink && errors.imageRedirectLink
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-gray-700 focus:border-yellow-500/50'
                                        } text-white placeholder-gray-500 focus:outline-none transition-colors`}
                                    />
                                </div>
                                {touched.imageRedirectLink && errors.imageRedirectLink && (
                                    <p className="text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.imageRedirectLink}
                                    </p>
                                )}
                            </div>

                            {/* Order and Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Display Order
                                    </label>
                                    <div className="relative">
                                        <Move className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="number"
                                            name="order"
                                            value={formData.order}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Lower numbers appear first
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Status</label>
                                    <div className="flex items-center gap-3 h-[52px]">
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
                                        <span className={`text-sm font-medium ${
                                            formData.isActive ? 'text-green-400' : 'text-gray-400'
                                        }`}>
                                            {formData.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Update Slider</span>
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

          
            </div>
        </div>
    );
}