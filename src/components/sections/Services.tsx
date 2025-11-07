import { CheckCircle2, PenTool, Code2, Rocket } from "lucide-react";

const services = [
  {
    icon: <PenTool className="h-6 w-6" aria-hidden />,
    title: "Brand & Graphic Design",
    points: ["Logo & Visual Identity", "Social Media Creatives", "Marketing Collateral"],
  },
  {
    icon: <Code2 className="h-6 w-6" aria-hidden />,
    title: "Web Design & Development",
    points: ["Next.js Websites", "Headless CMS & MongoDB", "Performance & SEO"],
  },
  {
    icon: <Rocket className="h-6 w-6" aria-hidden />,
    title: "Digital Growth",
    points: ["SEO Foundations", "Analytics & Optimization", "Email & Launch Assets"],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What we do</h2>
          <p className="mt-3 text-muted">Pick a package or mix & match. We keep it lean and deliver quality.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-2xl border p-6 bg-white shadow-soft hover:shadow-md transition-shadow">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <ul className="mt-3 space-y-2 text-ink/80">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
