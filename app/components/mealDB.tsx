"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  searchMeals,
  fetchCategories,
  fetchMealsByCategory,
  NormalizedMeal,
} from "@/app/lib/mealBD";

// ---- tiny helpers ----
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---- component ----
export default function MealDBSearch() {
  const createRecipe = useMutation(api.recipe.create);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 450);

  const [results, setResults] = useState<NormalizedMeal[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      if (!activeCategory) setResults([]);
      return;
    }
    setActiveCategory(null);
    setLoading(true);
    searchMeals(debouncedQuery)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Browse by category
  const handleCategory = async (cat: string) => {
    setQuery("");
    if (activeCategory === cat) {
      setActiveCategory(null);
      setResults([]);
      return;
    }
    setActiveCategory(cat);
    setLoading(true);
    fetchMealsByCategory(cat)
      .then(setResults)
      .finally(() => setLoading(false));
  };

  const handleSave = async (meal: NormalizedMeal) => {
    setSavingId(meal.mealDbId);
    try {
      await createRecipe({
        title: meal.title,
        category: meal.category,
        externalImageUrl: meal.imageUrl,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
      });
      setSavedIds((prev) => new Set(prev).add(meal.mealDbId));
    } catch (err) {
      console.error("Failed to save recipe:", err);
      alert("Could not save recipe. Check console for details.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search MealDB… e.g. pasta, chicken curry"
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Browse by category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          Fetching recipes…
        </div>
      )}

      {!loading && results.length === 0 && (query || activeCategory) && (
        <p className="text-center text-gray-400 py-12">No results found. Try a different search.</p>
      )}

      {!loading && results.length === 0 && !query && !activeCategory && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm">Search for a recipe or pick a category above.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((meal) => {
            const isSaved = savedIds.has(meal.mealDbId);
            const isSaving = savingId === meal.mealDbId;

            return (
              <div
                key={meal.mealDbId}
                className="border rounded-xl overflow-hidden shadow-sm flex flex-col bg-white hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-100">
                  <img
                    src={meal.imageUrl}
                    alt={meal.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {meal.category}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3 flex-grow">
                  <h3 className="font-semibold text-base leading-snug">{meal.title}</h3>

                  <p className="text-xs text-gray-500">
                    🧂 {meal.ingredients.length} ingredients &nbsp;·&nbsp;
                    📋 {meal.instructions.length} steps
                  </p>

                  {/* Ingredient preview */}
                  <p className="text-xs text-gray-400 truncate">
                    {meal.ingredients.slice(0, 4).join(", ")}
                    {meal.ingredients.length > 4 ? "…" : ""}
                  </p>

                  <button
                    onClick={() => handleSave(meal)}
                    disabled={isSaved || isSaving}
                    className={`mt-auto w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                      isSaved
                        ? "bg-green-100 text-green-700 cursor-default"
                        : isSaving
                        ? "bg-blue-100 text-blue-500 cursor-wait"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isSaved ? "✓ Saved to My Recipes" : isSaving ? "Saving…" : "＋ Save to My Recipes"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}