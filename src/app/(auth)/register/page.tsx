import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return <AuthForm initialTab="register" />;
}
