const sampleWork = [
  {
    title: "Cafe Bloom – Rebrand",
    tag: "Branding / Social",
    image:
      "image1.png",
  },
  {
    title: "CraftFit – Landing Page",
    tag: "Web / Next.js",
    image:
      "image2.png",
  },
  {
    title: "UrbnWear – Social Campaign",
    tag: "Graphics / Campaign",
    image:
      "image3.png",
  },
];

export default function Work() {
  return (
    <section id="work" className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Selected work</h2>
            <p className="mt-3 max-w-xl text-muted">
              A peek at recent brand, web, and social projects. Ask for our full deck.
            </p>
          </div>
      <a href="/portfolio" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm hover:bg-brand-dark">
  View all work
</a>

        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleWork.map((w) => (
            <article key={w.title} className="group overflow-hidden rounded-2xl  bg-white shadow-soft">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={w.image}
                  alt={w.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-muted">{w.tag}</div>
                <h3 className="mt-1 text-lg font-semibold">{w.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
