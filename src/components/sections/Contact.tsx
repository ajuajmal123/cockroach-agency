"use client";
import {  Mail, Phone } from "lucide-react";

import { useState } from "react";
import toast from "react-hot-toast";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = (form.get("name") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const phone = (form.get("phone") || "").toString().trim();
    const message = (form.get("message") || "").toString().trim();

    if (!name || !email || !phone || !message) {
      toast.error("Please fill all fields.");
      setLoading(false);
      return;
    }

    try {
      // save to DB + send email on server
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const j = await res.json();

      if (!res.ok) {
        console.error("Contact API error:", j);
        toast.error(j?.error || "Failed to send. Try again later.");
        setLoading(false);
        return;
      }

      toast.success("Thanks — we'll contact you soon.");

      // Open WhatsApp chat (option B): replace number if needed
      const encoded = encodeURIComponent(
        `Hi Cockroach team, I just submitted an enquiry.\n my name is ${name}\nEmail: ${email}\nPhone: ${phone}\n I would like to inform you that: ${message}`
      );
      // open in new tab; change phone number if required
      window.open(`https://wa.me/919947099728?text=${encoded}`, "_blank");

      // reset form
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tell us about your project</h2>
            <p className="mt-4 text-ink/80">Share a few details and we’ll get back within 24 hours.</p>
            <div className="mt-6 space-y-3 text-ink/80">
              <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-brand" />cockroachcreatives@gmail.com</div>
              <div className="flex items-center gap-2"><Phone className="h-5 w-5 text-brand" /> +91 9947099728</div>
            </div>
             <div className="mt-6 flex items-center gap-4 text-muted">

              {/* Instagram (SVG) */}
              <a
                href="https://www.instagram.com/cockroach.creatives?igsh=MTR2eGh1ZThraTE4eQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7Zm0 2h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5-2.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z" />
                </svg>
              </a>

              {/* WhatsApp (Modern SVG) */}
              <a
                href="https://wa.me/919947099728"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="hover:text-ink"
              >
                <svg
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M16 .667C7.44.667.667 7.44.667 16c0 2.79.733 5.506 2.128 7.907L.667 31.333l7.68-2.027A15.2 15.2 0 0 0 16 31.333c8.56 0 15.333-6.773 15.333-15.333S24.56.667 16 .667Zm0 27.733a12.36 12.36 0 0 1-6.293-1.72l-.453-.267-4.56 1.2 1.213-4.44-.293-.467a12.34 12.34 0 0 1-1.707-6.24c0-6.84 5.547-12.387 12.387-12.387s12.387 5.547 12.387 12.387S22.84 28.4 16 28.4Zm6.493-9.333c-.347-.173-2.053-1.013-2.373-1.133-.32-.133-.547-.2-.773.2-.227.4-.893 1.133-1.093 1.373-.2.24-.4.267-.747.093-.347-.173-1.467-.533-2.787-1.707-1.04-.92-1.747-2.053-1.947-2.4-.2-.347-.02-.533.153-.706.16-.16.347-.4.52-.6.173-.2.227-.347.347-.587.12-.24.067-.44-.027-.613-.093-.173-.773-1.867-1.053-2.56-.28-.693-.573-.6-.773-.613-.2-.013-.427-.013-.653-.013-.227 0-.6.08-.92.4-.32.32-1.213 1.186-1.213 2.893 0 1.706 1.24 3.36 1.413 3.6.173.24 2.453 3.747 6.013 5.253 3.56 1.507 3.56 1.013 4.2.96.64-.053 2.053-.827 2.347-1.627.293-.8.293-1.48.2-1.627-.093-.147-.347-.24-.693-.413Z"/>
                </svg>
              </a>

            </div>
          </div>

          <form
            action="/api/contact"
            method="post"
            className="rounded-2xl border bg-white p-6 shadow-soft"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink/90">Name</label>
                <input name="name" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/90">Email</label>
                <input type="email" name="email" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/90">Mobile NO</label>
                <input type="phone" name="phone" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" placeholder="your mobile number" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink/90">Project details</label>
                <textarea name="message" rows={5} className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Tell us what you need…" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" className="h-4 w-4 rounded border" />
                I agree to the terms & privacy policy
              </label>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-ink hover:bg-brand-dark " disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
