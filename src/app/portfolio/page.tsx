import Link from "next/link";

type Project = {
  _id: string;
  title: string;
  description?: string;
  images?: string[];
  coverImage?: string;
  category?: string;
  subCategory?: string;
};

const CATEGORIES: Record<string, string[]> = {
  design: ["adposters", "festival-posters", "political-posters", "social-creatives", "logo"],
  website: ["portfolio", "ecommerce", "landing", "dashboard"],
  branding: ["identity", "guidelines"],
};

function chipClasses(active: boolean) {
  return [
    "inline-flex items-center rounded-xl border px-3 py-1 text-sm",
    active
      ? "bg-[var(--color-brand)] border-transparent text-[var(--color-ink)]"
      : "border-[var(--border)] hover:bg-white/60",
  ].join(" ");
}

async function getProjects(query: string) {
  const res = await fetch(`/api/projects?${query}`, { cache: "no-store" });
  return res.json() as Promise<{ items: Project[]; total: number }>;
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: { category?: string; subCategory?: string; q?: string; page?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.subCategory) params.set("subCategory", searchParams.subCategory);
  if (searchParams.q) params.set("q", searchParams.q);

  const { items } = await getProjects(params.toString());

  const activeCat = searchParams.category ?? "";
  const activeSub = searchParams.subCategory ?? "";

  return (
    <section className="px-6 py-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Portfolio</h1>
            <p className="mt-1 text-[color:var(--color-muted)]">
              Explore our recent <span className="font-medium">{activeCat || "work"}</span>
              {activeSub ? ` · ${activeSub}` : ""}.
            </p>
          </div>
          <Link
            href="/#contact"
            className="inline-flex items-center rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-white"
          >
            Start a project
          </Link>
        </div>

        {/* Category filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          {["all", ...Object.keys(CATEGORIES)].map((cat) => {
            const href =
              cat === "all"
                ? "/portfolio"
                : `/portfolio?category=${cat}`;
            const active = (cat === "all" && !activeCat) || activeCat === cat;
            return (
              <Link key={cat} href={href} className={chipClasses(active)}>
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Subcategory filter (only when category chosen) */}
        {!!activeCat && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href={`/portfolio?category=${activeCat}`}
              className={chipClasses(!activeSub)}
            >
              all
            </Link>
            {(CATEGORIES[activeCat] ?? []).map((sub) => (
              <Link
                key={sub}
                href={`/portfolio?category=${activeCat}&subCategory=${sub}`}
                className={chipClasses(activeSub === sub)}
              >
                {sub}
              </Link>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <article
              key={p._id}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                {/* coverImage -> images[0] fallback */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.coverImage || p.images?.[0] || "/placeholder.png"}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">
                  {p.category} {p.subCategory ? `· ${p.subCategory}` : ""}
                </div>
                <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
                {p.description && (
                  <p className="mt-2 text-sm text-[color:var(--color-muted)] line-clamp-3">
                    {p.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
