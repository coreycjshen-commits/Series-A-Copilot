import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: memo, error } = await supabase
    .from("memos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !memo) {
    return NextResponse.json({ error: "Memo not found" }, { status: 404 });
  }

  return NextResponse.json(memo);
}
