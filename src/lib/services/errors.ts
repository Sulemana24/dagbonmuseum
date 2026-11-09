import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ServiceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function errorResponse(err: unknown) {
  if (err instanceof ServiceError) return NextResponse.json({ error: err.message }, { status: err.status });
  if (err instanceof ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  console.error("[api]", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
