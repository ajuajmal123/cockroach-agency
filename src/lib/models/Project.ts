import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },          // <— array
    coverImage: { type: String },                     // optional hero
    link: { type: String },
    category: {                                       // e.g. "design" | "website"
      type: String,
      index: true,
      enum: ["design", "website", "branding", "other"],
    },
    subCategory: { type: String, index: true },       // e.g. "adposters"
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
     cloudinaryIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Project=mongoose.model('Project',projectSchema);
export default Project;

