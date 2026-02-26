"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Copy,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { depositService } from "@/services/api/deposit.service";

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
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [copied, setCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Form state
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Data from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  const walletAddress = "TEfuvvysBmXuUmBUxZGFM1J9a6LSVHGCP";
  console.log(formData)
  // Fetch data based on active tab
  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    try {
      setLoading(true);

      // Fetch payment methods for this tab
      const methodsRes = await depositService.getPaymentMethodByTab(activeTab);
      if (methodsRes?.success) {
        setPaymentMethods(methodsRes.data || []);
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

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadStatus('uploading');
      // Simulate upload - replace with actual upload logic
      setTimeout(() => {
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 3000);
      }, 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { tab: activeTab, ...formData });
    // Add your submission logic here
    alert("Deposit request submitted!");
  };

  // Get icon for payment method
  const getMethodIcon = (method: PaymentMethod) => {
    if (method.icon) {
      return <img src={method.icon} alt={method.name} className="w-full h-full object-contain" />;
    }
    // Fallback to first 2 letters
    return <span className="text-xs font-bold text-black">{method.name.slice(0, 2).toUpperCase()}</span>;
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
      {/* Tabs */}
      <div className="px-4 pt-5 pb-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab("manual")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "manual"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                : "bg-[#0689ff] text-white border border-white"
              }`}
          >
            BDT - Manual
          </button>
          <button
            onClick={() => setActiveTab("auto")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "auto"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                : "bg-[#0689ff] text-white border border-white"
              }`}
          >
            Auto Deposit
          </button>
          <button
            onClick={() => setActiveTab("crypto")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "crypto"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                : "bg-[#0689ff] text-white border border-white"
              }`}
          >
            Crypto Deposit
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto px-4 mt-4">
        {activeTab === "manual" && (
          <form onSubmit={handleSubmit} className="bg-[#252334] rounded-2xl p-5 border border-gray-800/50">
            {/* Payment Methods */}
            {paymentMethods.length > 0 && (
              <div className="grid grid-cols-3 gap-3  mb-5">
                {paymentMethods.map((method) => (
                  <div
                    key={method._id}
                    className="bg-white rounded-xl p-2 h-14 flex items-center justify-center text-black border border-green-500 hover:scale-105 transition cursor-pointer shadow-lg"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {getMethodIcon(method)}
                    </div>
                    <div>
                      {method.name}
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
                          className="block w-full bg-white rounded-xl px-4 py-3 text-center cursor-pointer hover:brightness-110 transition font-medium"
                        >
                          {field.label}
                        </label>
                        {uploadStatus === 'success' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        required={field.required}
                        className="w-full bg-white border-0 rounded-xl px-4 py-3 text-black text-center text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    )}
                  </div>
                ))}

              {/* Submit Button - Centered */}
              {/* Submit Button - Smaller Size */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="block mx-auto py-3 px-8 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-base rounded-xl hover:brightness-110 transition shadow-lg"
                >
                  Deposit Now
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

              {/* Payment Methods for Auto */}
              {paymentMethods.length > 0 && (
                <div className="flex justify-center gap-4 mb-4">
                  {paymentMethods.map((method) => (
                    <div key={method._id} className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center p-1">
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
                  <input
                    key={field._id}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    required={field.required}
                    className="w-full bg-[#fdfde8] border-0 rounded-xl px-4 py-4 text-black text-center text-xl placeholder-black border-2 border-[#d12d4d] focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ))}

              <div className="pt-4">
                <button
                  type="submit"
                  className="block mx-auto py-3 px-8 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-base rounded-xl hover:brightness-110 transition shadow-lg"
                >
                  Deposit Now
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
            {/* Network Selection */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {paymentMethods.map((method) => (
                <div key={method._id} className="bg-white rounded-xl p-3 border border-gray-700">
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
              <div className="bg-[#e6e5e5] rounded-xl p-4  mb-5">
                <ul className="space-y-2 text-sm text-black">
                  {instructions
                    .sort((a, b) => a.step - b.step)
                    .map((instruction) => (
                      <li key={instruction._id} className="flex items-start gap-2">
                        <span className="text-black font-extrabold ">•</span>
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
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 border-0 rounded-xl px-4 py-3 text-white text-center border-2 border-[#fc0613] placeholder-white/80 "
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
                            {/* Centered Text */}
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

                            {/* Right Icon */}
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
                    <div key={field._id}>
                      <input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        required={field.required}
                        className="w-full bg-[#fdfde8] border-0 rounded-xl px-4 py-3 text-black border-2 border-[#fc0613] text-center placeholder-black focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  );
                })}

              <div className="pt-4">
                <button
                  type="submit"
                  className="block mx-auto py-3 px-8 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-base rounded-xl hover:brightness-110 transition shadow-lg"
                >
                  Deposit Now
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-5">
              Minimum: 1 USDT • Maximum deposit amount 100 USDT
            </p>
          </form>
        )}
      </div>
    </div>
  );
}