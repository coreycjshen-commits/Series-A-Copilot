import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-card-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-serif text-xl font-semibold tracking-tight">
            Series A Memo Copilot
          </span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
            From pitch deck to<br />investment memo in minutes
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed max-w-xl mx-auto">
            Upload a Series A pitch deck and supporting documents. Get a
            structured analyst memo with benchmarks, risk analysis, and
            diligence questions — ready for IC review.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-6 py-3 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors text-sm font-medium"
            >
              Start your first memo
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            <div>
              <h3 className="font-medium text-sm">Upload & extract</h3>
              <p className="mt-1 text-sm text-muted">
                Drop in pitch decks, financials, and data room docs. Text is
                extracted automatically.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm">AI-drafted memo</h3>
              <p className="mt-1 text-sm text-muted">
                Claude generates an 11-section memo calibrated to Series A
                benchmarks and guardrails.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Track & iterate</h3>
              <p className="mt-1 text-sm text-muted">
                View past memos, re-generate with new materials, and build
                your deal pipeline.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-card-border px-6 py-4">
        <div className="max-w-5xl mx-auto text-center text-xs text-muted">
          Series A Memo Copilot — AI-assisted investment analysis
        </div>
      </footer>
    </div>
  );
}
