// app/portfolio/page.tsx
import Link from "next/link";
// 🟢 1. Import your Header component
import Header from "@/components/Header.";
import Footer from "@/components/Footer";

// --- Types ---
type Project = {
  _id: string;
  title: string;
  description?: string;
  images?: string[];
  coverImage?: string;
  category?: string;
  subCategory?: string;
  link?: string;
};

// --- Static Data ---
const CATEGORIES: Record<string, string[]> = {
  design: ["adposters", "festival-posters", "political-posters", "social-creatives", "logo"],
  website: ["portfolio", "ecommerce", "landing", "dashboard"],
  branding: ["identity", "guidelines"],
  other: ["miscellaneous"],
};

// --- Utility Functions ---

function chipClasses(active: boolean) {
  return [
    "inline-flex items-center rounded-xl border px-3 py-1 text-sm transition-colors duration-200 capitalize",
    active
      ? "bg-black border-transparent text-white font-medium"
      : "border-gray-300 text-gray-700 hover:bg-gray-100",
  ].join(" ");
}

async function getProjects(query: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public/projects?${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch projects for portfolio.");
    return { items: [], total: 0 };
  }

  return res.json() as Promise<{ items: Project[]; total: number }>;
}

// --- Main Server Component ---

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined> | Promise<Record<string, string | undefined>>;
}) {
  const params = new URLSearchParams();
  if ((await Promise.resolve(searchParams)).category) params.set("category", (await Promise.resolve(searchParams)).category!);
  if ((await Promise.resolve(searchParams)).subCategory) params.set("subCategory", (await Promise.resolve(searchParams)).subCategory!);
  if ((await Promise.resolve(searchParams)).q) params.set("q", (await Promise.resolve(searchParams)).q!);

  const { items } = await getProjects(params.toString());

  // Safely unwrap searchParams once and type it
  const sp = (await Promise.resolve(searchParams)) as Record<string, string | undefined>;
  const activeCat = sp?.category ?? "";
  const activeSub = sp?.subCategory ?? "";

  return (
    <>
      {/* 🟢 2. Header Inclusion */}
      <Header />

      {/* 🟢 3. Background Color and Padding Adjustments */}
      <section className="bg-gray-50 pt-12 pb-20"> {/* Apply light gray background and vertical padding */}
        {/* Adjusted padding: Removed max-w-6xl for wider feel. 
            Used specific horizontal padding for less gap on large screens. */}
        <div className="mx-auto mb-10 w-full px-4 sm:px-6 lg:px-8">

          {/* Header Content (Keep this for page-specific text) */}
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Portfolio</h1>
            
            </div>
           
          </div>

          {/* Primary Category Filter */}
          <div className="mb-4 flex flex-wrap gap-2 justify-
          ">
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

          {/* Subcategory Filter (only visible when a primary category is active) */}
          {!!activeCat && (
            <div className="mb-8 flex flex-wrap gap-2">
              <Link
                href={`/portfolio?category=${activeCat}`}
                className={chipClasses(!activeSub)}
              >
                All {activeCat}
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

          {/* Project Grid - 4-column layout */}
          {items.length === 0 ? (
            <div className="py-20 text-center text-gray-500 border-2 border-dashed rounded-xl bg-white">
              <h2 className="text-xl font-semibold">No Projects Found 😔</h2>
              <p className="mt-2">Try adjusting your filters or clearing the search query.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((p) => (
                <Link
                  key={p._id}
                  href={`/portfolio/${p._id}`}
                  className="block group"
                >
                  <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
                    <div className="aspect-4/3 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.coverImage || p.images?.[0] || "/placeholder.png"}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500">
                        {p.category} {p.subCategory ? `· ${p.subCategory}` : ""}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-black transition">
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        
        </div>
        <div className="h-1">
        <Footer />
        </div>
             
      </section>
    </>
  );
}