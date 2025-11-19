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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Keep justify-between to push navigation right */}
        <div className="flex h-16 items-center justify-between">

          {/* 🛑 FIX: Removed 'my-6' from the logo Link. The 'h-16' on the parent div handles vertical centering. */}
          <Link href="/" className="flex items-center gap-3 ">
            <Image
              src="/logo.png"
              alt="Cockroach Studio logo"
              width={300}
              height={50}
              className="rounded-full "
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-black hover:text-ink">
                {n.label}
              </a>
            ))}
            <a
              href="#contact"
              className="inline-flex items-center rounded-xl bg-brand px-4 py-2 text-sm font-medium hover:bg-brand-dark"
            >
              Start a Project
            </a>
          </nav>

          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg "
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
                className="rounded-lg px-3 py-2 bg-brand  hover:bg-brand-dark text-center"
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