"use client";

import { useState, useEffect, Suspense } from "react";
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
  Star,
  Type,
  Info,
  Check,
  CreditCard
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
  tournOver: number;
  order: number;
  isActive: boolean;
}

interface Instruction {
  _id: string;
  step: number;
  text: string;
  tab: Tab;
  paymentMethodId?: string;
  isActive: boolean;
}

interface FormField {
  _id: string;
  label: string;
  name: string;
  tab: Tab;
  type: 'text' | 'number' | 'textarea' | 'screenshot' | 'static';
  placeholder?: string;
  required: boolean;
  order: number;
  paymentMethodId?: string;
  isActive: boolean;
  isBonusField?: boolean;
  staticValue?: string;
  isCopyable?: boolean;
}

interface Tittle {
  _id: string;
  title: string;
  description: string;
  tab: Tab;
  isActive: boolean;
}

// Extended Promotion interface to include new fields
interface ExtendedPromotion extends Promotion {
  maxBonus?: number;
  paymentMethodId?: {
    _id: string;
    name: string;
    icon?: string;
  } | string;
}

export default function DepositPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [selectedPromotion, setSelectedPromotion] = useState<ExtendedPromotion | null>(null);
  const [showPromoDetails, setShowPromoDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [minDepositAmount, setMinDepositAmount] = useState<number | null>(null);
  const [maxBonusAmount, setMaxBonusAmount] = useState<number | null>(null);
  const [amountFieldName, setAmountFieldName] = useState<string>("");
  const [amountField, setAmountField] = useState<FormField | null>(null);
  const [bonusField, setBonusField] = useState<FormField | null>(null);
  const [bonusFieldValue, setBonusFieldValue] = useState<string>("");
  const [bonusFieldError, setBonusFieldError] = useState<string | null>(null);
  const [calculatedTurnover, setCalculatedTurnover] = useState<number | null>(null);
  const [tittle, setTittle] = useState<Tittle | null>(null);

  // Form state - will store all form field values dynamically
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [calculatedBonus, setCalculatedBonus] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  // Data from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [filteredInstructions, setFilteredInstructions] = useState<Instruction[]>([]);
  const [allFormFields, setAllFormFields] = useState<FormField[]>([]); // Store all fields
  const [filteredFormFields, setFilteredFormFields] = useState<FormField[]>([]); // Filtered by selection logic
  const [promotions, setPromotions] = useState<ExtendedPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  const walletAddress = "TEfuvvysBmXuUmBUxZGFM1J9a6LSVHGCP";

  // Reset when tab changes
  useEffect(() => {
    setSelectedPromotion(null);
    setCalculatedBonus(null);
    setMinDepositAmount(null);
    setMaxBonusAmount(null);
    setAmountError(null);
    setBonusFieldError(null);
    setBonusFieldValue("");
    setCalculatedTurnover(null);
    setSelectedMethod(null);
    setUploadStatus('idle');
    setUploadedFileUrl("");
    setAmountFieldName("");
    setAmountField(null);
    setBonusField(null);
    setTittle(null);
    setFormData({});
    setFilteredFormFields([]);
    setFilteredInstructions([]);
  }, [activeTab]);

  // Filter instructions based on selected payment method
  useEffect(() => {
    if (instructions.length > 0) {
      if (selectedMethod) {
        // Show instructions that are either:
        // 1. Linked to this payment method
        // 2. Not linked to any payment method
        const filtered = instructions.filter(instruction => 
          !instruction.paymentMethodId || instruction.paymentMethodId === selectedMethod._id
        );
        setFilteredInstructions(filtered.sort((a, b) => a.step - b.step));
      } else {
        // Show all instructions when no method selected
        setFilteredInstructions(instructions.sort((a, b) => a.step - b.step));
      }
    }
  }, [selectedMethod, instructions]);

  // Filter form fields based on selected payment method
  useEffect(() => {
    if (allFormFields.length > 0) {
      let fieldsToShow = [];
      
      if (selectedMethod) {
        // Show fields that are either:
        // 1. Linked to this payment method
        // 2. Not linked to any payment method
        fieldsToShow = allFormFields.filter(field => 
          !field.paymentMethodId || field.paymentMethodId === selectedMethod._id
        );
        
        console.log(`Showing fields for ${selectedMethod.name}:`, fieldsToShow);
      } else {
        // Show ALL fields when no method selected
        fieldsToShow = allFormFields;
        console.log("No method selected, showing all fields:", fieldsToShow);
      }
      
      setFilteredFormFields(fieldsToShow);
      
      // Initialize form data with empty strings or static values
      const initialData: Record<string, string> = {};
      fieldsToShow.forEach((field) => {
        // For static fields, pre-fill with staticValue
        if (field.type === 'static' && field.staticValue) {
          initialData[field.name] = field.staticValue;
        } else {
          initialData[field.name] = formData[field.name] || '';
        }
      });
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [selectedMethod, allFormFields]);

  // Fetch data based on active tab
  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // Find the amount field and bonus field whenever filtered form fields change
  useEffect(() => {
    if (filteredFormFields.length > 0) {
      console.log("Filtered form fields:", filteredFormFields);

      // Find amount field
      const amountField = filteredFormFields.find(f =>
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
        const numberField = filteredFormFields.find(f => f.type === 'number');
        if (numberField) {
          setAmountFieldName(numberField.name);
          setAmountField(numberField);
          console.log("Using first number field as amount:", numberField.name);
        }
      }

      // Find bonus field
      const bonusField = filteredFormFields.find(f => f.isBonusField === true);
      if (bonusField) {
        setBonusField(bonusField);
        console.log("Bonus field identified:", bonusField.name);
        // Set initial bonus field value from formData if exists
        if (formData[bonusField.name]) {
          setBonusFieldValue(formData[bonusField.name]);
        }
      }
    }
  }, [filteredFormFields]);

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

  // Validate bonus field value against max bonus
  useEffect(() => {
    if (bonusField && selectedPromotion?.maxBonus && bonusFieldValue) {
      const bonusValue = parseFloat(bonusFieldValue);
      if (!isNaN(bonusValue) && bonusValue > 0) {
        if (bonusValue > selectedPromotion.maxBonus) {
          setBonusFieldError(`Maximum bonus allowed is ৳${selectedPromotion.maxBonus}`);
        } else {
          setBonusFieldError(null);
        }
      } else {
        setBonusFieldError(null);
      }
    } else {
      setBonusFieldError(null);
    }
  }, [bonusFieldValue, selectedPromotion]);

  // Calculate turnover requirement for manual deposits only.
  useEffect(() => {
    if (activeTab !== "manual" || !selectedMethod || !amountFieldName) {
      setCalculatedTurnover(null);
      return;
    }

    const amount = Number(formData[amountFieldName]);
    const tournOverMultiplier = Number(selectedMethod.tournOver || 0);

    if (Number.isNaN(amount) || amount <= 0 || tournOverMultiplier <= 0) {
      setCalculatedTurnover(null);
      return;
    }

    setCalculatedTurnover(amount * tournOverMultiplier);
  }, [activeTab, selectedMethod, amountFieldName, formData]);

  // Update minDeposit and maxBonus when promotion changes
  useEffect(() => {
    if (selectedPromotion) {
      setMinDepositAmount(selectedPromotion.minDeposit || null);
      setMaxBonusAmount(selectedPromotion.maxBonus || null);
    } else {
      setMinDepositAmount(null);
      setMaxBonusAmount(null);
    }
  }, [selectedPromotion]);

  const fetchTabData = async () => {
    try {
      setLoading(true);

      // Fetch payment methods
      const methodsRes = await depositService.getPaymentMethodByTab(activeTab);
      console.log("Payment methods:", methodsRes);
      if (methodsRes?.success) {
        setPaymentMethods(methodsRes.data || []);
        if (methodsRes.data.length > 0) {
          setSelectedMethod(methodsRes.data[0]);
        }
      }

      // Fetch page title
      const tittleRes = await depositService.getActiveTittlesByTab(activeTab);
      console.log("Page title:", tittleRes);
      if (tittleRes?.success && tittleRes.data && tittleRes.data.length > 0) {
        setTittle(tittleRes.data[0]);
      }

      // Fetch instructions
      const instructionsRes = await depositService.getInstructionsByTab(activeTab);
      if (instructionsRes?.success) {
        setInstructions(instructionsRes.data || []);
      }

      // Fetch all form fields
      const fieldsRes = await depositService.getFormFieldsByTab(activeTab);
      console.log("All form fields received:", fieldsRes);

      if (fieldsRes?.success) {
        setAllFormFields(fieldsRes.data || []);
        // Initialize form data
        const initialData: Record<string, string> = {};
        fieldsRes.data.forEach((field: FormField) => {
          if (field.type === 'static' && field.staticValue) {
            initialData[field.name] = field.staticValue;
          } else {
            initialData[field.name] = '';
          }
        });
        setFormData(initialData);
        console.log("Initialized form data with fields:", Object.keys(initialData));
      }

      // Fetch promotions
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

    if (selectedPromotion.minDeposit && amount < selectedPromotion.minDeposit) {
      setCalculatedBonus(null);
      return;
    }

    let bonus = 0;
    if (selectedPromotion.type === 'PERCENT') {
      bonus = (amount * selectedPromotion.value) / 100;
    } else {
      bonus = selectedPromotion.value;
    }

    // Apply max bonus cap if exists
    if (selectedPromotion.maxBonus && bonus > selectedPromotion.maxBonus) {
      bonus = selectedPromotion.maxBonus;
    }

    setCalculatedBonus(bonus);
  };

  const handleSelectPromotion = (promo: ExtendedPromotion) => {
    if (promo.tab !== activeTab) {
      alert("This promotion is not available for the selected payment method");
      return;
    }

    // Check if promotion is linked to a specific payment method
    if (promo.paymentMethodId && selectedMethod) {
      const promoMethodId = typeof promo.paymentMethodId === 'object' 
        ? promo.paymentMethodId._id 
        : promo.paymentMethodId;
      
      if (promoMethodId !== selectedMethod._id) {
        alert(`This promotion is only available for a different payment method`);
        return;
      }
    }

    setSelectedPromotion(promo);
    setShowPromoDetails(false);

    if (promo.minDeposit) {
      alert(`Minimum deposit for ${promo.bonusName} is ৳${promo.minDeposit}`);
    }
    if (promo.maxBonus) {
      alert(`Maximum bonus for ${promo.bonusName} is ৳${promo.maxBonus}`);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedPromotion(null);
    setCalculatedBonus(null);
    setMinDepositAmount(null);
    setMaxBonusAmount(null);
    setAmountError(null);
    setBonusFieldError(null);
    setBonusFieldValue("");
    setCalculatedTurnover(null);
    setAmountFieldName("");
    setAmountField(null);
    setBonusField(null);
    setTittle(null);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log("Form data updated:", newData);
      return newData;
    });

    // Track bonus field value separately for validation
    if (bonusField && name === bonusField.name) {
      setBonusFieldValue(value);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');

    // Simulate upload - replace with actual ImageBB upload logic
    setTimeout(() => {
      const mockUrl = `https://i.ibb.co/example/uploaded-${Date.now()}.jpg`;
      setUploadedFileUrl(mockUrl);
      setUploadStatus('success');
      handleInputChange(fieldName, mockUrl);
      setTimeout(() => setUploadStatus('idle'), 3000);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting form with data:", formData);
    console.log("Filtered form fields:", filteredFormFields);

    const amountFieldObj = amountField || filteredFormFields.find(f =>
      f.name === 'Amount' ||
      f.name.toLowerCase() === 'amount' ||
      f.label.toLowerCase().includes('amount')
    );

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

    if (selectedPromotion && selectedPromotion.minDeposit && amount < selectedPromotion.minDeposit) {
      alert(`Minimum deposit for ${selectedPromotion.bonusName} is ৳${selectedPromotion.minDeposit}`);
      return;
    }

    // Validate bonus field against max bonus
    if (bonusField && selectedPromotion?.maxBonus && formData[bonusField.name]) {
      const bonusValue = parseFloat(formData[bonusField.name]);
      if (!isNaN(bonusValue) && bonusValue > 0) {
        if (bonusValue > selectedPromotion.maxBonus) {
          alert(`Maximum bonus allowed is ৳${selectedPromotion.maxBonus}. You entered ৳${bonusValue}`);
          return;
        }
      }
    }

    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }

    const missingFields = filteredFormFields
      .filter(f => f.required && !formData[f.name] && f.type !== 'static')
      .map(f => f.label);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);

      let localTurnoverRequired: number | null = null;

      const requestData: any = {
        depositType: activeTab,
        paymentMethod: selectedMethod.name,
        amount: amount,
        formData: formData,
      };

      if (activeTab === 'manual') {
        const tournOverMultiplier = Number(selectedMethod.tournOver || 0);
        if (tournOverMultiplier > 0) {
          const turnoverRequired = amount * tournOverMultiplier;
          localTurnoverRequired = turnoverRequired;
          requestData.turnoverMultiplier = tournOverMultiplier;
          requestData.turnoverRequired = turnoverRequired;
          requestData.formData = {
            ...formData,
            turnoverMultiplier: tournOverMultiplier,
            turnoverRequired,
          };
        }
      }

      if (selectedPromotion && calculatedBonus) {
        requestData.promotionId = selectedPromotion._id;
        requestData.promotionName = selectedPromotion.bonusName;
        requestData.promotionType = selectedPromotion.type;
        requestData.promotionValue = selectedPromotion.value;
        requestData.bonusAmount = calculatedBonus;
      }

      const screenshotField = filteredFormFields.find(f => f.type === 'screenshot');
      if (screenshotField && formData[screenshotField.name]) {
        requestData.screenshot = formData[screenshotField.name];
      }

      if (activeTab === 'crypto') {
        const txField = filteredFormFields.find(f =>
          f.name.toLowerCase().includes('transaction') ||
          f.label.toLowerCase().includes('transaction') ||
          f.name.toLowerCase().includes('tx')
        );
        if (txField && formData[txField.name]) {
          requestData.transactionId = formData[txField.name];
        }

        const walletField = filteredFormFields.find(f =>
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
        const senderField = filteredFormFields.find(f =>
          f.name.toLowerCase().includes('sender') ||
          f.label.toLowerCase().includes('sender') ||
          f.name.toLowerCase().includes('phone') ||
          f.name.toLowerCase().includes('number')
        );
        if (senderField && formData[senderField.name]) {
          requestData.senderNumber = formData[senderField.name];
        }

        const txField = filteredFormFields.find(f =>
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
        setSubmittedRequest({
          ...response.data,
          turnoverRequired: response.data?.turnoverRequired ?? localTurnoverRequired,
        });
        setShowSuccessModal(true);

        const initialData: Record<string, string> = {};
        allFormFields.forEach((field: FormField) => {
          if (field.type === 'static' && field.staticValue) {
            initialData[field.name] = field.staticValue;
          } else {
            initialData[field.name] = '';
          }
        });
        setFormData(initialData);
        setSelectedPromotion(null);
        setCalculatedBonus(null);
        setMinDepositAmount(null);
        setMaxBonusAmount(null);
        setAmountError(null);
        setBonusFieldError(null);
        setBonusFieldValue("");
        setCalculatedTurnover(null);
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

  const getFieldIcon = (field: FormField) => {
    if (field.isBonusField) return '';
    if (field.type === 'number') return <Hash className="w-4 h-4 text-gray-400" />;
    if (field.type === 'textarea') return <FileText className="w-4 h-4 text-gray-400" />;
    if (field.type === 'static') return <FileText className="w-4 h-4 text-blue-400" />;
    if (field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('sender'))
      return <Phone className="w-4 h-4 text-gray-400" />;
    if (field.name.toLowerCase().includes('name'))
      return <UserIcon className="w-4 h-4 text-gray-400" />;
    if (field.name.toLowerCase().includes('email'))
      return <Mail className="w-4 h-4 text-gray-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  const getMethodIcon = (method: PaymentMethod) => {
    if (method.icon) {
      return <img src={method.icon} alt={method.name} className="w-full h-full object-contain" />;
    }
    return <span className="text-xs font-bold text-black">{method.name.slice(0, 2).toUpperCase()}</span>;
  };

  const formatBonus = (promotion: ExtendedPromotion) => {
    if (promotion.type === 'PERCENT') {
      return `${promotion.value}%`;
    } else {
      return `৳${promotion.value}`;
    }
  };

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
          <Suspense fallback={<div>Loading...</div>}>
            <BackButton />
          </Suspense>
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
        <Suspense fallback={<div>Loading...</div>}>
          <BackButton />
        </Suspense>
        <h1 className="text-xl font-bold flex-1 text-center">Deposit</h1>
        <button
          onClick={() => router.push("/history")}
          className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50"
          title="View History"
        >
          <ClipboardClock className="w-5 h-5" />
        </button>
      </div>

      {/* Page Title Section */}
      {/* {tittle && tittle.isActive && (
        <div className="px-4 mt-2 mb-4">
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-4 border border-indigo-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <Type className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{tittle.title}</h2>
                <p className="text-gray-300 text-sm">{tittle.description}</p>
              </div>
            </div>
          </div>
        </div>
      )} */}

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
                {selectedPromotion.maxBonus && (
                  <span className="text-gray-300 ml-1">
                    (Max: ৳{selectedPromotion.maxBonus}) 
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedPromotion(null);
                setCalculatedBonus(null);
                setMinDepositAmount(null);
                setMaxBonusAmount(null);
                setAmountError(null);
                setBonusFieldError(null);
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
              {promotions.filter(p => p.isActive).map((promo, index) => {
                // Get payment method name if linked
                const promoMethod = typeof promo.paymentMethodId === 'object' 
                  ? promo.paymentMethodId 
                  : promo.paymentMethodId 
                    ? paymentMethods.find(m => m._id === promo.paymentMethodId)
                    : null;

                return (
                  <div
                    key={promo._id}
                    onClick={() => handleSelectPromotion(promo)}
                    className={`bg-gradient-to-r ${getPromoGradient(index)} p-[1px]  rounded-xl cursor-pointer transform hover:scale-[1.02] transition-all duration-200 ${
                      promo.paymentMethodId && selectedMethod && 
                      ((typeof promo.paymentMethodId === 'object' 
                        ? promo.paymentMethodId._id 
                        : promo.paymentMethodId) !== selectedMethod._id)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <div className="bg-[#252334] rounded-xl p-3 ">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getPromoGradient(index)} flex items-center justify-center`}>
                            {promo.type === 'PERCENT' ? (
                              <Percent className="w-5 h-5 text-white" />
                            ) : (
                              <Wallet className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="">
                            <h3 className="font-bold text-white">{promo.bonusName}</h3>
                            <div className="flex items-center  gap-2 text-sm flex-wrap">
                              <span className="text-pink-400 font-bold">{formatBonus(promo)}</span>
                              {promo.minDeposit && (
                                <>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-gray-300">Min: ৳{promo.minDeposit}</span>
                                </>
                              )}
                              {promo.maxBonus && (
                                <>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-gray-300">Max: ৳{promo.maxBonus}</span>
                                </>
                              )}
                            </div>
                            {promoMethod && (
                              <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                For: {promoMethod.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No Promotions Message */}
      {/* {promotions.filter(p => p.isActive).length === 0 && !selectedPromotion && (
        <div className="px-4 mt-2 mb-4">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400">No active bonuses available for this payment method</p>
          </div>
        </div>
      )} */}

      {/* Bonus Field Info */}
      {bonusField && (
        <div className="px-4 mt-2 mb-4">
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <p className="text-xs text-yellow-400">
              <span className="font-bold">Bonus Field:</span> The "{bonusField.label}" field will be used for bonus calculations.
            </p>
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

            {selectedMethod && Number(selectedMethod.tournOver || 0) > 0 && (
              <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-3">
                <p className="text-xs text-emerald-300">
                  Turnover Multiplier: {selectedMethod.tournOver}x
                </p>
                <p className="text-sm text-white mt-1">
                  Required Turnover: {calculatedTurnover ? `৳${calculatedTurnover.toFixed(2)}` : 'Enter amount to calculate'}
                </p>
              </div>
            )}

            {/* Instructions - Filtered by payment method */}
            {filteredInstructions.length > 0 && (
              <div className="bg-[#d5d7d7] rounded-xl p-4 border border-gray-700/50 mb-5">
                <ul className="space-y-2 text-sm text-black">
                  {filteredInstructions.map((instruction) => (
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
              {filteredFormFields.length > 0 ? (
                filteredFormFields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <div key={field._id}>
                      {field.type === 'static' ? (
                        // Static Field Display
                        <div className="bg-gray-700/50 rounded-xl p-3 border border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-300">{field.label}</p>
                                <p className="text-lg font-semibold text-white">{field.staticValue}</p>
                              </div>
                            </div>
                            {field.isCopyable && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(field.staticValue || '', field._id)}
                                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                {copiedField === field._id ? (
                                  <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Copy className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            )}
                          </div>
                          {field.isBonusField && (
                            <div className="mt-2 pt-2 border-t border-gray-600">
                              <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                <Star className="w-3 h-3" />
                                Bonus Field
                              </span>
                            </div>
                          )}
                        </div>
                      ) : field.type === 'screenshot' ? (
                        // Screenshot Field
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
                          {field.isBonusField && (
                            <div className="absolute -top-3 right-0">
                              <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Bonus
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Regular Input Field
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
                            max={field.isBonusField && maxBonusAmount ? maxBonusAmount : undefined}
                            className={`w-full bg-white border-0 rounded-xl pl-10 pr-4 py-3 text-black text-center text-lg placeholder-black focus:outline-none focus:ring-2 ${
                              (amountError && field.name === amountFieldName) || (bonusFieldError && field.isBonusField)
                                ? 'focus:ring-red-400 border-2 border-red-400' 
                                : 'focus:ring-green-400'
                            }`}
                          />
                          {field.name === amountFieldName && calculatedBonus && (
                            <div className="  left-0 right-0   text-center">
                              <span className="text-xs text-green-400 bg-green-900/30 px-2  rounded-full">
                                + ৳{calculatedBonus.toFixed(2)} bonus will be added
                                {maxBonusAmount && ` (Max: ৳${maxBonusAmount})`}
                              </span>
                            </div>
                          )}
                          {field.name === amountFieldName && amountError && (
                            <div className=" left-0 right-0 text-center mt-2">
                              <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded-full">
                                {amountError}
                              </span>
                            </div>
                          )}
                          {field.isBonusField && maxBonusAmount && (
                            <div className="absolute -top-3 left-0  text-center">
                              <span className="text-xs text-white  bg-yellow-600  px-2 py-1 rounded-full">
                                Max: ৳{maxBonusAmount}
                              </span>
                            </div>
                          )}
                          {field.isBonusField && bonusFieldError && (
                            <div className="  left-0 right-0 mb-0 text-center mt-2">
                              <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded-full">
                                {bonusFieldError}
                              </span>
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
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400">No form fields available</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || (selectedPromotion && !!amountError) || !!bonusFieldError || filteredFormFields.length === 0}
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

        {/* Auto Tab - Similar structure with max bonus validation */}
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

            {/* Instructions - Filtered by payment method */}
            {filteredInstructions.length > 0 && (
              <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50 mb-4 text-left">
                <ul className="space-y-2 text-sm text-gray-200">
                  {filteredInstructions.map((instruction) => (
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
              {filteredFormFields.length > 0 ? (
                filteredFormFields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <div key={field._id}>
                      {field.type === 'static' ? (
                        // Static Field Display for Auto Tab
                        <div className="bg-gray-700/50 rounded-xl p-3 border border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-300">{field.label}</p>
                                <p className="text-lg font-semibold text-white">{field.staticValue}</p>
                              </div>
                            </div>
                            {field.isCopyable && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(field.staticValue || '', field._id)}
                                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                {copiedField === field._id ? (
                                  <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Copy className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            )}
                          </div>
                          {field.isBonusField && (
                            <div className="mt-2 pt-2 border-t border-gray-600">
                              <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                <Star className="w-3 h-3" />
                                Bonus Field
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Regular Input Field
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
                            max={field.isBonusField && maxBonusAmount ? maxBonusAmount : undefined}
                            className={`w-full bg-[#fdfde8] border-0 rounded-xl pl-10 pr-4 py-4 text-black text-center text-xl placeholder-black border-2 ${
                              (amountError && field.name === amountFieldName) || (bonusFieldError && field.isBonusField)
                                ? 'border-red-400' 
                                : 'border-[#d12d4d]'
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
                          {field.isBonusField && maxBonusAmount && (
                            <div className="absolute -bottom-5 left-0 right-0 text-center">
                              <span className="text-xs text-blue-400">Max: ৳{maxBonusAmount}</span>
                            </div>
                          )}
                          {field.isBonusField && bonusFieldError && (
                            <div className="absolute -bottom-5 left-0 right-0 text-center">
                              <span className="text-xs text-red-400">{bonusFieldError}</span>
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
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400">No form fields available</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || (selectedPromotion && !!amountError) || !!bonusFieldError || filteredFormFields.length === 0}
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

        {/* Crypto Tab - Similar structure with max bonus validation */}
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

            {/* Instructions - Filtered by payment method */}
            {filteredInstructions.length > 0 && (
              <div className="bg-[#e6e5e5] rounded-xl p-4 mb-5">
                <ul className="space-y-2 text-sm text-black">
                  {filteredInstructions.map((instruction) => (
                    <li key={instruction._id} className="flex items-start gap-2">
                      <span className="text-black font-extrabold">•</span>
                      <span>{instruction.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Wallet Address */}
            {/* <div className="text-center mb-5">
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
            </div> */}

            {/* Dynamic Form Fields */}
            <div className="space-y-4 mt-5">
              {filteredFormFields.length > 0 ? (
                filteredFormFields
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

                    if (field.type === 'static') {
                      return (
                        <div key={field._id} className="bg-gray-700/50 rounded-xl p-3 border border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-300">{field.label}</p>
                                <p className="text-lg font-semibold text-white">{field.staticValue}</p>
                              </div>
                            </div>
                            {field.isCopyable && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(field.staticValue || '', field._id)}
                                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                {copiedField === field._id ? (
                                  <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Copy className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            )}
                          </div>
                          {field.isBonusField && (
                            <div className="mt-2 pt-2 border-t border-gray-600">
                              <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                <Star className="w-3 h-3" />
                                Bonus Field
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
                          max={field.isBonusField && maxBonusAmount ? maxBonusAmount : undefined}
                          className={`w-full bg-[#fdfde8] border-0 rounded-xl pl-10 pr-4 py-3 text-black border-2 ${
                            (amountError && field.name === amountFieldName) || (bonusFieldError && field.isBonusField)
                              ? 'border-red-400' 
                              : 'border-[#fc0613]'
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
                        {field.isBonusField && maxBonusAmount && (
                          <div className="absolute -bottom-5 left-0 right-0 text-center">
                            <span className="text-xs text-blue-400">Max: ৳{maxBonusAmount}</span>
                          </div>
                        )}
                        {field.isBonusField && bonusFieldError && (
                          <div className="absolute -bottom-5 left-0 right-0 text-center">
                            <span className="text-xs text-red-400">{bonusFieldError}</span>
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
                  })
              ) : (
                <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400">No form fields available</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || (selectedPromotion && !!amountError) || !!bonusFieldError || filteredFormFields.length === 0}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
              {(submittedRequest.turnoverRequired ?? calculatedTurnover ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Turnover:</span>
                  <span className="text-emerald-400 font-bold">
                    ৳{Number(submittedRequest.turnoverRequired ?? calculatedTurnover).toFixed(2)}
                  </span>
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