const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Raw shape returned by TheMealDB
export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube?: string;
  
  [key: string]: string | undefined;
}

// Cleaned-up shape we actually use in the UI
export interface NormalizedMeal {
  mealDbId: string;
  title: string;
  category: string;
  imageUrl: string;
  ingredients: string[];   // ["2 cups flour", "1 tsp salt", ...]
  instructions: string[];  // split into steps
}


function extractIngredients(meal: MealDBMeal): string[] {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (ingredient) {
      ingredients.push(measure ? `${measure} ${ingredient}` : ingredient);
    }
  }
  return ingredients;
}

/** Split a wall of instruction text into individual steps */
function splitInstructions(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function normalizeMeal(meal: MealDBMeal): NormalizedMeal {
  return {
    mealDbId: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory,
    imageUrl: meal.strMealThumb,
    ingredients: extractIngredients(meal),
    instructions: splitInstructions(meal.strInstructions),
  };
}

// ---- API calls ----

export async function searchMeals(query: string): Promise<NormalizedMeal[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  if (!data.meals) return [];
  return (data.meals as MealDBMeal[]).map(normalizeMeal);
}

export async function fetchMealsByCategory(
  category: string
): Promise<NormalizedMeal[]> {
  // filter.php only returns thumbnail + title, so we do a lookup for each
  const res = await fetch(
    `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
  );
  const data = await res.json();
  if (!data.meals) return [];
  // Limit to 12 to avoid hammering the API
  const limited = (data.meals as MealDBMeal[]).slice(0, 12);
  const detailed = await Promise.all(
    limited.map((m) => lookupMealById(m.idMeal))
  );
  return detailed.filter(Boolean) as NormalizedMeal[];
}

export async function lookupMealById(
  id: string
): Promise<NormalizedMeal | null> {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await res.json();
  if (!data.meals?.[0]) return null;
  return normalizeMeal(data.meals[0] as MealDBMeal);
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/categories.php`);
  const data = await res.json();
  if (!data.categories) return [];
  return data.categories.map(
    (c: { strCategory: string }) => c.strCategory
  );
}