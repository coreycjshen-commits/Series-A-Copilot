import { extractText as extractPdfText, getDocumentProxy } from "unpdf";

export async function extractText(buffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.toLowerCase().split(".").pop();

  if (ext === "pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractPdfText(pdf, { mergePages: true });
    return text as string;
  }

  if (ext === "txt" || ext === "csv") {
    return buffer.toString("utf-8");
  }

  return `[Could not extract text from ${fileName} — unsupported format]`;
}
