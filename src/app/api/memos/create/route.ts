import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractText } from "@/lib/extract-text";
import { SERIES_A_SYSTEM_PROMPT } from "@/lib/system-prompt";
import Groq from "groq-sdk";

interface UploadedFile {
  name: string;
  storagePath: string;
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyName, callNotes, files } = await request.json() as {
    companyName: string;
    callNotes: string;
    files: UploadedFile[];
  };

  if ((!files || files.length === 0) && !callNotes?.trim()) {
    return NextResponse.json(
      { error: "Upload at least one file or provide call notes." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: memo, error: memoError } = await admin
    .from("memos")
    .insert({
      user_id: user.id,
      company_name: companyName || null,
      status: "processing",
    })
    .select("id")
    .single();

  if (memoError || !memo) {
    console.error("Memo insert error:", memoError);
    return NextResponse.json(
      { error: `Failed to create memo record: ${memoError?.message || "unknown"}` },
      { status: 500 }
    );
  }

  const memoId = memo.id;

  await processMemo(memoId, user.id, files || [], companyName || "", callNotes || "", admin);

  return NextResponse.json({ memoId });
}

async function processMemo(
  memoId: string,
  userId: string,
  files: UploadedFile[],
  companyName: string,
  callNotes: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any
) {
  try {
    const extractedTexts: { name: string; text: string }[] = [];

    for (const file of files) {
      const { data: fileData, error: downloadError } = await admin.storage
        .from("memo-files")
        .download(file.storagePath);

      if (downloadError || !fileData) {
        console.error("File download error:", downloadError);
        continue;
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const text = await extractText(buffer, file.name);

      await admin.from("memo_files").insert({
        memo_id: memoId,
        file_name: file.name,
        storage_path: file.storagePath,
        file_type: inferFileType(file.name),
        extracted_text: text,
      });

      extractedTexts.push({ name: file.name, text });
    }

    let userMessage = "";
    if (companyName) {
      userMessage += `Company: ${companyName}\n\n`;
    }

    for (const { name, text } of extractedTexts) {
      userMessage += `--- Document: ${name} ---\n${text}\n\n`;
    }

    if (callNotes.trim()) {
      userMessage += `--- Founder/Management Call Notes ---\n${callNotes}\n\n`;
    }

    userMessage += `Draft the Series A investment memo per the system prompt.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8192,
      messages: [
        { role: "system", content: SERIES_A_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const memoContent = chatCompletion.choices[0]?.message?.content || "";

    await admin
      .from("memos")
      .update({
        memo_content: memoContent,
        status: "complete",
        updated_at: new Date().toISOString(),
      })
      .eq("id", memoId);
  } catch (err) {
    console.error("Memo generation failed:", err);
    await admin
      .from("memos")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", memoId);
  }
}

function inferFileType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("deck") || lower.includes("pitch")) return "deck";
  if (lower.includes("financial") || lower.includes("model")) return "financials";
  if (lower.includes("data") || lower.includes("room")) return "data_room";
  return "other";
}
