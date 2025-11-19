// app/api/public/projects/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";
import { IProject } from "@/lib/types/Project"; // Assuming this is defined correctly

/**
 * 📌 PUBLIC GET: /api/public/projects
 * Fetches a list of projects for the user-facing portfolio, with filtering (q, category, subCategory).
 */
export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const filter: any = {};
        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const subCategory = searchParams.get('subCategory');

        // --- 1. BUILD MONGODB FILTER ---
        // Note: You should add a filter here like { isPublished: true } if you have a publish toggle.
        
        if (category) {
            filter.category = category;
        }
        if (subCategory) {
            filter.subCategory = subCategory;
        }

        // Text Search (title and description)
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ];
        }

        // --- 2. EXECUTE QUERY ---
        const items = await Project.find(filter)
            // Select only fields needed for the public card display
            .select('title description images coverImage category subCategory link') 
            .sort({ order: -1, createdAt: -1 }) // Sort order
            .lean() as unknown as IProject[]; 

        const total = await Project.countDocuments(filter);

        // --- 3. FORMAT OUTPUT ---
        const outputItems = items.map(item => ({ 
            _id: item._id.toString(), 
            title: item.title,
            description: item.description,
            images: item.images,
            coverImage: item.coverImage,
            category: item.category,
            subCategory: item.subCategory,
            link: item.link,
        }));

        // The user-facing page expects { items: [], total: number }
        return NextResponse.json({ 
            items: outputItems,
            total
        }, { status: 200 });
        
    } catch (err: any) {
        console.error("Public projects list error:", err);
        return NextResponse.json({ items: [], total: 0, error: "Failed to fetch projects" }, { status: 500 });
    }
}