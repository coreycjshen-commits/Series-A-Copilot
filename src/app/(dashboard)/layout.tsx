import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-card-border px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="font-serif text-lg font-semibold tracking-tight">
            Series A Memo Copilot
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted">{user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
