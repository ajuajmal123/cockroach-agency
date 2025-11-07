import { Instagram, Twitter, Linkedin, Mail, Phone } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tell us about your project</h2>
            <p className="mt-4 text-ink/80">Share a few details and we’ll get back within 24 hours.</p>
            <div className="mt-6 space-y-3 text-ink/80">
              <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-brand" /> hello@cockroach.studio</div>
              <div className="flex items-center gap-2"><Phone className="h-5 w-5 text-brand" /> +91 90000 00000</div>
            </div>
            <div className="mt-6 flex items-center gap-4 text-muted">
              <a href="#" aria-label="Instagram" className="hover:text-ink"><Instagram className="h-5 w-5" /></a>
              <a href="#" aria-label="Twitter" className="hover:text-ink"><Twitter className="h-5 w-5" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-ink"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          <form
            action="/api/contact" // wire up server action / route when ready
            method="post"
            className="rounded-2xl border bg-white p-6 shadow-soft"
            onSubmit={(e) => e.preventDefault()}
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
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-ink hover:bg-brand-dark">
                Send →
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
