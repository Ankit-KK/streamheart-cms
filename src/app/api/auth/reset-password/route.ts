import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, passwordResets } from "@/lib/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { token, password } = await request.json();

  const resetRecord = await db.query.passwordResets.findFirst({
    where: and(
      eq(passwordResets.token, token),
      eq(passwordResets.used, false),
      gt(passwordResets.expiresAt, new Date())
    ),
  });

  if (!resetRecord) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.update(adminUsers).set({ passwordHash, updatedAt: new Date() }).where(eq(adminUsers.id, resetRecord.userId));
  await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, resetRecord.id));

  return NextResponse.json({ message: "Password updated successfully." });
}
