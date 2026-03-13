"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Copy,
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle,
  Gift,
  Percent,
  Sparkles,
  ChevronRight,
  ClipboardClock,
  Phone,
  Hash,
  User as UserIcon,
  Mail,
  FileText,
  Star
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
  isBonusField?: boolean; // Add this field
}

export default function DepositPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [copied, setCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showPromoDetails, setShowPromoDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [minDepositAmount, setMinDepositAmount] = useState<number | null>(null);
  const [amountFieldName, setAmountFieldName] = useState<string>("");
  const [amountField, setAmountField] = useState<FormField | null>(null);
  const [bonusField, setBonusField] = useState<FormField | null>(null);

  // Form state - will store all form field values dynamically
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [calculatedBonus, setCalculatedBonus] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  // Data from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const walletAddress = "TEfuvvysBmXuUmBUxZGFM1J9a6LSVHGCP";

  // Reset promotion selection when tab changes
  useEffect(() => {
    setSelectedPromotion(null);
    setCalculatedBonus(null);
    setMinDepositAmount(null);
    setAmountError(null);
    setSelectedMethod(null);
    setUploadStatus('idle');
    setUploadedFileUrl("");
    setAmountFieldName("");
    setAmountField(null);
    setBonusField(null);
    setFormData({});
  }, [activeTab]);

  // Fetch data based on active tab
  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // Find the amount field and bonus field whenever form fields change
  useEffect(() => {
    if (formFields.length > 0) {
      console.log("All form fields:", formFields);
      
      // Find amount field - check for "Amount" exactly or includes amount
      const amountField = formFields.find(f => 
        f.name === 'Amount' || 
        f.name.toLowerCase() === 'amount' ||
        f.label.toLowerCase().includes('amount') ||
        f.name.toLowerCase().includes('amount')
      );
      
      if (amountField) {
        setAmountFieldName(amountField.name);
        setAmountField(amountField);
        console.log("Amount field identified:", amountField.name);
      } else {
        // If no amount field found, try first number field
        const numberField = formFields.find(f => f.type === 'number');
        if (numberField) {
          setAmountFieldName(numberField.name);
          setAmountField(numberField);
          console.log("Using first number field as amount:", numberField.name);
        }
      }

      // Find bonus field (marked with isBonusField)
      const bonusField = formFields.find(f => f.isBonusField === true);
      if (bonusField) {
        setBonusField(bonusField);
        console.log("Bonus field identified:", bonusField.name);
      }
    }
  }, [formFields]);

  // Calculate bonus when amount changes
  useEffect(() => {
    if (amountFieldName && formData[amountFieldName] && promotions.length > 0 && selectedPromotion) {
      const amount = parseFloat(formData[amountFieldName]);
      if (!isNaN(amount) && amount > 0) {
        calculateBonus(amount);
        
        // Check minimum deposit for selected promotion
        if (selectedPromotion.minDeposit) {
          if (amount < selectedPromotion.minDeposit) {
            setAmountError(`Minimum deposit for ${selectedPromotion.bonusName} is ৳${selectedPromotion.minDeposit}`);
          } else {
            setAmountError(null);
          }
        } else {
          setAmountError(null);
        }
      } else {
        setCalculatedBonus(null);
        setAmountError(null);
      }
    } else {
      setCalculatedBonus(null);
      setAmountError(null);
    }
  }, [formData, amountFieldName, promotions, selectedPromotion]);

  // Update minDeposit when promotion changes
  useEffect(() => {
    if (selectedPromotion) {
      setMinDepositAmount(selectedPromotion.minDeposit || null);
    } else {
      setMinDepositAmount(null);
    }
  }, [selectedPromotion]);

  const fetchTabData = async () => {
    try {
      setLoading(true);

      // Fetch payment methods for this tab
      const methodsRes = await depositService.getPaymentMethodByTab(activeTab);
      console.log("Payment methods:", methodsRes);
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
      console.log("Form fields received:", fieldsRes);
      
      if (fieldsRes?.success) {
        setFormFields(fieldsRes.data || []);
        // Initialize form data with empty strings for all fields
        const initialData: Record<string, string> = {};
        fieldsRes.data.forEach((field: FormField) => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
        console.log("Initialized form data with fields:", Object.keys(initialData));
      }

      // Fetch promotions for this tab
      const promotionsRes = await promotionService.getPromotionsByTab(activeTab);
      console.log("Promotions:", promotionsRes);
      
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
    if (!selectedPromotion) return;
    
    // Check if amount meets minimum deposit
    if (selectedPromotion.minDeposit && amount < selectedPromotion.minDeposit) {
      setCalculatedBonus(null);
      return;
    }
    
    // Calculate bonus for selected promotion only
    let bonus = 0;
    if (selectedPromotion.type === 'PERCENT') {
      bonus = (amount * selectedPromotion.value) / 100;
    } else {
      bonus = selectedPromotion.value;
    }
    
    setCalculatedBonus(bonus);
  };

  const handleSelectPromotion = (promo: Promotion) => {
    // Check if promotion belongs to current tab
    if (promo.tab !== activeTab) {
      alert("This promotion is not available for the selected payment method");
      return;
    }
    
    setSelectedPromotion(promo);
    setShowPromoDetails(false);
    
    // Show a message about minimum deposit
    if (promo.minDeposit) {
      alert(`Minimum deposit for ${promo.bonusName} is ৳${promo.minDeposit}`);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Reset all promotion-related states
    setSelectedPromotion(null);
    setCalculatedBonus(null);
    setMinDepositAmount(null);
    setAmountError(null);
    setAmountFieldName("");
    setAmountField(null);
    setBonusField(null);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log("Form data updated:", newData);
      return newData;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    
    // Simulate upload - replace with actual ImageBB upload logic
    setTimeout(() => {
      // Mock successful upload
      const mockUrl = `https://i.ibb.co/example/uploaded-${Date.now()}.jpg`;
      setUploadedFileUrl(mockUrl);
      setUploadStatus('success');
      
      // Store the uploaded file URL in form data with the field name
      handleInputChange(fieldName, mockUrl);
      
      setTimeout(() => setUploadStatus('idle'), 3000);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log all form data before submission
    console.log("Submitting form with data:", formData);
    console.log("All form fields:", formFields);
    
    // Find the amount field - use the one we identified or try to find it
    const amountFieldObj = amountField || formFields.find(f => 
      f.name === 'Amount' || 
      f.name.toLowerCase() === 'amount' ||
      f.label.toLowerCase().includes('amount')
    );
    
    // Check if amount is valid
    let amount = 0;
    if (amountFieldObj && formData[amountFieldObj.name]) {
      amount = parseFloat(formData[amountFieldObj.name]);
      if (isNaN(amount) || amount <= 0) {
        alert(`Please enter a valid amount in the "${amountFieldObj.label}" field`);
        return;
      }
    } else {
      alert("Please enter an amount");
      return;
    }

    // Check minimum deposit for selected promotion
    if (selectedPromotion && selectedPromotion.minDeposit && amount < selectedPromotion.minDeposit) {
      alert(`Minimum deposit for ${selectedPromotion.bonusName} is ৳${selectedPromotion.minDeposit}`);
      return;
    }

    // Check if payment method is selected
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }

    // Check all required fields
    const missingFields = formFields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.label);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare request data - this will include ALL form fields dynamically
      const requestData: any = {
        depositType: activeTab,
        paymentMethod: selectedMethod.name,
        amount: amount,
        formData: formData, // This contains all form field values
      };

      // Add promotion if selected and bonus calculated
      if (selectedPromotion && calculatedBonus) {
        requestData.promotionId = selectedPromotion._id;
        requestData.promotionName = selectedPromotion.bonusName;
        requestData.promotionType = selectedPromotion.type;
        requestData.promotionValue = selectedPromotion.value;
        requestData.bonusAmount = calculatedBonus;
      }

      // Find screenshot field if any
      const screenshotField = formFields.find(f => f.type === 'screenshot');
      if (screenshotField && formData[screenshotField.name]) {
        requestData.screenshot = formData[screenshotField.name];
      }

      // For crypto/auto, extract common fields
      if (activeTab === 'crypto') {
        // Find transaction ID field (if exists)
        const txField = formFields.find(f => 
          f.name.toLowerCase().includes('transaction') || 
          f.label.toLowerCase().includes('transaction') ||
          f.name.toLowerCase().includes('tx')
        );
        if (txField && formData[txField.name]) {
          requestData.transactionId = formData[txField.name];
        }
        
        // Find wallet address field (if exists)
        const walletField = formFields.find(f => 
          f.name.toLowerCase().includes('wallet') || 
          f.label.toLowerCase().includes('wallet') ||
          f.name.toLowerCase().includes('address')
        );
        if (walletField && formData[walletField.name]) {
          requestData.walletAddress = formData[walletField.name];
        } else {
          requestData.walletAddress = walletAddress;
        }
      }

      if (activeTab === 'auto') {
        // Find sender number field (if exists)
        const senderField = formFields.find(f => 
          f.name.toLowerCase().includes('sender') || 
          f.label.toLowerCase().includes('sender') ||
          f.name.toLowerCase().includes('phone') ||
          f.name.toLowerCase().includes('number')
        );
        if (senderField && formData[senderField.name]) {
          requestData.senderNumber = formData[senderField.name];
        }
        
        // Find transaction ID field (if exists)
        const txField = formFields.find(f => 
          f.name.toLowerCase().includes('transaction') || 
          f.label.toLowerCase().includes('transaction') ||
          f.name.toLowerCase().includes('tx')
        );
        if (txField && formData[txField.name]) {
          requestData.transactionId = formData[txField.name];
        }
      }

      console.log("Sending request data:", requestData);

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
        setMinDepositAmount(null);
        setAmountError(null);
        setUploadStatus('idle');
        setUploadedFileUrl("");
        
        console.log("Form reset successfully");
      }
    } catch (error) {
      console.error("Failed to submit deposit request:", error);
      alert("Failed to submit deposit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Get appropriate icon for field type
  const getFieldIcon = (field: FormField) => {
    if (field.isBonusField) return <Star className="w-4 h-4 text-yellow-500" />;
    if (field.type === 'number') return <Hash className="w-4 h-4 text-gray-400" />;
    if (field.type === 'textarea') return <FileText className="w-4 h-4 text-gray-400" />;
    if (field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('sender')) 
      return <Phone className="w-4 h-4 text-gray-400" />;
    if (field.name.toLowerCase().includes('name')) 
      return <UserIcon className="w-4 h-4 text-gray-400" />;
    if (field.name.toLowerCase().includes('email')) 
      return <Mail className="w-4 h-4 text-gray-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
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
        <button
          onClick={() => router.push("/history")}
          className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50"
          title="View History"
        >
          <ClipboardClock className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-5 pb-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleTabChange("manual")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "manual"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                : "bg-[#0689ff] text-white border border-white"
            }`}
          >
            BDT - Manual
          </button>
          <button
            onClick={() => handleTabChange("auto")}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "auto"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                : "bg-[#0689ff] text-white border border-white"
            }`}
          >
            Auto Deposit
          </button>
          <button
            onClick={() => handleTabChange("crypto")}
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

      {/* Selected Promotion Banner */}
      {selectedPromotion && (
        <div className="px-4 mt-2 mb-4">
          <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-xl p-3 border border-pink-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-white">
                <span className="font-bold">{selectedPromotion.bonusName}</span> selected
                {selectedPromotion.minDeposit && (
                  <span className="text-gray-300 ml-1">
                    (Min: ৳{selectedPromotion.minDeposit})
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedPromotion(null);
                setCalculatedBonus(null);
                setMinDepositAmount(null);
                setAmountError(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Promotions Banner */}
      {promotions.filter(p => p.isActive).length > 0 && !selectedPromotion && (
        <div className="px-4 mt-2 mb-4">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-bold text-white">Available Bonuses</h2>
              </div>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {promotions.filter(p => p.isActive).map((promo, index) => (
                <div
                  key={promo._id}
                  onClick={() => handleSelectPromotion(promo)}
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
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Promotions Message */}
      {promotions.filter(p => p.isActive).length === 0 && !selectedPromotion && (
        <div className="px-4 mt-2 mb-4">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400">No active bonuses available for this payment method</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="max-w-md mx-auto px-4 mt-4">
        {/* Manual Tab */}
        {activeTab === "manual" && (
          <form onSubmit={handleSubmit} className="bg-[#252334] rounded-2xl p-5 border border-gray-800/50">
            {/* Payment Methods */}
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

            {/* Dynamic Form Fields */}
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
                          onChange={(e) => handleFileUpload(e, field.name)}
                          className="hidden"
                          id={`screenshot-${field._id}`}
                        />
                        <label
                          htmlFor={`screenshot-${field._id}`}
                          className={`block w-full rounded-xl px-4 py-3 text-center cursor-pointer transition font-medium ${
                            formData[field.name] 
                              ? 'bg-green-600 text-white' 
                              : uploadStatus === 'error'
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-black hover:brightness-110'
                          }`}
                        >
                          {uploadStatus === 'uploading' ? 'Uploading...' : 
                           formData[field.name] ? 'Upload Successful!' :
                           uploadStatus === 'error' ? 'Upload Failed. Try Again.' :
                           field.label}
                        </label>
                        {formData[field.name] && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          {getFieldIcon(field)}
                        </div>
                        <input
                          type={field.type}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={
                            field.name === amountFieldName && minDepositAmount
                              ? `Min: ৳${minDepositAmount} - ${field.placeholder || field.label}`
                              : field.placeholder || `Enter ${field.label}`
                          }
                          required={field.required}
                          min={field.name === amountFieldName && minDepositAmount ? minDepositAmount : undefined}
                          className={`w-full bg-white border-0 rounded-xl pl-10 pr-4 py-3 text-black text-center text-lg placeholder-black focus:outline-none focus:ring-2 ${
                            amountError && field.name === amountFieldName ? 'focus:ring-red-400 border-2 border-red-400' : 'focus:ring-green-400'
                          }`}
                        />
                        {/* Bonus indicator for amount field */}
                        {field.name === amountFieldName && calculatedBonus && (
                          <div className="absolute -bottom-6 left-0 right-0 text-center">
                            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                              + ৳{calculatedBonus.toFixed(2)} bonus will be added
                            </span>
                          </div>
                        )}
                        {/* Error message for amount field */}
                        {field.name === amountFieldName && amountError && (
                          <div className="absolute -bottom-6 left-0 right-0 text-center">
                            <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded-full">
                              {amountError}
                            </span>
                          </div>
                        )}
                        {/* Bonus field indicator */}
                        {field.isBonusField && (
                          <div className="absolute -top-3 right-0">
                            <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Bonus
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
                  disabled={submitting || (selectedPromotion && !!amountError)}
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

        {/* Auto Tab */}
        {activeTab === "auto" && (
          <form onSubmit={handleSubmit} className="bg-[#252334] rounded-2xl p-5 border border-gray-800/50 text-center">
            <div className="mb-6">
              <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-3 mb-5 text-xs">
                <p className="text-green-300 font-medium">
                  গাড়ি পেমেন্ট করতে হলে ২.০% চার্জ লাগবে এবং বিকাশ/নগদ/রকেট থেকে পেমেন্ট করুন
                </p>
              </div>

              {/* Payment Methods */}
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

            {/* Dynamic Form Fields */}
            <div className="space-y-4">
              {formFields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div key={field._id} className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {getFieldIcon(field)}
                    </div>
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={
                        field.name === amountFieldName && minDepositAmount
                          ? `Min: ৳${minDepositAmount} - ${field.placeholder || field.label}`
                          : field.placeholder || `Enter ${field.label}`
                      }
                      required={field.required}
                      min={field.name === amountFieldName && minDepositAmount ? minDepositAmount : undefined}
                      className={`w-full bg-[#fdfde8] border-0 rounded-xl pl-10 pr-4 py-4 text-black text-center text-xl placeholder-black border-2 ${
                        amountError && field.name === amountFieldName ? 'border-red-400' : 'border-[#d12d4d]'
                      } focus:outline-none focus:ring-2 focus:ring-red-400`}
                    />
                    {field.name === amountFieldName && calculatedBonus && (
                      <div className="absolute -bottom-5 left-0 right-0 text-center">
                        <span className="text-xs text-green-400">+ ৳{calculatedBonus.toFixed(2)} bonus</span>
                      </div>
                    )}
                    {field.name === amountFieldName && amountError && (
                      <div className="absolute -bottom-5 left-0 right-0 text-center">
                        <span className="text-xs text-red-400">{amountError}</span>
                      </div>
                    )}
                    {field.isBonusField && (
                      <div className="absolute -top-3 right-0">
                        <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Bonus
                        </span>
                      </div>
                    )}
                  </div>
                ))}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || (selectedPromotion && !!amountError)}
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

        {/* Crypto Tab */}
        {activeTab === "crypto" && (
          <form onSubmit={handleSubmit} className="bg-[#252334] rounded-2xl p-5 border border-gray-800/50">
            {/* Network Selection */}
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

            {/* Dynamic Form Fields */}
            <div className="space-y-4 mt-5">
              {formFields
                .sort((a, b) => a.order - b.order)
                .map((field) => {
                  if (field.type === 'textarea') {
                    return (
                      <div key={field._id} className="relative">
                        <div className="absolute left-3 top-3">
                          {getFieldIcon(field)}
                        </div>
                        <textarea
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          rows={2}
                          required={field.required}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 border-0 rounded-xl pl-10 pr-4 py-3 text-white text-center border-2 border-[#fc0613] placeholder-white/80"
                        />
                        {field.isBonusField && (
                          <div className="absolute -top-3 right-0">
                            <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Bonus
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (field.type === 'screenshot' || field.label.toLowerCase().includes('screenshot')) {
                    return (
                      <div key={field._id}>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, field.name)}
                            className="hidden"
                            id={`screenshot-${field._id}`}
                          />
                          <label
                            htmlFor={`screenshot-${field._id}`}
                            className={`flex items-center justify-center w-full rounded-xl overflow-hidden cursor-pointer transition shadow-md relative
                              ${formData[field.name] ? 'bg-green-500' :
                                uploadStatus === 'error' ? 'bg-red-500' :
                                  'bg-white border border-gray-300'}`}
                          >
                            <div className="flex-1 text-center py-3">
                              {uploadStatus === 'uploading' && (
                                <span className="text-gray-700 font-semibold">Uploading...</span>
                              )}
                              {formData[field.name] && (
                                <span className="text-white font-semibold">Upload successful!</span>
                              )}
                              {!formData[field.name] && uploadStatus !== 'uploading' && uploadStatus !== 'error' && (
                                <span className="text-gray-800 font-semibold">{field.label}</span>
                              )}
                              {uploadStatus === 'error' && (
                                <span className="text-white font-semibold">Upload failed. Try again.</span>
                              )}
                            </div>
                            <div className={`absolute right-3 px-3 py-2 rounded-lg
                              ${formData[field.name] ? 'bg-green-600' :
                                uploadStatus === 'error' ? 'bg-red-600' :
                                  'bg-pink-500 hover:bg-pink-600'}`}
                            >
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                          </label>
                          {field.isBonusField && (
                            <div className="absolute -top-3 right-0">
                              <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Bonus
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field._id} className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {getFieldIcon(field)}
                      </div>
                      <input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={
                          field.name === amountFieldName && minDepositAmount
                            ? `Min: ৳${minDepositAmount} - ${field.placeholder || field.label}`
                            : field.placeholder || `Enter ${field.label}`
                        }
                        required={field.required}
                        min={field.name === amountFieldName && minDepositAmount ? minDepositAmount : undefined}
                        className={`w-full bg-[#fdfde8] border-0 rounded-xl pl-10 pr-4 py-3 text-black border-2 ${
                          amountError && field.name === amountFieldName ? 'border-red-400' : 'border-[#fc0613]'
                        } text-center placeholder-black focus:outline-none focus:ring-2 focus:ring-red-400`}
                      />
                      {field.name === amountFieldName && calculatedBonus && (
                        <div className="absolute -bottom-5 left-0 right-0 text-center">
                          <span className="text-xs text-green-400">+ ৳{calculatedBonus.toFixed(2)} bonus</span>
                        </div>
                      )}
                      {field.name === amountFieldName && amountError && (
                        <div className="absolute -bottom-5 left-0 right-0 text-center">
                          <span className="text-xs text-red-400">{amountError}</span>
                        </div>
                      )}
                      {field.isBonusField && (
                        <div className="absolute -top-3 right-0">
                          <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Bonus
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || (selectedPromotion && !!amountError)}
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
                  router.push('/history');
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