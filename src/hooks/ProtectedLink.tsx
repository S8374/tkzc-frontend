"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface Props {
  href: string;
  children: React.ReactNode;
}

export default function ProtectedLink({ href, children }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    const token = Cookies.get("accessToken");

    if (!token) {
      e.preventDefault();
      toast.error("Please login first");
    }
  };

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}