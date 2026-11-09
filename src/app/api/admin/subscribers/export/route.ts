import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/auth/session";
import { exportSubscribersCsv } from "@/lib/services/subscribers-admin";

export async function GET() {
  const auth = await authorizeApi("subscribers:export");
  if ("error" in auth) return auth.error;
  const csv = await exportSubscribersCsv(auth.session);
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="subscribers.csv"', "Cache-Control": "no-store" } });
}
