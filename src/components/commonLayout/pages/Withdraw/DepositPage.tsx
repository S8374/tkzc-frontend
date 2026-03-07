"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Copy,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Gift,
  Percent,
  Sparkles,
  ChevronRight
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { depositService } from "@/services/api/deposit.service";
import { useRouter } from "next/navigation";
import { Promotion, promotionService } from "@/services/api/promotion.service";
import { depositRequestService } from "@/services/api/depositRequest.service";

type Tab = "manual" | "auto" | "crypto";

interface PaymentMethod {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  tab: Tab;
  description?: string;
  order: number;
  isActive: boolean;
}

interface Instruction {
  _id: string;
  step: number;
  text: string;
  tab: Tab;
  isActive: boolean;
}

interface FormField {
  _id: string;
  label: string;
  name: string;
  tab: Tab;
  type: 'text' | 'number' | 'textarea' | 'screenshot';
  placeholder?: string;
  required: boolean;
  order: number;
  isActive: boolean;
}

export default function DepositPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [copied, setCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Form state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [calculatedBonus, setCalculatedBonus] = useState<number | null>(null);

  // Data from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const walletAddress = "TEfuvvysBmXuUmBUxZGFM1J9a6LSVHGCP";

  // Fetch data based on active tab
  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // Calculate bonus when amount changes
  useEffect(() => {
    // Find the amount field - it could be named 'amount' or have 'amount' in the label
    const amountField = formFields.find(f => 
      f.name === 'number' || 
      f.name === 'Amount' || 
      f.label.toLowerCase().includes('amount')
    );
    
    if (amountField && formData[amountField.name] && promotions.length > 0) {
      const amount = parseFloat(formData[amountField.name]);
      if (!isNaN(amount) && amount > 0) {
        calculateBonus(amount);
      } else {
        setCalculatedBonus(null);
      }
    } else {
      setCalculatedBonus(null);
    }
  }, [formData, formFields, promotions]);

  const fetchTabData = async () => {
    try {
      setLoading(true);

      // Fetch payment methods for this tab
      const methodsRes = await depositService.getPaymentMethodByTab(activeTab);
      if (methodsRes?.success) {
        setPaymentMethods(methodsRes.data || []);
        // Auto-select first method if available
        if (methodsRes.data.length > 0) {
          setSelectedMethod(methodsRes.data[0]);
        }
      }

      // Fetch instructions for this tab
      const instructionsRes = await depositService.getInstructionsByTab(activeTab);
      if (instructionsRes?.success) {
        setInstructions(instructionsRes.data || []);
      }

      // Fetch form fields for this tab
      const fieldsRes = await depositService.getFormFieldsByTab(activeTab);
      if (fieldsRes?.success) {
        setFormFields(fieldsRes.data || []);
        // Initialize form data with empty strings
        const initialData: Record<string, string> = {};
        fieldsRes.data.forEach((field: FormField) => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
      }

      // Fetch promotions for this tab
      const promotionsRes = await promotionService.getPromotionsByTab(activeTab);
      if (promotionsRes?.success) {
        setPromotions(promotionsRes.data || []);
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBonus = (amount: number) => {
    let maxBonus = 0;
    let bestPromotion: Promotion | null = null;
    
    promotions.forEach(promo => {
      if (!promo.isActive) return;
      
      // Check if amount meets minimum deposit
      if (promo.minDeposit && amount < promo.minDeposit) return;
      
      // Check date range
      const now = new Date();
      if (promo.startDate && new Date(promo.startDate) > now) return;
      if (promo.endDate && new Date(promo.endDate) < now) return;
      
      // Calculate bonus
      let bonus = 0;
      if (promo.type === 'PERCENT') {
        bonus = (amount * promo.value) / 100;
      } else {
        bonus = promo.value;
      }
      
      // No maxBonus field - just take the highest bonus
      if (bonus > maxBonus) {
        maxBonus = bonus;
        bestPromotion = promo;
      }
    });
    
    setCalculatedBonus(maxBonus > 0 ? maxBonus : null);
    if (bestPromotion) {
      setSelectedPromotion(bestPromotion);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    
    // Simulate upload - replace with actual ImageBB or your upload logic
    setTimeout(() => {
      // Mock successful upload
      const mockUrl = "https://i.ibb.co/example/uploaded-image.jpg";
      setUploadedFileUrl(mockUrl);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find the amount field
    const amountField = formFields.find(f => 
      f.name === 'amount' || 
      f.name === 'Amount' || 
      f.label.toLowerCase().includes('amount')
    );
    
    // Check if amount is valid
    let amount = 0;
    if (amountField && formData[amountField.name]) {
      amount = parseFloat(formData[amountField.name]);
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }
    } else {
      alert("Please enter an amount");
      return;
    }

    // Check if payment method is selected
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }

    // Check required fields
    const missingFields = formFields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.label);
    
    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare request data
      const requestData: any = {
        depositType: activeTab,
        paymentMethod: selectedMethod.name,
        amount: amount,
        formData: formData,
      };

      // Add promotion if selected and bonus calculated
      if (selectedPromotion && calculatedBonus) {
        requestData.promotionId = selectedPromotion._id;
        requestData.promotionName = selectedPromotion.bonusName;
        requestData.promotionType = selectedPromotion.type;
        requestData.promotionValue = selectedPromotion.value;
      }

      // Add screenshot if uploaded
      if (uploadStatus === 'success' && uploadedFileUrl) {
        requestData.screenshot = uploadedFileUrl;
      }

      // Add transaction details for crypto/auto
      if (activeTab === 'crypto') {
        requestData.walletAddress = formData.walletAddress || walletAddress;
        requestData.transactionId = formData.transactionId;
      }

      if (activeTab === 'auto') {
        requestData.senderNumber = formData.senderNumber;
        requestData.transactionId = formData.transactionId;
      }

      const response = await depositRequestService.createRequest(requestData);
      
      if (response?.success) {
        setSubmittedRequest(response.data);
        setShowSuccessModal(true);
        
        // Reset form
        const initialData: Record<string, string> = {};
        formFields.forEach((field: FormField) => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
        setSelectedPromotion(null);
        setCalculatedBonus(null);
        setUploadStatus('idle');
        setUploadedFileUrl("");
      }
    } catch (error) {
      console.error("Failed to submit deposit request:", error);
      alert("Failed to submit deposit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Get icon for payment method
  const getMethodIcon = (method: PaymentMethod) => {
    if (method.icon) {
      return <img src={method.icon} alt={method.name} className="w-full h-full object-contain" />;
    }
    return <span className="text-xs font-bold text-black">{method.name.slice(0, 2).toUpperCase()}</span>;
  };

  // Format bonus display
  const formatBonus = (promotion: Promotion) => {
    if (promotion.type === 'PERCENT') {
      return `${promotion.value}%`;
    } else {
      return `৳${promotion.value}`;
    }
  };

  // Get gradient color based on promotion name
  const getPromoGradient = (index: number) => {
    const gradients = [
      'from-purple-600 to-pink-600',
      'from-blue-600 to-cyan-600',
      'from-green-600 to-emerald-600',
      'from-orange-600 to-red-600',
      'from-indigo-600 to-purple-600',
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1D2A] text-white pb-10">
        <div className="relative h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <BackButton />
          <h1 className="text-xl font-bold flex-1 text-center">Deposit</h1>
          <button className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1D2A] text-white pb-10">
      {/* Header */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <BackButton />
        <h1 className="text-xl font-bold flex-1 text-center">Deposit</h1>
        <button className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50">
          <AlertCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-5 pb-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab("manual")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "manual"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                : "bg-[#0689ff] text-white border border-white"
            }`}
          >
            BDT - Manual
          </button>
          <button
            onClick={() => setActiveTab("auto")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "auto"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                : "bg-[#0689ff] text-white border border-white"
            }`}
          >
            Auto Deposit
          </button>
          <button
            onClick={() => setActiveTab("crypto")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "crypto"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                : "bg-[#0689ff] text-white border border-white"
            }`}
          >
            Crypto Deposit
          </button>
        </div>
      </div>

      {/* Promotions Banner - Only show if there are active promotions */}
      {promotions.filter(p => p.isActive).length > 0 && (
        <div className="px-4 mt-2 mb-4">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-bold text-white">Active Bonuses</h2>
              </div>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {promotions.filter(p => p.isActive).map((promo, index) => (
                <div
                  key={promo._id}
                  onClick={() => {
                    setSelectedPromotion(promo);
                    setShowPromoDetails(true);
                  }}
                  className={`bg-gradient-to-r ${getPromoGradient(index)} p-[1px] rounded-xl cursor-pointer transform hover:scale-[1.02] transition-all duration-200`}
                >
                  <div className="bg-[#252334] rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getPromoGradient(index)} flex items-center justify-center`}>
                          {promo.type === 'PERCENT' ? (
                            <Percent className="w-5 h-5 text-white" />
                          ) : (
                            <Wallet className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{promo.bonusName}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-pink-400 font-bold">{formatBonus(promo)}</span>
                            {promo.minDeposit && (
                              <>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-300">Min: ৳{promo.minDeposit}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bonus Preview - Only show if this promotion is selected */}
                    {calculatedBonus && selectedPromotion?._id === promo._id && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">You'll get:</span>
                          <span className="text-green-400 font-bold">+ ৳{calculatedBonus.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="max-w-md mx-auto px-4 mt-4">
        {activeTab === "manual" && (
          <form onSubmit={handleSubmit} className="bg-[#252334] rounded-2xl p-5 border border-gray-800/50">
            {/* Payment Methods - Make them selectable */}
            {paymentMethods.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {paymentMethods.map((method) => (
                  <div
                    key={method._id}
                    onClick={() => setSelectedMethod(method)}
                    className={`bg-white rounded-xl p-2 h-14 flex items-center justify-center text-black border-2 cursor-pointer transition-all ${
                      selectedMethod?._id === method._id
                        ? 'border-green-500 scale-105 shadow-lg'
                        : 'border-transparent hover:border-green-300'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {getMethodIcon(method)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            {instructions.length > 0 && (
              <div className="bg-[#d5d7d7] rounded-xl p-4 border border-gray-700/50 mb-5">
                <ul className="space-y-2 text-sm text-black">
                  {instructions
                    .sort((a, b) => a.step - b.step)
                    .map((instruction) => (
                      <li key={instruction._id} className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span dangerouslySetInnerHTML={{ __html: instruction.text }} />
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {formFields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div key={field._id}>
                    {field.type === 'screenshot' ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="screenshot-upload-manual"
                        />
                        <label
                          htmlFor="screenshot-upload-manual"
                          className={`block w-full rounded-xl px-4 py-3 text-center cursor-pointer transition font-medium ${
                            uploadStatus === 'success' 
                              ? 'bg-green-600 text-white' 
                              : uploadStatus === 'error'
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-black hover:brightness-110'
                          }`}
                        >
                          {uploadStatus === 'uploading' ? 'Uploading...' : 
                           uploadStatus === 'success' ? 'Upload Successful!' :
                           uploadStatus === 'error' ? 'Upload Failed. Try Again.' :
                           field.label}
                        </label>
                        {uploadStatus === 'success' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          required={field.required}
                          className="w-full bg-white border-0 rounded-xl px-4 py-3 text-black text-center text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        {/* Bonus indicator for amount field */}
                        {(field.name === 'amount' || field.name === 'Amount' || field.label.toLowerCase().includes('amount')) && calculatedBonus && (
                          <div className="absolute -bottom-6 left-0 right-0 text-center">
                            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                              + ৳{calculatedBonus.toFixed(2)} bonus will be added
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="block mx-auto py-3 px-8 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-base rounded-xl hover:brightness-110 transition shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Deposit Now'}
                  {calculatedBonus && !submitting && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                      +৳{calculatedBonus.toFixed(2)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === "auto" && (
          <form onSubmit={handleSubmit} className="bg-[#252334] rounded-2xl p-5 border border-gray-800/50 text-center">
            <div className="mb-6">
              <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-3 mb-5 text-xs">
                <p className="text-green-300 font-medium">
                  গাড়ি পেমেন্ট করতে হলে ২.০% চার্জ লাগবে এবং বিকাশ/নগদ/রকেট থেকে পেমেন্ট করুন
                </p>
              </div>

              {/* Payment Methods for Auto - Make them selectable */}
              {paymentMethods.length > 0 && (
                <div className="flex justify-center gap-4 mb-4">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method._id} 
                      onClick={() => setSelectedMethod(method)}
                      className={`w-24 h-24 rounded-full flex items-center justify-center p-1 cursor-pointer transition-all ${
                        selectedMethod?._id === method._id
                          ? 'bg-gradient-to-r from-green-500 to-green-600 scale-105'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-2">
                        {method.icon ? (
                          <img src={method.icon} alt={method.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl font-bold text-black">{method.name.slice(0, 2)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-bold mb-2">Auto Deposit</h3>
              <p className="text-gray-400 text-sm">
                Instant deposit — no need to upload screenshot
              </p>
            </div>

            {/* Instructions */}
            {instructions.length > 0 && (
              <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50 mb-4 text-left">
                <ul className="space-y-2 text-sm text-gray-200">
                  {instructions
                    .sort((a, b) => a.step - b.step)
                    .map((instruction) => (
                      <li key={instruction._id} className="flex items-start gap-2">
                        <span className="text-green-400 font-bold mt-0.5">{instruction.step}.</span>
                        <span>{instruction.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {formFields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div key={field._id} className="relative">
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label}`}
                      required={field.required}
                      className="w-full bg-[#fdfde8] border-0 rounded-xl px-4 py-4 text-black text-center text-xl placeholder-black border-2 border-[#d12d4d] focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    {(field.name === 'amount' || field.name === 'Amount' || field.label.toLowerCase().includes('amount')) && calculatedBonus && (
                      <div className="absolute -bottom-5 left-0 right-0 text-center">
                        <span className="text-xs text-green-400">+ ৳{calculatedBonus.toFixed(2)} bonus</span>
                      </div>
                    )}
                  </div>
                ))}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="block mx-auto py-3 px-8 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-base rounded-xl hover:brightness-110 transition shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Deposit Now'}
                  {calculatedBonus && !submitting && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                      +৳{calculatedBonus.toFixed(2)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Service charge may apply • Instant confirmation
            </p>
          </form>
        )}

        {activeTab === "crypto" && (
          <form onSubmit={handleSubmit} className="bg-[#252334] rounded-2xl p-5 border border-gray-800/50">
            {/* Network Selection - Make them selectable */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {paymentMethods.map((method) => (
                <div 
                  key={method._id} 
                  onClick={() => setSelectedMethod(method)}
                  className={`bg-white rounded-xl p-3 border-2 cursor-pointer transition-all ${
                    selectedMethod?._id === method._id
                      ? 'border-green-500 scale-105 shadow-lg'
                      : 'border-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {method.icon ? (
                      <img src={method.icon} alt={method.name} className="w-12 h-12 rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-lg text-black">{method.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            {instructions.length > 0 && (
              <div className="bg-[#e6e5e5] rounded-xl p-4 mb-5">
                <ul className="space-y-2 text-sm text-black">
                  {instructions
                    .sort((a, b) => a.step - b.step)
                    .map((instruction) => (
                      <li key={instruction._id} className="flex items-start gap-2">
                        <span className="text-black font-extrabold">•</span>
                        <span>{instruction.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Wallet Address */}
            <div className="text-center mb-5">
              <div className="text-white text-sm mb-2">Wallet ID OR Address</div>
              <div className="flex items-center gap-2 bg-[#535352] rounded-lg p-3 border border-[#900c0c]">
                <div className="font-mono text-xs flex-1 break-all text-left">
                  {walletAddress}
                </div>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> {copied ? "Copied" : "copy"}
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mt-5">
              {formFields
                .sort((a, b) => a.order - b.order)
                .map((field) => {
                  if (field.type === 'textarea') {
                    return (
                      <div key={field._id}>
                        <textarea
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          rows={2}
                          required={field.required}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 border-0 rounded-xl px-4 py-3 text-white text-center border-2 border-[#fc0613] placeholder-white/80"
                        />
                      </div>
                    );
                  }

                  if (field.type === 'screenshot' || field.label.toLowerCase().includes('scanshot') || field.label.toLowerCase().includes('screenshot')) {
                    return (
                      <div key={field._id}>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="screenshot-upload-crypto"
                          />
                          <label
                            className={`flex items-center justify-center w-full rounded-xl overflow-hidden cursor-pointer transition shadow-md relative
                              ${uploadStatus === 'success' ? 'bg-green-500' :
                                uploadStatus === 'error' ? 'bg-red-500' :
                                  'bg-white border border-gray-300'}`}
                          >
                            <div className="flex-1 text-center py-3">
                              {uploadStatus === 'idle' && (
                                <span className="text-gray-800 font-semibold">{field.label}</span>
                              )}
                              {uploadStatus === 'uploading' && (
                                <span className="text-gray-700 font-semibold">Uploading...</span>
                              )}
                              {uploadStatus === 'success' && (
                                <span className="text-white font-semibold">Upload successful!</span>
                              )}
                              {uploadStatus === 'error' && (
                                <span className="text-white font-semibold">Upload failed. Try again.</span>
                              )}
                            </div>
                            <div className={`absolute right-3 px-3 py-2 rounded-lg
                              ${uploadStatus === 'success' ? 'bg-green-600' :
                                uploadStatus === 'error' ? 'bg-red-600' :
                                  'bg-pink-500 hover:bg-pink-600'}`}
                            >
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field._id} className="relative">
                      <input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        required={field.required}
                        className="w-full bg-[#fdfde8] border-0 rounded-xl px-4 py-3 text-black border-2 border-[#fc0613] text-center placeholder-black focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                      {(field.name === 'amount' || field.name === 'Amount' || field.label.toLowerCase().includes('amount')) && calculatedBonus && (
                        <div className="absolute -bottom-5 left-0 right-0 text-center">
                          <span className="text-xs text-green-400">+ ৳{calculatedBonus.toFixed(2)} bonus</span>
                        </div>
                      )}
                    </div>
                  );
                })}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="block mx-auto py-3 px-8 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-base rounded-xl hover:brightness-110 transition shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Deposit Now'}
                  {calculatedBonus && !submitting && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                      +৳{calculatedBonus.toFixed(2)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-5">
              Minimum: 1 USDT • Maximum deposit amount 100 USDT
            </p>
          </form>
        )}
      </div>

    

      {/* Success Modal */}
      {showSuccessModal && submittedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#252334] rounded-2xl max-w-sm w-full p-5 border border-gray-700">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Request Submitted!</h3>
              <p className="text-gray-400 text-sm mt-1">
                Your deposit request has been submitted successfully
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-bold">৳{submittedRequest.amount}</span>
              </div>
              {submittedRequest.bonusAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Bonus:</span>
                  <span className="text-green-400 font-bold">+ ৳{submittedRequest.bonusAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-white font-bold">
                  ৳{submittedRequest.amount + (submittedRequest.bonusAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-yellow-400 font-bold">Pending</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSubmittedRequest(null);
                }}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/dashboard/deposit-history');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:brightness-110 transition"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}