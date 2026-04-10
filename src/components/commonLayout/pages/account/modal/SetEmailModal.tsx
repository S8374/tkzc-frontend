// components/modals/SetEmailModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Lock, 
  Mail, 
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { accountService } from "@/services/api/account.service";

interface SetEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetEmailModal({ isOpen, onClose }: SetEmailModalProps) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your login password");
      return;
    }

    try {
      setSubmitting(true);
      await accountService.updateCurrentUser({
        email: email.trim(),
        currentPassword: password,
      });
      toast.success("Email updated successfully");
      setPassword("");
      setEmail("");
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update email");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-t-2xl overflow-hidden bg-[#1E1D2A] border-t-4 border-gray-800"
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-2 border-b border-gray-800">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/40 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">Set email</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Login Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Please enter log in password"
              className="w-full pl-10 pr-4 py-3 bg-[#252334] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter email"
              className="w-full pl-10 pr-4 py-3 bg-[#252334] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-[#252334] rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm">
              In order to protect your account and fund security, please bind the email
            </p>
          </div>

          {/* Commit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-linear-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Commit"}
          </button>
        </form>

        {/* Bottom padding */}
        <div className="h-6"></div>
      </div>
    </div>
  );
}