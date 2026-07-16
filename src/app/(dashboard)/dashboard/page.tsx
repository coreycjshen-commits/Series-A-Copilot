import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteMemoButton } from "@/components/delete-memo-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: memos } = await supabase
    .from("memos")
    .select("id, company_name, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Your memos</h1>
          <p className="text-sm text-muted mt-1">
            Draft investment memos from pitch decks and data room documents.
          </p>
        </div>
        <Link
          href="/memo/new"
          className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          New memo
        </Link>
      </div>

      {!memos || memos.length === 0 ? (
        <div className="border border-dashed border-card-border rounded-lg p-12 text-center">
          <p className="text-muted text-sm">No memos yet.</p>
          <p className="text-muted text-sm mt-1">
            Upload a pitch deck to generate your first investment memo.
          </p>
          <Link
            href="/memo/new"
            className="inline-block mt-4 px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Create your first memo
          </Link>
        </div>
      ) : (
        <div className="border border-card-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-card">
                <th className="text-left px-4 py-3 font-medium text-muted">Company</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Created</th>
                <th className="text-right px-4 py-3 font-medium text-muted"></th>
              </tr>
            </thead>
            <tbody>
              {memos.map((memo) => (
                <tr key={memo.id} className="border-b border-card-border last:border-0 hover:bg-card/50">
                  <td className="px-4 py-3 font-medium">
                    {memo.company_name || "Untitled"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={memo.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(memo.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                    <Link
                      href={`/memo/${memo.id}`}
                      className="text-accent hover:underline underline-offset-4"
                    >
                      View
                    </Link>
                    <DeleteMemoButton memoId={memo.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.processing}`}>
      {status === "complete" ? "Complete" : status === "failed" ? "Failed" : "Processing"}
    </span>
  );
}
