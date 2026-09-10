"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, LoaderCircle } from "lucide-react";
import { getSession } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getSession() ? "/books" : "/signin");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb]">
      <div className="flex flex-col items-center gap-4 text-primary">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-indigo-200">
          <BookOpenCheck className="size-6" />
        </span>
        <LoaderCircle className="size-5 animate-spin" />
        <span className="sr-only">正在跳转</span>
      </div>
    </main>
  );
}
