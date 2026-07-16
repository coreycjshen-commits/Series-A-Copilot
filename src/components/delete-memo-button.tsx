"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DeleteMemoButton({ memoId }: { memoId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("memos").delete().eq("id", memoId);
    router.push("/dashboard");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Delete this memo?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1 text-xs bg-error text-white rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1 text-xs border border-card-border rounded-md hover:bg-card"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-muted hover:text-error transition-colors"
    >
      Delete
    </button>
  );
}
