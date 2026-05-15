import { z } from "zod";

const statusSchema = z.enum(["draft", "published"]);

const tagsSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((tags) => {
    if (!tags) {
      return [];
    }

    const list = Array.isArray(tags) ? tags : tags.split(/[\s,]+/);
    const uniqueTags = new Set();

    for (const tag of list) {
      const normalized = String(tag).trim().replace(/^#+/, "").toLowerCase();

      if (normalized) {
        uniqueTags.add(normalized);
      }
    }

    return [...uniqueTags];
  });

const booleanSchema = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => value === true || value === "true");

export const createBlogSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title must be under 120 characters."),
  heading: z.string().trim().min(3, "Heading must be at least 3 characters.").max(160, "Heading must be under 160 characters."),
  subheading: z.string().trim().min(3, "Subheading must be at least 3 characters.").max(250, "Subheading must be under 250 characters."),
  content: z.string().trim().min(50, "Content must be at least 50 characters."),
  category: z.string().trim().min(1, "Category is required."),
  tags: tagsSchema,
  excerpt: z.string().trim().max(220, "Excerpt must be under 220 characters.").optional(),
  status: statusSchema.optional(),
  isFeatured: booleanSchema,
});

export const updateBlogSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title must be under 120 characters.").optional(),
  heading: z.string().trim().min(3, "Heading must be at least 3 characters.").max(160, "Heading must be under 160 characters.").optional(),
  subheading: z.string().trim().min(3, "Subheading must be at least 3 characters.").max(250, "Subheading must be under 250 characters.").optional(),
  content: z.string().trim().min(50, "Content must be at least 50 characters.").optional(),
  category: z.string().trim().min(1, "Category is required.").optional(),
  tags: tagsSchema,
  excerpt: z.string().trim().max(220, "Excerpt must be under 220 characters.").optional(),
  status: statusSchema.optional(),
  isFeatured: booleanSchema,
});
