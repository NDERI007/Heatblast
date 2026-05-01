import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()), 
    category: v.string(),
    
    
    imageId: v.optional(v.id("_storage")),
    isFavorite: v.optional(v.boolean()),
    externalImageUrl: v.optional(v.string()),
    
    // The Clerk user ID (Mandatory for security)
   // userId: v.string(), 

    // Source tracking for TheMealDB
    externalId: v.optional(v.string()), 
    sourceUrl: v.optional(v.string()),
  })
  // 1. Index for fast loading of a user's dashboard
  //.index("by_userId", ["userId"])
  // 2. Search index for a search bar feature later
  //.searchIndex("search_title", {
   // searchField: "title",
   // filterFields: ["userId"],
  //}),
});