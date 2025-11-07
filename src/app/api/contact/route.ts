import { NextResponse } from "next/server";
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_PASS,
    },
  });

  await transporter.sendMail({
    from: email,
    to: process.env.CONTACT_EMAIL,
    subject: `Message from ${name}`,
    text: message,
  });

  return NextResponse.json({ success: true });
}
