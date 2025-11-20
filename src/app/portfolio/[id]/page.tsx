// app/portfolio/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";
import Header from "@/components/Header.";
import AdaptiveImage from "@/components/AdaptiveImage";

// --- Types (Standard) ---
type Project = {
    _id: string;
    title: string;
    description: string;
    images: string[];
    coverImage?: string;
    category?: string;
    subCategory?: string;
    link?: string;
};

// --- Data Fetching (Standard) ---
async function getProject(id: string): Promise<Project> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public/projects/${id}`, {
        cache: "no-store",
    });
    if (!res.ok) notFound();
    return res.json();
}

// --- Main Server Component ---
export default async function ProjectDetailPage(props: { params: { id: string } }) {
    const { id } = await (props.params as any);
    const project = await getProject(id);

    // pick primary image and gallery images from project
    const primaryImage = project.coverImage || project.images?.[0] || "";
    const galleryImages = project.images?.length ? project.images : primaryImage ? [primaryImage] : [];

    return (
        <>
            <Header />

            {/* Back link — aligned to page content left edge */}
            <div className="w-full">
                <div className="px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/portfolio"
                        className="inline-flex items-center text-sm mb-6 text-gray-600 hover:text-black transition"
                    >
                        ← Back to Portfolio
                    </Link>
                </div>
            </div>

            {/* Full-width content */}
            <main className="w-full">
                {/* Hero: full-width (content stays within page horizontal padding but image spans visually) */}
                <div className="relative w-full bg-gray-100">
                    <div className="relative w-full" style={{ height: "min(60vh, 720px)" }}>
                        {primaryImage ? (
                            <AdaptiveImage
                                src={primaryImage}
                                alt={project.title}
                                sizes="100vw"
                                className="" // keep wrapper styles; we keep the container height as is
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200" />
                        )}

                        {/* Title overlay (keeps readable on image) */}
                      
                    </div>
                </div>

                {/* Gallery: start at the same left padding as page (use px so it's not centered in a narrow container) */}
                <section className="w-full bg-white">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {galleryImages.map((imgUrl, idx) => (
                                <div key={idx} className="relative w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: "4/3" }}>
                                    {imgUrl ? (
                                        <AdaptiveImage
                                            src={imgUrl}
                                            alt={`${project.title} image ${idx + 1}`}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
