/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface PaymentMethod {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  tab: string; // 'manual', 'auto', 'crypto'
  description?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethodData {
  name: string;
  slug: string;
  icon: string;
  tab: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface Instruction {
  _id: string;
  step: number;
  text: string;
  tab: string; // 'manual', 'auto', 'crypto'
  isActive: boolean;
}

export interface InstructionData {
  step: number;
  text: string;
  tab: string;
  isActive?: boolean;
}

export interface FormField {
  _id: string;
  label: string;
  name: string;
  tab: string;
  type: 'text' | 'number' | 'textarea'|'screenshot';
  placeholder?: string;
  required: boolean;
  order: number;
  paymentMethodId?: string;
  isActive: boolean;
}

export interface FormFieldData {
  label: string;
  name: string;
  tab: string;
  type: 'text' | 'number' | 'textarea'|'screenshot';
  placeholder?: string;
  required?: boolean;
  order?: number;
  paymentMethodId?: string;
  isActive?: boolean;
}
// ========== NEW: TITTLE/TITLE INTERFACES ==========
export interface Tittle {
  _id: string;
  title: string;
  description: string;
  tab: string; // 'manual', 'auto', 'crypto'
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TittleData {
  title: string;
  description: string;
  tab: string;
  isActive?: boolean;
}

export const depositService = {
  // ========== PAYMENT METHODS ==========
  async getAllPaymentMethods() {
    const response = await api.get("/payment-methods/all");
    return response?.data;
  },

  async getActivePaymentMethods() {
    const response = await api.get("/payment-methods");
    return response?.data;
  },

  async getPaymentMethodByTab(tab: string) {
    const response = await api.get(`/payment-methods/tab/${tab}`);
    return response?.data;
  },

  async createPaymentMethod(data: PaymentMethodData) {
    const response = await api.post("/payment-methods", data);
    return response?.data;
  },

  async updatePaymentMethod(id: string, data: Partial<PaymentMethodData>) {
    const response = await api.put(`/payment-methods/${id}`, data);
    return response?.data;
  },

  async deletePaymentMethod(id: string) {
    const response = await api.delete(`/payment-methods/${id}`);
    return response?.data;
  },

  // ========== INSTRUCTIONS ==========
  async getAllInstructions() {
    const response = await api.get("/payment-methods/instruction/get");
    return response?.data;
  },

  async getInstructionsByTab(tab: string) {
    const response = await api.get(`/payment-methods/instruction/tab/${tab}`);
    return response?.data;
  },

  async createInstruction(data: InstructionData) {
    const response = await api.post("/payment-methods/instruction", data);
    return response?.data;
  },

  async updateInstruction(id: string, data: Partial<InstructionData>) {
    const response = await api.put(`/payment-methods/instruction/${id}`, data);
    return response?.data;
  },

  async deleteInstruction(id: string) {
    const response = await api.delete(`/payment-methods/instruction/${id}`);
    return response?.data;
  },

  // ========== FORM FIELDS ==========
  async getFormFields(paymentMethodId?: string) {
    const url = paymentMethodId 
      ? `/input/${paymentMethodId}` 
      : "/input";
    const response = await api.get(url);
    return response?.data;
  },

  async getFormFieldsByTab(tab: string) {
    const response = await api.get(`/input/tab/${tab}`);
    return response?.data;
  },

  async createFormField(data: FormFieldData) {
    const response = await api.post("/input", data);
    return response?.data;
  },

  async updateFormField(id: string, data: Partial<FormFieldData>) {
    const response = await api.put(`/input/${id}`, data);
    return response?.data;
  },

  async deleteFormField(id: string) {
    const response = await api.delete(`/input/${id}`);
    return response?.data;
  },

    // ========== NEW: TITTLE/TITLE METHODS ==========
  // Admin: Get all tittles
  async getAllTittles() {
    const response = await api.get("/payment-methods/tittle");
    return response?.data;
  },

  // Admin: Create tittle
  async createTittle(data: TittleData) {
    const response = await api.post("/payment-methods/tittle", data);
    return response?.data;
  },

  // Admin: Update tittle
  async updateTittle(id: string, data: Partial<TittleData>) {
    const response = await api.patch(`/payment-methods/tittle/${id}`, data);
    return response?.data;
  },

  // Admin: Delete tittle
  async deleteTittle(id: string) {
    const response = await api.delete(`/payment-methods/tittle/${id}`);
    return response?.data;
  },

  // Frontend: Get active tittles by tab
  async getActiveTittlesByTab(tab: string) {
    const response = await api.get(`/payment-methods/active/${tab}`);
    return response?.data;
  },

  // Frontend: Get single tittle by id
  async getSingleTittle(id: string) {
    const response = await api.get(`/payment-methods/tittle/${id}`);
    return response?.data;
  },
};