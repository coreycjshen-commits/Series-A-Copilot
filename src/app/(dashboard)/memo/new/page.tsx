"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

export default function NewMemoPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: 20 * 1024 * 1024,
  });

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (files.length === 0 && !callNotes.trim()) {
      setError("Upload at least one file or paste call notes.");
      return;
    }

    setSubmitting(true);
    setError("");
    setStage("Uploading files...");

    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("callNotes", callNotes);
      files.forEach((file) => formData.append("files", file));

      setStage("Extracting text & generating memo...");

      const res = await fetch("/api/memos/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Failed to create memo";
        try {
          const body = await res.json();
          message = body.error || message;
        } catch {
          const text = await res.text();
          message = `Server error (${res.status}): ${text.slice(0, 200)}`;
        }
        throw new Error(message);
      }

      const { memoId } = await res.json();
      router.push(`/memo/${memoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
      setStage("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl font-semibold mb-1">New memo</h1>
      <p className="text-sm text-muted mb-8">
        Upload deal materials and we&apos;ll draft a structured Series A investment memo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-error bg-error-bg rounded-md">{error}</div>
        )}

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium mb-1">
            Company name
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full px-3 py-2 border border-card-border rounded-md text-sm bg-card focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Documents</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-accent bg-accent/5"
                : "border-card-border hover:border-accent/40"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-muted">
              {isDragActive
                ? "Drop files here..."
                : "Drag & drop files here, or click to browse"}
            </p>
            <p className="text-xs text-muted mt-1">
              PDF, TXT, CSV, XLSX — up to 20 MB each
            </p>
          </div>

          {files.length > 0 && (
            <ul className="mt-3 space-y-1">
              {files.map((file, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-card border border-card-border rounded-md text-sm"
                >
                  <span className="truncate mr-2">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-muted hover:text-error text-xs shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="callNotes" className="block text-sm font-medium mb-1">
            Call notes / additional context
            <span className="text-muted font-normal ml-1">(optional)</span>
          </label>
          <textarea
            id="callNotes"
            rows={6}
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            placeholder="Paste founder call notes, additional context, or specific questions you want the memo to address..."
            className="w-full px-3 py-2 border border-card-border rounded-md text-sm bg-card focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {submitting ? stage || "Processing..." : "Generate memo"}
        </button>
      </form>
    </div>
  );
}
