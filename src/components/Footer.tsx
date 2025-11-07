import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white py-10 text-sm text-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-ink">
            <Image src="/cockroach-logo.jpg" alt="" width={20} height={20} className="rounded-full" />
            cockroach
          </div>
          <div className="flex items-center gap-6">
            <Link href="#services" className="hover:text-ink">Services</Link>
            <Link href="#work" className="hover:text-ink">Work</Link>
            <Link href="#about" className="hover:text-ink">About</Link>
            <Link href="#contact" className="hover:text-ink">Contact</Link>
          </div>
          <div>© {new Date().getFullYear()} All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
