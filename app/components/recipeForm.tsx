"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export type Recipe = Doc<"recipes">

interface RecipeFormProps {
  initialData?: Recipe; // If provided, we are UPDATING. If missing, we are CREATING.
  onSuccess?: () => void; // Optional callback to close the form or redirect after saving
}

export default function RecipeForm({ initialData, onSuccess }: RecipeFormProps) {
  // Convex Mutations
  const createRecipe = useMutation(api.recipe.create);
  const updateRecipe = useMutation(api.recipe.update);
  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);

  // Form State (Pre-fill if initialData exists, otherwise blank)
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageId || null)
  
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
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanIngredients = ingredients.filter((i) => i.trim() !== "");
    const cleanInstructions = instructions.filter((i) => i.trim() !== "");

    try {
      let finalImageId = initialData?.imageId;

      // If the user selected a NEW file, upload it first
      if (imageFile) {
        // 1. Get the upload URL from Convex
        const postUrl = await generateUploadUrl();

        // 2. Post the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        
        // 3. Get the storage ID back
        const { storageId } = await result.json();

        finalImageId = storageId;
      }

      if (initialData?._id) {
        await updateRecipe({
          id: initialData._id,
          title,
          category,
          imageId: finalImageId,
          ingredients: cleanIngredients,
          instructions: cleanInstructions,
        });
      } else {
        await createRecipe({
          title,
          category,
          imageId: finalImageId, // Use the new uploaded URL
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
        <input type="file" accept="image/*" onChange={(e) => {const file = e.target.files?.[0];
          if (file){ setImageFile(file) 
            // Create a temporary local URL to show a preview immediately
              setImagePreview(URL.createObjectURL(file));}}
        }
          className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          {/* Show the preview if an image exists or was just selected */}
        {imagePreview && (
          <div className="mt-4 relative w-full max-w-sm h-48">
            <img 
              src={imagePreview} 
              alt="Recipe preview" 
              className="w-full h-full object-cover rounded-xl shadow-sm border"
            />
          </div>
        )}
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