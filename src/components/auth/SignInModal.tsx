/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { authService } from "@/services/api/auth.services";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onSwitchToRegister?: () => void; // Add this prop
}

export default function SignInModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  onSwitchToRegister 
}: SignInModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [imHuman, setImHuman] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);

  // ESC + click outside + body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!username || !password)
      return toast.error(t('auth.allFieldsRequired', 'All fields are required'));
    if (!imHuman)
      return toast.error(t('auth.verifyHuman', 'Please verify you are human'));

    try {
      setLoading(true);

      const res = await authService.login({
        identifier: username,
        password,
        imHuman,
      });

      if (res?.success) {
        onLoginSuccess();
        onClose();
        router.push("/deposit");
        toast.success(t('auth.loginSuccess', 'Login successful 🎉'));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('auth.loginFailed', 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    onClose(); // Close sign in modal
    if (onSwitchToRegister) {
      onSwitchToRegister(); // Open register modal
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl overflow-hidden
                   bg-gray-900 border border-gray-800 shadow-2xl
                   bg-no-repeat bg-cover"
        style={{
          backgroundImage:
            "url('https://img.tkzc886.com/imgcn/tkzc/bg_login.webp')",
        }}
      >
        {/* Header */}
        <div className="relative h-28">
          <div className="absolute inset-0 flex flex-col justify-center px-5">
            <h2 className="text-2xl font-bold text-white">{t('auth.welcomeSignIn', 'Welcome Sign In')}</h2>
            <p className="text-gray-200 text-sm mt-1">
              {t('auth.noAccount', 'No account yet?')}{" "}
              <button 
                onClick={handleRegisterClick}
                className="text-yellow-300 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                {t('auth.registerNow', 'Register now')}
              </button>
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Username */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              👤
            </span>
            <input
              type="text"
              placeholder={t('auth.enterUsername', 'Enter username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg
                         bg-gray-800/50 border border-gray-700
                         text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              🔒
            </span>
            <input
              type="password"
              placeholder={t('auth.enterPassword', 'Enter password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg
                         bg-gray-800/50 border border-gray-700
                         text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Human verification */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowCaptcha(true)}>
            <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center">
              {imHuman && (
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              )}
            </div>
            <span className="text-gray-300">{t('auth.iAmHuman', 'I am human')}</span>
          </div>

          {/* CAPTCHA */}
          {showCaptcha && (
            <div className="flex justify-center mt-2">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                onChange={() => {
                  setImHuman(true);
                  toast.success(t('auth.humanVerified', 'Human verified ✅'));
                }}
              />
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-white
                       bg-gradient-to-r from-yellow-500 to-orange-600
                       hover:opacity-90 transition"
          >
            {loading ? t('auth.signingIn', 'Signing in...') : t('auth.signIn', 'SIGN IN')}
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8
                     rounded-full bg-black/50 hover:bg-black/70
                     text-white flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
}