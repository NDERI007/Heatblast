"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import type { Recipe } from "./components/recipeForm";
import RecipeForm from "./components/recipeForm";

export default function SkeletonDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | undefined>(undefined)
  // Convex Hooks (No auth needed now)
  const recipes = useQuery(api.recipe.get); 
  const updateRecipe = useMutation(api.recipe.update);
  const deleteRecipe = useMutation(api.recipe.remove);

  //Handlers
  const handleOpenCreateForm = () => {
    setRecipeToEdit(undefined); //Clear any existing data
    setIsFormOpen(true);
  }

  const handleOpenEditForm = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setIsFormOpen(true);
  }

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setRecipeToEdit(undefined);
  }
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-2xl font-bold">My Recipes</h1>

        {/* Toggle between "Close Form" and "Create Recipe" */}
        {!isFormOpen ? (<button 
            onClick={handleOpenCreateForm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            + Create Recipe
          </button>) : (<button 
            onClick={handleCloseForm}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors"
          >
            Back to Recipes
          </button>)}
      </header>

      {isFormOpen ? (<RecipeForm initialData={recipeToEdit} onSuccess={handleCloseForm} />) : (<>{/* Loading state for Convex */}
          {recipes === undefined ? (
            <p>Loading database...</p>
          ) : recipes.length === 0 ? (
            <p className="text-gray-500">No recipes found. Click the button above to add one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map((recipe) => (
                <div key={recipe._id} className="border rounded-lg p-4 shadow-sm relative flex flex-col">
                  
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

                  <div className="text-sm mb-4 flex-grow">
                    <strong>Ingredients:</strong> {recipe.ingredients.length} items
                  </div>

                  <div className="flex gap-2 mt-auto pt-4">
                    <button 
                      onClick={() => handleOpenEditForm(recipe)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteRecipe({ id: recipe._id })}
                      className="flex-1 py-2 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}