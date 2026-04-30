// app/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function SkeletonDashboard() {
  // Convex Hooks (No auth needed now)
  const recipes = useQuery(api.recipe.get); 
  const createRecipe = useMutation(api.recipe.create);
  const updateRecipe = useMutation(api.recipe.update);
  const deleteRecipe = useMutation(api.recipe.remove);

  // Dummy Data Generator
  const handleAddDummyRecipe = async () => {
    await createRecipe({
      title: `Test Recipe ${Math.floor(Math.random() * 1000)}`,
      ingredients: ["1 cup flour", "2 eggs", "Pinch of salt"],
      instructions: ["Mix ingredients", "Bake at 350°F", "Enjoy!"],
      category: "Test",
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-2xl font-bold">My Recipes (Public Test)</h1>
        <button 
          onClick={handleAddDummyRecipe}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium"
        >
          + Create Dummy Recipe
        </button>
      </header>

      {/* Loading state for Convex */}
      {recipes === undefined ? (
        <p>Loading database...</p>
      ) : recipes.length === 0 ? (
        <p className="text-gray-500">No recipes found. Click the button above to add one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="border rounded-lg p-4 shadow-sm relative">
              
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{recipe.title}</h2>
                <button 
                  onClick={() => updateRecipe({ id: recipe._id, isFavorite: !recipe.isFavorite })}
                  className="text-2xl"
                >
                  {recipe.isFavorite ? "❤️" : "🤍"}
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-4 border-b pb-2">Category: {recipe.category}</p>

              <div className="text-sm mb-4">
                <strong>Ingredients:</strong> {recipe.ingredients.length} items
              </div>

              <button 
                onClick={() => deleteRecipe({ id: recipe._id })}
                className="w-full py-2 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
              >
                Delete Recipe
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}