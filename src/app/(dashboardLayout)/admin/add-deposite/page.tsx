/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  CreditCard,
  BookOpen,
  FileText,
  Gift,
  Percent,
  Coins,
  Calendar,
  X,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { depositService } from "@/services/api/deposit.service";
import { promotionService, Promotion } from "@/services/api/promotion.service";

type TabType = 'manual' | 'auto' | 'crypto';

interface PaymentMethod {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  tab: TabType;
  description?: string;
  order: number;
  isActive: boolean;
}

interface Instruction {
  _id: string;
  step: number;
  text: string;
  tab: TabType;
  isActive: boolean;
}

interface FormField {
  _id: string;
  label: string;
  name: string;
  tab: TabType;
  type: 'text' | 'number' | 'textarea' | 'screenshot';
  placeholder?: string;
  required: boolean;
  order: number;
  paymentMethodId?: string;
  isActive: boolean;
}

export default function DepositManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [methodForm, setMethodForm] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    order: 0,
    isActive: true
  });

  const [instructionForm, setInstructionForm] = useState({
    step: 1,
    text: '',
    isActive: true
  });

  const [fieldForm, setFieldForm] = useState({
    label: '',
    name: '',
    type: 'text' as const,
    placeholder: '',
    required: false,
    order: 0,
    paymentMethodId: undefined as string | undefined,
    isActive: true
  });

  const [promotionForm, setPromotionForm] = useState({
    bonusName: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    value: 0,
    minDeposit: undefined as number | undefined,
    // maxBonus: undefined as number | undefined,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
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

  // ========== PAYMENT METHOD HANDLERS ==========
  const handleCreateMethod = async () => {
    try {
      await depositService.createPaymentMethod({
        ...methodForm,
        tab: activeTab,
        slug: methodForm.slug || methodForm.name.toLowerCase().replace(/\s+/g, '-')
      });
      setShowMethodModal(false);
      resetMethodForm();
      fetchData();
    } catch (error) {
      console.error("Error creating payment method:", error);
      alert("Failed to create payment method");
    }
  };

  const handleUpdateMethod = async () => {
    if (!editingItem) return;
    try {
      await depositService.updatePaymentMethod(editingItem._id, methodForm);
      setShowMethodModal(false);
      setEditingItem(null);
      resetMethodForm();
      fetchData();
    } catch (error) {
      console.error("Error updating payment method:", error);
      alert("Failed to update payment method");
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    try {
      await depositService.deletePaymentMethod(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      alert("Failed to delete payment method");
    }
  };

  const handleToggleMethodActive = async (method: PaymentMethod) => {
    try {
      await depositService.updatePaymentMethod(method._id, {
        isActive: !method.isActive
      });
      fetchData();
    } catch (error) {
      console.error("Error toggling method status:", error);
      alert("Failed to update method status");
    }
  };

  // ========== INSTRUCTION HANDLERS ==========
  const handleCreateInstruction = async () => {
    try {
      await depositService.createInstruction({
        ...instructionForm,
        tab: activeTab
      });
      setShowInstructionModal(false);
      resetInstructionForm();
      fetchData();
    } catch (error) {
      console.error("Error creating instruction:", error);
      alert("Failed to create instruction");
    }
  };

  const handleUpdateInstruction = async () => {
    if (!editingItem) return;
    try {
      await depositService.updateInstruction(editingItem._id, instructionForm);
      setShowInstructionModal(false);
      setEditingItem(null);
      resetInstructionForm();
      fetchData();
    } catch (error) {
      console.error("Error updating instruction:", error);
      alert("Failed to update instruction");
    }
  };

  const handleDeleteInstruction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this instruction?")) return;
    try {
      await depositService.deleteInstruction(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting instruction:", error);
      alert("Failed to delete instruction");
    }
  };

  const handleToggleInstructionActive = async (instruction: Instruction) => {
    try {
      await depositService.updateInstruction(instruction._id, {
        isActive: !instruction.isActive
      });
      fetchData();
    } catch (error) {
      console.error("Error toggling instruction status:", error);
      alert("Failed to update instruction status");
    }
  };

  // ========== FORM FIELD HANDLERS ==========
  const handleCreateField = async () => {
    try {
      const fieldData: any = {
        label: fieldForm.label,
        name: fieldForm.name,
        tab: activeTab,
        type: fieldForm.type,
        placeholder: fieldForm.placeholder,
        required: fieldForm.required,
        order: fieldForm.order,
        isActive: fieldForm.isActive
      };

      if (fieldForm.paymentMethodId && fieldForm.paymentMethodId.trim() !== '') {
        fieldData.paymentMethodId = fieldForm.paymentMethodId;
      }

      await depositService.createFormField(fieldData);
      setShowFieldModal(false);
      resetFieldForm();
      fetchData();
    } catch (error) {
      console.error("Error creating form field:", error);
      alert("Failed to create form field");
    }
  };

  const handleUpdateField = async () => {
    if (!editingItem) return;
    try {
      const fieldData: any = {
        label: fieldForm.label,
        name: fieldForm.name,
        type: fieldForm.type,
        placeholder: fieldForm.placeholder,
        required: fieldForm.required,
        order: fieldForm.order,
        isActive: fieldForm.isActive
      };

      if (fieldForm.paymentMethodId && fieldForm.paymentMethodId.trim() !== '') {
        fieldData.paymentMethodId = fieldForm.paymentMethodId;
      }

      await depositService.updateFormField(editingItem._id, fieldData);
      setShowFieldModal(false);
      setEditingItem(null);
      resetFieldForm();
      fetchData();
    } catch (error) {
      console.error("Error updating form field:", error);
      alert("Failed to update form field");
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form field?")) return;
    try {
      await depositService.deleteFormField(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting form field:", error);
      alert("Failed to delete form field");
    }
  };

  const handleToggleFieldActive = async (field: FormField) => {
    try {
      await depositService.updateFormField(field._id, {
        isActive: !field.isActive
      });
      fetchData();
    } catch (error) {
      console.error("Error toggling field status:", error);
      alert("Failed to update field status");
    }
  };

  // ========== PROMOTION HANDLERS ==========
  const handleCreatePromotion = async () => {
    try {
      await promotionService.createPromotion({
        ...promotionForm,
        tab: activeTab,
        value: Number(promotionForm.value),
        minDeposit: promotionForm.minDeposit ? Number(promotionForm.minDeposit) : undefined,
        maxBonus: promotionForm.maxBonus ? Number(promotionForm.maxBonus) : undefined
      });
      setShowPromotionModal(false);
      resetPromotionForm();
      fetchData();
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert("Failed to create promotion");
    }
  };

  const handleUpdatePromotion = async () => {
    if (!editingItem) return;
    try {
      await promotionService.updatePromotion(editingItem._id, {
        ...promotionForm,
        value: Number(promotionForm.value),
        minDeposit: promotionForm.minDeposit ? Number(promotionForm.minDeposit) : undefined,
        maxBonus: promotionForm.maxBonus ? Number(promotionForm.maxBonus) : undefined
      });
      setShowPromotionModal(false);
      setEditingItem(null);
      resetPromotionForm();
      fetchData();
    } catch (error) {
      console.error("Error updating promotion:", error);
      alert("Failed to update promotion");
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await promotionService.deletePromotion(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("Failed to delete promotion");
    }
  };

  const handleTogglePromotionActive = async (promotion: Promotion) => {
    try {
      await promotionService.updatePromotion(promotion._id, {
        isActive: !promotion.isActive
      });
      fetchData();
    } catch (error) {
      console.error("Error toggling promotion status:", error);
      alert("Failed to update promotion status");
    }
  };

  // ========== UTILITY FUNCTIONS ==========
  const resetMethodForm = () => {
    setMethodForm({
      name: '',
      slug: '',
      icon: '',
      description: '',
      order: 0,
      isActive: true
    });
  };

  const resetInstructionForm = () => {
    setInstructionForm({
      step: instructions.length + 1,
      text: '',
      isActive: true
    });
  };

  const resetFieldForm = () => {
    setFieldForm({
      label: '',
      name: '',
      type: 'text',
      placeholder: '',
      required: false,
      order: formFields.length,
      paymentMethodId: undefined,
      isActive: true
    });
  };

  const resetPromotionForm = () => {
    setPromotionForm({
      bonusName: '',
      type: 'PERCENT',
      value: 0,
      minDeposit: undefined,
      maxBonus: undefined,
      isActive: true,
      startDate: '',
      endDate: ''
    });
  };

  const openEditMethod = (method: PaymentMethod) => {
    setEditingItem(method);
    setMethodForm({
      name: method.name,
      slug: method.slug,
      icon: method.icon,
      description: method.description || '',
      order: method.order,
      isActive: method.isActive
    });
    setShowMethodModal(true);
  };

  const openEditInstruction = (instruction: Instruction) => {
    setEditingItem(instruction);
    setInstructionForm({
      step: instruction.step,
      text: instruction.text,
      isActive: instruction.isActive
    });
    setShowInstructionModal(true);
  };

  const openEditField = (field: FormField) => {
    setEditingItem(field);
    setFieldForm({
      label: field.label,
      name: field.name,
      type: field.type,
      placeholder: field.placeholder || '',
      required: field.required,
      order: field.order,
      paymentMethodId: field.paymentMethodId,
      isActive: field.isActive
    });
    setShowFieldModal(true);
  };

  const openEditPromotion = (promotion: Promotion) => {
    setEditingItem(promotion);
    setPromotionForm({
      bonusName: promotion.bonusName,
      type: promotion.type,
      value: promotion.value,
      minDeposit: promotion.minDeposit,
      maxBonus: promotion.maxBonus,
      isActive: promotion.isActive,
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : ''
    });
    setShowPromotionModal(true);
  };

  const formatBonus = (promotion: Promotion) => {
    if (promotion.type === 'PERCENT') {
      return `${promotion.value}%`;
    } else {
      return `৳${promotion.value}`;
    }
  };

  const tabLabels = {
    manual: "BDT - Manual",
    auto: "Auto Deposit",
    crypto: "Crypto Deposit"
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
        <h1 className="text-2xl font-bold text-white mb-6">Deposit Management</h1>

        {/* Tab Navigation */}
        <div className="px-4 pt-5 pb-3 bg-gray-800 rounded-t-lg">
          <div className="grid grid-cols-3 gap-2 bg-[#252334] rounded-xl p-1.5 border border-gray-800/60">
            {(Object.keys(tabLabels) as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-black/30"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-gray-800 rounded-b-lg p-6 space-y-8">
          {/* Promotions / Bonuses Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-500" />
                Promotions & Bonuses
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetPromotionForm();
                  setShowPromotionModal(true);
                }}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Bonus
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.map((promotion) => (
                <div
                  key={promotion._id}
                  className={`bg-gray-700 rounded-lg p-4 border ${
                    promotion.isActive ? 'border-pink-600/50' : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-pink-400" />
                        <h3 className="text-white font-semibold">{promotion.bonusName}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {promotion.type === 'PERCENT' ? (
                          <Percent className="w-4 h-4 text-blue-400" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-green-400" />
                        )}
                        <span className="text-2xl font-bold text-white">
                          {formatBonus(promotion)}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm">
                        {promotion.minDeposit && (
                          <p className="text-gray-300">
                            Min Deposit: <span className="text-yellow-400">৳{promotion.minDeposit}</span>
                          </p>
                        )}
                        {promotion.maxBonus && (
                          <p className="text-gray-300">
                            Max Bonus: <span className="text-green-400">৳{promotion.maxBonus}</span>
                          </p>
                        )}
                      </div>

                      {(promotion.startDate || promotion.endDate) && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {promotion.startDate && <span>{new Date(promotion.startDate).toLocaleDateString()}</span>}
                          {promotion.startDate && promotion.endDate && <span>-</span>}
                          {promotion.endDate && <span>{new Date(promotion.endDate).toLocaleDateString()}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleTogglePromotionActive(promotion)}
                        className={`p-2 rounded-lg ${
                          promotion.isActive ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <Power className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => openEditPromotion(promotion)}
                        className="p-2 bg-blue-600 rounded-lg"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDeletePromotion(promotion._id)}
                        className="p-2 bg-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {promotions.length === 0 && (
                <div className="col-span-2 text-center py-8 bg-gray-750 rounded-lg border border-dashed border-gray-600">
                  <Gift className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No promotions for {tabLabels[activeTab]}</p>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      resetPromotionForm();
                      setShowPromotionModal(true);
                    }}
                    className="mt-3 text-pink-400 hover:text-pink-300 text-sm"
                  >
                    + Add your first bonus
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetMethodForm();
                  setShowMethodModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Method
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {method.icon && (
                        <img src={method.icon} alt={method.name} className="w-10 h-10 rounded" />
                      )}
                      <div>
                        <h3 className="text-white font-semibold">{method.name}</h3>
                        <p className="text-sm text-gray-400">Slug: {method.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleMethodActive(method)}
                        className={`p-2 rounded-lg ${
                          method.isActive ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <Power className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => openEditMethod(method)}
                        className="p-2 bg-blue-600 rounded-lg"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteMethod(method._id)}
                        className="p-2 bg-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  {method.description && (
                    <p className="text-gray-300 text-sm mt-2">{method.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Order: {method.order}</p>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <p className="text-gray-400 col-span-2 text-center py-8">
                  No payment methods for {tabLabels[activeTab]}
                </p>
              )}
            </div>
          </div>

          {/* Instructions Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Instructions
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetInstructionForm();
                  setShowInstructionModal(true);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Instruction
              </button>
            </div>

            <div className="space-y-3">
              {instructions.sort((a, b) => a.step - b.step).map((instruction) => (
                <div
                  key={instruction._id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">
                      {instruction.step}
                    </div>
                    <p className="text-white flex-1">{instruction.text}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleInstructionActive(instruction)}
                      className={`p-2 rounded-lg ${
                        instruction.isActive ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <Power className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => openEditInstruction(instruction)}
                      className="p-2 bg-blue-600 rounded-lg"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteInstruction(instruction._id)}
                      className="p-2 bg-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {instructions.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No instructions for {tabLabels[activeTab]}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Form Fields
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetFieldForm();
                  setShowFieldModal(true);
                }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {formFields.sort((a, b) => a.order - b.order).map((field) => (
                <div
                  key={field._id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold">{field.label}</h3>
                        <span className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="text-xs bg-red-600 px-2 py-1 rounded text-white">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Name: {field.name}</p>
                      {field.placeholder && (
                        <p className="text-sm text-gray-400">Placeholder: {field.placeholder}</p>
                      )}
                      {field.paymentMethodId && (
                        <p className="text-xs text-blue-400 mt-1">
                          Linked to Payment Method: {field.paymentMethodId}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Order: {field.order}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleFieldActive(field)}
                        className={`p-2 rounded-lg ${
                          field.isActive ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <Power className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => openEditField(field)}
                        className="p-2 bg-blue-600 rounded-lg"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field._id)}
                        className="p-2 bg-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {formFields.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No form fields for {tabLabels[activeTab]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              <button onClick={() => setShowMethodModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingItem ? handleUpdateMethod() : handleCreateMethod();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={methodForm.name}
                  onChange={(e) => setMethodForm({...methodForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                <input
                  type="text"
                  value={methodForm.slug}
                  onChange={(e) => setMethodForm({...methodForm, slug: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Auto-generated from name if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Icon URL</label>
                <input
                  type="url"
                  value={methodForm.icon}
                  onChange={(e) => setMethodForm({...methodForm, icon: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={methodForm.description}
                  onChange={(e) => setMethodForm({...methodForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Order</label>
                <input
                  type="number"
                  value={methodForm.order}
                  onChange={(e) => setMethodForm({...methodForm, order: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="methodActive"
                  checked={methodForm.isActive}
                  onChange={(e) => setMethodForm({...methodForm, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600"
                />
                <label htmlFor="methodActive" className="ml-2 text-sm text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMethodModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instruction Modal */}
      {showInstructionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Instruction' : 'Add Instruction'}
              </h3>
              <button onClick={() => setShowInstructionModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingItem ? handleUpdateInstruction() : handleCreateInstruction();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Step Number *</label>
                <input
                  type="number"
                  value={instructionForm.step}
                  onChange={(e) => setInstructionForm({...instructionForm, step: parseInt(e.target.value) || 1})}
                  min="1"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Instruction Text *</label>
                <textarea
                  value={instructionForm.text}
                  onChange={(e) => setInstructionForm({...instructionForm, text: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="instructionActive"
                  checked={instructionForm.isActive}
                  onChange={(e) => setInstructionForm({...instructionForm, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600"
                />
                <label htmlFor="instructionActive" className="ml-2 text-sm text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInstructionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Form Field' : 'Add Form Field'}
              </h3>
              <button onClick={() => setShowFieldModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingItem ? handleUpdateField() : handleCreateField();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Label *</label>
                <input
                  type="text"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm({...fieldForm, label: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Field Name *</label>
                <input
                  type="text"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({...fieldForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Field Type *</label>
                <select
                  value={fieldForm.type}
                  onChange={(e) => setFieldForm({...fieldForm, type: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="textarea">Textarea</option>
                  <option value="screenshot">Screenshot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Placeholder</label>
                <input
                  type="text"
                  value={fieldForm.placeholder}
                  onChange={(e) => setFieldForm({...fieldForm, placeholder: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Order</label>
                <input
                  type="number"
                  value={fieldForm.order}
                  onChange={(e) => setFieldForm({...fieldForm, order: parseInt(e.target.value) || 0})}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              {paymentMethods.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Link to Payment Method (Optional)
                  </label>
                  <select
                    value={fieldForm.paymentMethodId || ''}
                    onChange={(e) => setFieldForm({
                      ...fieldForm, 
                      paymentMethodId: e.target.value || undefined
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">None</option>
                    {paymentMethods.map((method) => (
                      <option key={method._id} value={method._id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="fieldRequired"
                  checked={fieldForm.required}
                  onChange={(e) => setFieldForm({...fieldForm, required: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600"
                />
                <label htmlFor="fieldRequired" className="ml-2 text-sm text-gray-300">
                  Required Field
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="fieldActive"
                  checked={fieldForm.isActive}
                  onChange={(e) => setFieldForm({...fieldForm, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600"
                />
                <label htmlFor="fieldActive" className="ml-2 text-sm text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Edit Promotion' : 'Add New Promotion'}
              </h3>
              <button onClick={() => setShowPromotionModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingItem ? handleUpdatePromotion() : handleCreatePromotion();
            }} className="space-y-4">
              {/* Bonus Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bonus Name *</label>
                <input
                  type="text"
                  value={promotionForm.bonusName}
                  onChange={(e) => setPromotionForm({...promotionForm, bonusName: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Eid Bonus, Welcome Bonus"
                  required
                />
              </div>

              {/* Bonus Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bonus Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      promotionForm.type === 'PERCENT'
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="PERCENT"
                      checked={promotionForm.type === 'PERCENT'}
                      onChange={(e) => setPromotionForm({...promotionForm, type: e.target.value as 'PERCENT'})}
                      className="hidden"
                    />
                    <Percent className="w-4 h-4 text-blue-400" />
                    <span className="text-white">Percentage</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      promotionForm.type === 'FIXED'
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="FIXED"
                      checked={promotionForm.type === 'FIXED'}
                      onChange={(e) => setPromotionForm({...promotionForm, type: e.target.value as 'FIXED'})}
                      className="hidden"
                    />
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-white">Fixed Amount</span>
                  </label>
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {promotionForm.type === 'PERCENT' ? 'Percentage Value *' : 'Fixed Amount (BDT) *'}
                </label>
                <div className="relative">
                  {promotionForm.type === 'PERCENT' ? (
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                  <input
                    type="number"
                    value={promotionForm.value}
                    onChange={(e) => setPromotionForm({...promotionForm, value: parseFloat(e.target.value) || 0})}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder={promotionForm.type === 'PERCENT' ? "e.g., 10" : "e.g., 50"}
                    min="0"
                    step={promotionForm.type === 'PERCENT' ? "0.1" : "1"}
                    required
                  />
                </div>
              </div>

              {/* Min Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Minimum Deposit (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={promotionForm.minDeposit || ''}
                    onChange={(e) => setPromotionForm({
                      ...promotionForm, 
                      minDeposit: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g., 500"
                    min="0"
                  />
                </div>
              </div>

              {/* Max Bonus
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Maximum Bonus (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={promotionForm.maxBonus || ''}
                    onChange={(e) => setPromotionForm({
                      ...promotionForm, 
                      maxBonus: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g., 200"
                    min="0"
                  />
                </div>
              </div> */}

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={promotionForm.startDate}
                    onChange={(e) => setPromotionForm({...promotionForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={promotionForm.endDate}
                    onChange={(e) => setPromotionForm({...promotionForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="promotionActive"
                  checked={promotionForm.isActive}
                  onChange={(e) => setPromotionForm({...promotionForm, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600"
                />
                <label htmlFor="promotionActive" className="ml-2 text-sm text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPromotionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}