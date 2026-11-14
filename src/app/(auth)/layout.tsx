import { ChefHat } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 px-4"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <ChefHat
            size={20}
            aria-hidden="true"
            className="text-accent-foreground"
          />
        </span>
        <span className="font-heading text-lg font-medium">
          Cook<span className="text-accent">that</span>One
        </span>
      </div>
      {children}
    </main>
  );
}
