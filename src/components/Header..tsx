"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { href: "#services", label: "Services" },
  { href: "portfolio", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 🟢 Auto close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Cockroach Studio logo"
              width={300}
              height={50}
              className="rounded-full"
              priority
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={`/${n.href}`} className="text-black hover:text-ink">
                {n.label}
              </Link>
            ))}

            <Link
              href="/#contact"
              className="inline-flex items-center rounded-xl bg-brand px-4 py-2 text-sm font-medium hover:bg-brand-dark"
            >
              Start a Project
            </Link>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg"
            onClick={(e) => {
              e.stopPropagation(); // prevents instant closing
              setOpen((v) => !v);
            }}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div
            ref={menuRef}
            className="md:hidden border-t pb-4 bg-white"
            onClick={(e) => e.stopPropagation()} // keep menu open while clicking inside
          >
            <nav className="flex flex-col gap-2 pt-2">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={`/${n.href}`}
                  className="rounded-lg px-3 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              ))}

              <Link
                href="/#contact"
                className="rounded-lg px-3 py-2 bg-brand hover:bg-brand-dark text-center text-white"
                onClick={() => setOpen(false)}
              >
                Start a Project
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
