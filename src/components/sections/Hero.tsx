"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand/10 via-white to-white" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl"
            >
              Design that pops. Code that ships.
            </motion.h1>
            <p className="mt-4 text-lg text-muted">
              We’re a two-person studio helping small businesses look sharp and go
              live—fast. Branding, social creatives, and Next.js sites on MongoDB.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-white hover:bg-black"
              >
                Get a quote →
              </a>
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-brand  hover:bg-brand-dark"
              >
                See our work
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted">
              <div>✓ Fast turnarounds</div>
              <div>✓ SEO-ready</div>
              <div>✓ Friendly pricing</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
            <div className="absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl  shadow-soft">
              <img
                src= "image5.png"
                alt="Design & code"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
