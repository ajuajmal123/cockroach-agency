// app/portfolio/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image"; 

// --- Types (Standard) ---
type Project = {
    _id: string;
    title: string;
    description: string;
    images: string[];
    coverImage?: string;
    category: string;
    subCategory?: string;
    link?: string;
};

// --- Data Fetching (Standard) ---
async function getProject(id: string): Promise<Project> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public/projects/${id}`, { 
        cache: "no-store" 
    });
    
    if (!res.ok) {
        notFound(); 
    }
    return res.json();
}

// --- Main Server Component (Applied Fix) ---

export default async function ProjectDetailPage(
    // NOTE: Keep the params object intact in the function signature
    props: { params: { id: string } }
) {
    // 🛑 FIX APPLIED HERE: Await the params object itself to force resolution
    // Use an explicit type cast (as any) to satisfy TypeScript, as 'params' is normally synchronous.
    const { id } = await (props.params as any); 
    
    // Now call getProject with the resolved ID
    const project = await getProject(id);
    
    // ... Rest of the component logic ...

    const primaryImage = project.coverImage || project.images?.[0] || "/placeholder.png";
    const secondaryImages = project.images?.filter(img => img !== primaryImage) || [];

    return (
        <section className="px-6 py-12">
            <div className="mx-auto w-full max-w-6xl">
                
                {/* Back Link */}
                <Link 
                    href="/portfolio" 
                    className="inline-flex items-center text-sm mb-6 text-gray-600 hover:text-black transition"
                >
                    ← Back to Portfolio
                </Link>

                {/* Header and Details */}
                <div className="mb-10 border-b pb-4">
                    <div className="text-sm uppercase tracking-wider text-gray-500">
                        {project.category} {project.subCategory ? ` / ${project.subCategory}` : ""}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mt-1 text-gray-900">{project.title}</h1>
                    {project.link && (
                        <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-2 inline-block text-blue-600 hover:underline font-medium"
                        >
                            View Live Project →
                        </a>
                    )}
                </div>

                {/* Primary Image Banner */}
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl shadow-xl mb-12 bg-gray-100">
                    <Image
                        src={primaryImage}
                        alt={`Cover image for ${project.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                </div>

                {/* Description and Metadata */}
                <div className="grid gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-3 text-gray-900">Project Description</h2>
                        <p className="whitespace-pre-wrap text-gray-700">{project.description}</p>
                    </div>
                    
                    <div className="lg:col-span-1 border-l border-gray-200 pl-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Details</h3>
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Category:</span> {project.category}
                        </p>
                        {project.subCategory && (
                             <p className="text-sm mt-1 text-gray-700">
                                <span className="font-semibold">Sub-Category:</span> {project.subCategory}
                            </p>
                        )}
                    </div>
                </div>

                {/* Gallery of Secondary Images */}
                {secondaryImages.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Gallery</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {secondaryImages.map((imgUrl, index) => (
                                <div key={index} className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 shadow-md">
                                    <Image
                                        src={imgUrl}
                                        alt={`${project.title} detail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}