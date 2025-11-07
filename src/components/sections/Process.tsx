const steps = [
  { t: "Discovery", d: "Quick call to understand goals, audience, and scope." },
  { t: "Design", d: "Moodboards, wireframes, and polished visuals for approval." },
  { t: "Build", d: "Next.js + MongoDB, performance, accessibility, and SEO." },
  { t: "Launch", d: "Deploy, analytics, handover, and training." },
];

export default function Process() {
  return (
    <section id="process" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How we work</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-2xl border p-6 bg-white">
              <div className="text-sm font-semibold text-muted">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-ink/80">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
