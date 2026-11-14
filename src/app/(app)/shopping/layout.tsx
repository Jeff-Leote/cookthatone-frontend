import type { Metadata } from "next";

export const metadata: Metadata = { title: "Courses" };

export default function ShoppingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
