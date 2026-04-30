"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Define what an existing recipe looks like based on our schema
interface Recipe {
  _id: Id<"recipes">;
  title: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  isFavorite?: boolean;
}

interface RecipeFormProps {
  initialData?: Recipe; // If provided, we are UPDATING. If missing, we are CREATING.
  onSuccess?: () => void; // Optional callback to close the form or redirect after saving
}

export default function RecipeForm({ initialData, onSuccess }: RecipeFormProps) {
  // Convex Mutations
  const createRecipe = useMutation(api.recipe.create);
  const updateRecipe = useMutation(api.recipe.update);

  // Form State (Pre-fill if initialData exists, otherwise blank)
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  
  // Array States: Start with one empty string so the user has a box to type in
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || [""]);
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions || [""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Dynamic Array Handlers ---
  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Clean up empty strings before saving
    const cleanIngredients = ingredients.filter((i) => i.trim() !== "");
    const cleanInstructions = instructions.filter((i) => i.trim() !== "");

    try {
      if (initialData?._id) {
        // UPDATE Existing Recipe
        await updateRecipe({
          id: initialData._id,
          title,
          category,
          imageUrl: imageUrl || undefined,
          ingredients: cleanIngredients,
          instructions: cleanInstructions,
        });
      } else {
        // CREATE New Recipe
        await createRecipe({
          title,
          category,
          imageUrl: imageUrl || undefined,
          ingredients: cleanIngredients,
          instructions: cleanInstructions,
        });
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to save recipe:", error);
      alert("Failed to save. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {initialData ? "Edit Recipe" : "Create New Recipe"}
      </h2>

      {/* --- Basic Info --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title *</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md" placeholder="e.g. Spicy Garlic Noodles" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category *</label>
          <input required value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-md" placeholder="e.g. Dinner, Dessert" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Image URL (Optional)</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 border rounded-md" placeholder="https://..." />
      </div>

      {/* --- Dynamic Ingredients List --- */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex justify-between items-center">
          Ingredients *
          <button type="button" onClick={() => addArrayItem(setIngredients)} className="text-blue-600 text-sm hover:underline">
            + Add Ingredient
          </button>
        </label>
        {ingredients.map((item, index) => (
          <div key={`ing-${index}`} className="flex gap-2">
            <input required value={item} onChange={(e) => updateArrayItem(setIngredients, index, e.target.value)}
              className="flex-1 p-2 border rounded-md" placeholder="e.g. 2 cups flour" />
            <button type="button" onClick={() => removeArrayItem(setIngredients, index)} 
              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md">✕</button>
          </div>
        ))}
      </div>

      {/* --- Dynamic Instructions List --- */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex justify-between items-center">
          Instructions *
          <button type="button" onClick={() => addArrayItem(setInstructions)} className="text-blue-600 text-sm hover:underline">
            + Add Step
          </button>
        </label>
        {instructions.map((step, index) => (
          <div key={`inst-${index}`} className="flex gap-2">
            <span className="p-2 font-medium text-gray-500">{index + 1}.</span>
            <input required value={step} onChange={(e) => updateArrayItem(setInstructions, index, e.target.value)}
              className="flex-1 p-2 border rounded-md" placeholder="e.g. Preheat oven to 180°C..." />
            <button type="button" onClick={() => removeArrayItem(setInstructions, index)} 
              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md">✕</button>
          </div>
        ))}
      </div>

      {/* --- Submit Button --- */}
      <div className="pt-4 border-t">
        <button disabled={isSubmitting} type="submit" 
          className="w-full bg-blue-600 text-white font-semibold p-3 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Saving..." : (initialData ? "Update Recipe" : "Save New Recipe")}
        </button>
      </div>
    </form>
  );
}