import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SigninForm } from "@/components/auth/signin-form";

export const metadata: Metadata = { title: "登录" };

export default function SigninPage() {
  return <AuthShell><SigninForm /></AuthShell>;
}

