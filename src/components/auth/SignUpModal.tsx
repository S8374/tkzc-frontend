/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { authService } from "@/services/api/auth.services";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: () => void;
  onSwitchToLogin?: () => void; // Add this prop
}

export default function SignUpModal({ 
  isOpen, 
  onClose, 
  onRegisterSuccess,
  onSwitchToLogin 
}: SignUpModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [imHuman, setImHuman] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close on ESC or click outside
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

  const handleRegister = async () => {
    if (!name || !password || !confirmPassword) {
      return toast.error(t('auth.allFieldsRequired', 'All fields are required'));
    }

    if (password !== confirmPassword) {
      return toast.error(t('auth.passwordsDoNotMatch', 'Passwords do not match'));
    }

    if (!imHuman) {
      return toast.error(t('auth.verifyHuman', 'Please verify you are human'));
    }

    try {
      setLoading(true);

      const res = await authService.register({
        name,
        password,
        referralCode,
        imHuman: true,
      });

      if (res?.success) {
        onRegisterSuccess();
        toast.success(t('auth.registerSuccess', 'Registration successful 🎉'));
        onClose();
        router.push("/deposit");
      }

    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('auth.registerFailed', 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    onClose(); // Close sign up modal
    if (onSwitchToLogin) {
      onSwitchToLogin(); // Open login modal
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        ref={modalRef}
        className="relative w-full bg-no-repeat bg-cover max-w-md rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl"
        style={{
          backgroundImage:
            "url('https://img.tkzc886.com/imgcn/tkzc/bg_login.webp')",
        }}
      >
        {/* Gold Wave Header */}
        <div className="relative h-16">
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <h2 className="text-2xl font-bold text-white">{t('auth.welcomeRegister', 'Welcome Register')}</h2>
            <p className="text-gray-200 text-sm mt-1">
              {t('auth.haveAccount', 'Already have an account?')}{" "}
              <button 
                onClick={handleLoginClick}
                className="text-yellow-300 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                {t('auth.logIn', 'Log in')}
              </button>
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Username */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('auth.enterUsername', 'Enter username')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="password"
              placeholder={t('auth.enterPassword', 'Enter password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="password"
              placeholder={t('auth.confirmPassword', 'Confirm password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Referral Code */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.707 4.468a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.468.707a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.827 18 2 12.172 2 5V3z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('auth.referralCodeOptional', 'Referral code (optional)')}
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            {loading ? t('auth.registering', 'Registering...') : t('auth.register', 'REGISTER')}
          </button>

          {/* I am human */}
          <div
            onClick={() => setShowCaptcha(true)}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center">
              {imHuman && (
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              )}
            </div>
            <span className="text-gray-300">{t('auth.iAmHuman', 'I am human')}</span>
          </div>

          {/* CAPTCHA */}
          {showCaptcha && (
            <div className="flex justify-center mt-3">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                onChange={() => {
                  setImHuman(true);
                  toast.success(t('auth.humanVerified', 'Human verified ✅'));
                }}
              />
            </div>
          )}

          {/* Customer Service */}
          <div className="text-center mt-6">
            <span className="text-yellow-400 font-medium text-sm">
              {t('auth.customerService', 'Customer Service')}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}