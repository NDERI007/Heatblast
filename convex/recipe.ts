// convex/recipes.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// READ: Get all recipes in the database
export const get = query({
  args: {},
  handler: async (ctx) => {
    // --- AUTH DISABLED ---
    return await ctx.db.query("recipes").collect();
  },
});

// CREATE: Add a new recipe
export const create = mutation({
  args: {
    title: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()), 
    category: v.string(),
    imageUrl: v.optional(v.string()),
    externalId: v.optional(v.string()), 
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // --- AUTH DISABLED ---
    const recipeId = await ctx.db.insert("recipes", {
      ...args,
      isFavorite: false, 
      // userId: "temp-user-id" // removed for now
    });
    return recipeId;
  },
});

// UPDATE: Edit an existing recipe
export const update = mutation({
  args: {
    id: v.id("recipes"),
    title: v.optional(v.string()),
    ingredients: v.optional(v.array(v.string())),
    instructions: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // --- AUTH DISABLED ---
    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
  },
});

// DELETE: Remove a recipe
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    // --- AUTH DISABLED ---
    await ctx.db.delete(args.id);
  },
});