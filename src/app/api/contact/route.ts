import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/dbconnect";
import Enquiry from "@/lib/models/Enquiry";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    await connectDB();
    await Enquiry.create({ name, email, phone, message });

    // Email to admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "cockroachcreatives@gmail.com",
      subject: `New Project Enquiry from ${name}`,
      html: `
        <h3>New enquiry</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
