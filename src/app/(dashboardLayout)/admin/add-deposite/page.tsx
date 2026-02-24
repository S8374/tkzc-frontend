// app/admin/payment-methods/manage/page.tsx
"use client";

import { useState } from "react";

export default function ManageDepositPaymentMethodsPage() {
  const [formData, setFormData] = useState({
    methodNameEn: "",
    methodNameBn: "",
    agentWalletNumber: "",
    agentWalletText: "",
    methodImage: null as File | null,
    paymentPageImage: null as File | null,
    // You can add more fields like textColor, bgColor, gateways later
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: Integrate with API / server action
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Manage Deposit Payment Methods
        </h1>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-teal-400 text-sm font-medium mb-2">
                Method Name (English)
              </label>
              <input
                type="text"
                name="methodNameEn"
                value={formData.methodNameEn}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., bKash"
              />
            </div>

            <div>
              <label className="block text-teal-400 text-sm font-medium mb-2">
                Method Name (Bangla)
              </label>
              <input
                type="text"
                name="methodNameBn"
                value={formData.methodNameBn}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="যেমন: বিকাশ"
              />
            </div>

            <div>
              <label className="block text-teal-400 text-sm font-medium mb-2">
                Agent Wallet Number
              </label>
              <input
                type="text"
                name="agentWalletNumber"
                value={formData.agentWalletNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., 017XXXXXXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-teal-400 text-sm font-medium mb-2">
                Agent Wallet Text
              </label>
              <textarea
                name="agentWalletText"
                value={formData.agentWalletText}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Instructions or notes for users (e.g., 'Send money to this number')"
              />
            </div>

            <div>
              <label className="block text-teal-400 text-sm font-medium mb-2">
                Method Image
              </label>
              <div className="flex items-center">
                <label className="flex-1 cursor-pointer px-4 py-3 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-center transition-colors flex items-center justify-center gap-2">
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "methodImage")}
                    className="hidden"
                  />
                </label>
                <span className="ml-3 text-gray-400 text-sm truncate max-w-[150px]">
                  {formData.methodImage ? formData.methodImage.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-teal-400 text-sm font-medium mb-2">
              Payment Page Image (optional)
            </label>
            <div className="flex items-center">
              <label className="flex-1 cursor-pointer px-4 py-3 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-center transition-colors flex items-center justify-center gap-2">
                <span>Choose File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "paymentPageImage")}
                  className="hidden"
                />
              </label>
              <span className="ml-3 text-gray-400 text-sm truncate max-w-[150px]">
                {formData.paymentPageImage ? formData.paymentPageImage.name : "No file chosen"}
              </span>
            </div>
          </div>

          {/* Optional: Add more sections (Gateways, Text Color, Background Color) below if needed */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-teal-400 text-sm font-medium mb-2">Gateways</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Comma-separated gateway IDs"
              />
            </div>
            <div>
              <label className="block text-teal-400 text-sm font-medium mb-2">Text Color</label>
              <input
                type="color"
                className="w-full h-10 rounded-lg border border-gray-700 bg-gray-900"
                defaultValue="#26d3b2"
              />
            </div>
          </div> */}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => setFormData(initialState)}
              className="px-5 py-2.5 text-gray-300 hover:text-white rounded-lg border border-gray-600 hover:bg-gray-700 transition"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const initialState = {
  methodNameEn: "",
  methodNameBn: "",
  agentWalletNumber: "",
  agentWalletText: "",
  methodImage: null,
  paymentPageImage: null,
};