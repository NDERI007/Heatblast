"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import type { Recipe } from "./components/recipeForm";
import RecipeForm from "./components/recipeForm";
import MealDBSearch from "./components/mealDB";


type Tab = "myRecipes" | "discover";

export default function SkeletonDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("myRecipes");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | undefined>(undefined);

  const recipes = useQuery(api.recipe.get);
  const updateRecipe = useMutation(api.recipe.update);
  const deleteRecipe = useMutation(api.recipe.remove);

  const handleOpenCreateForm = () => {
    setRecipeToEdit(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setRecipeToEdit(undefined);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-2xl font-bold">My Recipes</h1>

        {activeTab === "myRecipes" && !isFormOpen && (
          <button
            onClick={handleOpenCreateForm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            + Create Recipe
          </button>
        )}

        {isFormOpen && (
          <button
            onClick={handleCloseForm}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors"
          >
            ← Back to Recipes
          </button>
        )}
      </header>

      {/* Tabs — only visible when the create/edit form is closed */}
      {!isFormOpen && (
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {(["myRecipes", "discover"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "myRecipes" ? "🍳 My Recipes" : "🌍 Discover"}
            </button>
          ))}
        </div>
      )}

      {/* ---- Tab: My Recipes ---- */}
      {!isFormOpen && activeTab === "myRecipes" && (
        <>
          {recipes === undefined ? (
            <p className="text-gray-400">Loading database…</p>
          ) : recipes.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <p className="text-4xl">📭</p>
              <p>No recipes yet. Create one or discover some in the Discover tab!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="border rounded-lg overflow-hidden shadow-sm flex flex-col bg-white hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  {recipe.imageUrl && (
                    <div className="h-36 bg-gray-100">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-grow gap-2">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold leading-snug">{recipe.title}</h2>
                      <button
                        onClick={() => updateRecipe({ id: recipe._id, isFavorite: !recipe.isFavorite })}
                        className="text-xl flex-shrink-0 ml-2"
                      >
                        {recipe.isFavorite ? "❤️" : "🤍"}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 border-b pb-2">
                      Category: {recipe.category}
                    </p>

                    <p className="text-sm text-gray-500 flex-grow">
                      🧂 {recipe.ingredients.length} ingredients
                    </p>

                    <div className="flex gap-2 mt-auto pt-2">
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
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ---- Tab: Discover (MealDB) ---- */}
      {!isFormOpen && activeTab === "discover" && <MealDBSearch />}

      {/* ---- Create / Edit Form ---- */}
      {isFormOpen && (
        <RecipeForm initialData={recipeToEdit} onSuccess={handleCloseForm} />
      )}
    </div>
  );
}