import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, passwordResets } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();
  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email.toLowerCase().trim()),
  });

  if (!user) {
    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 3600000);

  await db.insert(passwordResets).values({ userId: user.id, token, expiresAt, used: false });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: "StreamHeart CMS <onboarding@resend.dev>",
      to: [user.email],
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><a href="${resetUrl}">Reset Password</a>`,
    });
  } catch (error) {
    console.error("Email failed:", error);
    return NextResponse.json({ message: "Email failed. Dev Token:", token }); 
  }

  return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
}
