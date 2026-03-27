"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api/auth.services";

interface Props {
  href: string;
  children: React.ReactNode;
}

export default function ProtectedLink({ href, children }: Props) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // 🔥 always stop default

    try {
      const res = await authService.me(undefined);

      if (res?.success && res?.data) {
        // ✅ user valid → go
        router.push(href);
      } else {
        toast.error("Please login first");
      }
    } catch (err) {
      toast.error("Please login first");
    }
  };

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}