export default function About() {
  return (
    <section id="about" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Small team. Big impact.</h2>
            <p className="mt-4 text-ink/80">
              We’re a designer + developer duo based in India. We combine strong visual design with
              solid engineering to deliver work that looks great and works even better. We stay
              curious, learn fast, and keep things simple for our clients.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-ink/80">
              <li>✓ Transparent pricing</li>
              <li>✓ Weekly updates</li>
              <li>✓ Post-launch support</li>
              <li>✓ Friendly to startups</li>
            </ul>
          </div>
          <div className="relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl border shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1529336953121-ad2fd3f4f6c1?q=80&w=1600&auto=format&fit=crop"
                alt="Team working"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
