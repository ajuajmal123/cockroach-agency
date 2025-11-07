"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Cockroach Studio logo"
              width={34}
              height={34}
              className="rounded-full"
              priority
            />
            <span className="font-semibold">cockroach</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-muted hover:text-ink">
                {n.label}
              </a>
            ))}
            <a
              href="#contact"
              className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Start a Project
            </a>
          </nav>

          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t pb-4">
            <nav className="flex flex-col gap-2 pt-2">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#contact"
                className="rounded-lg px-3 py-2 border text-center"
                onClick={() => setOpen(false)}
              >
                Start a Project
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
