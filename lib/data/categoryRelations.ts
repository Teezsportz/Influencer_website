import { Category } from "@/lib/types";

/** Adjacent/overlapping categories, used both by the sample-data generator (to give
 * creators a plausible secondary category) and by the discovery engine's relaxation
 * logic (to broaden a category filter gracefully when too few exact matches exist). */
export const RELATED_CATEGORIES: Partial<Record<Category, Category[]>> = {
  "Beauty & Skincare": ["Fashion", "Lifestyle"],
  Fashion: ["Beauty & Skincare", "Lifestyle"],
  Lifestyle: ["Fashion", "Travel", "Food & Beverage"],
  "Food & Beverage": ["Lifestyle", "Health & Wellness"],
  Comedy: ["Entertainment"],
  Entertainment: ["Music", "Comedy"],
  Music: ["Entertainment"],
  "Fitness & Wellness": ["Health & Wellness", "Sports"],
  "Health & Wellness": ["Fitness & Wellness", "Parenting & Family"],
  Technology: ["Business & Entrepreneurship", "Gaming"],
  Finance: ["Business & Entrepreneurship"],
  "Business & Entrepreneurship": ["Finance", "Technology"],
  Sports: ["Fitness & Wellness"],
  "Parenting & Family": ["Lifestyle", "Health & Wellness"],
  Gaming: ["Technology", "Entertainment"],
  Travel: ["Lifestyle", "Food & Beverage"],
  Education: ["Business & Entrepreneurship"],
  Automotive: ["Lifestyle"],
};
