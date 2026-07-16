import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MemoContent } from "@/components/memo-content";
import { DeleteMemoButton } from "@/components/delete-memo-button";

export const dynamic = "force-dynamic";

export default async function MemoPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: memo } = await supabase
    .from("memos")
    .select("*")
    .eq("id", id)
    .single();

  if (!memo) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            &larr; Back to memos
          </Link>
          <h1 className="font-serif text-2xl font-semibold mt-2">
            {memo.company_name || "Untitled memo"}
          </h1>
          <p className="text-xs text-muted mt-1">
            Created{" "}
            {new Date(memo.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DeleteMemoButton memoId={memo.id} />
          <StatusBadge status={memo.status} />
        </div>
      </div>

      {memo.status === "processing" && (
        <div className="border border-processing-bg bg-processing-bg/30 rounded-lg p-6 text-center">
          <div className="inline-block w-5 h-5 border-2 border-processing border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-processing font-medium">Generating memo...</p>
          <p className="text-xs text-muted mt-1">
            This usually takes 30–60 seconds. Refresh the page to check progress.
          </p>
        </div>
      )}

      {memo.status === "failed" && (
        <div className="border border-error-bg bg-error-bg/30 rounded-lg p-6 text-center">
          <p className="text-sm text-error font-medium">Memo generation failed</p>
          <p className="text-xs text-muted mt-1">
            Please try creating a new memo with the same materials.
          </p>
        </div>
      )}

      {memo.status === "complete" && memo.memo_content && (
        <MemoContent content={memo.memo_content} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    processing: "bg-processing-bg text-processing",
    complete: "bg-success-bg text-success",
    failed: "bg-error-bg text-error",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.processing}`}>
      {status === "complete" ? "Complete" : status === "failed" ? "Failed" : "Processing"}
    </span>
  );
}
