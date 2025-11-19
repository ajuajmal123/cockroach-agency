// src/lib/types/Project.ts (New file, or adjust an existing one)
import { Document } from 'mongoose';

export interface IProject extends Document {
    _id: string; // Mongoose Document has _id
    title: string;
    description: string;
    images: string[];
    coverImage?: string;
    link?: string;
    category: 'design' | 'website' | 'branding' | 'other';
    subCategory?: string;
    tags: string[];
    featured: boolean;
    order: number;
    cloudinaryIds: string[];
    createdAt: Date;
    updatedAt: Date;
}