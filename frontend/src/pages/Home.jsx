import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SearchIcon } from "lucide-react";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];

  useEffect(() => {
    const fetchRecipesAndFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        const recipeRes = await axios.get(
          `/api/recipes/${
            category && category !== "All" ? `?category=${category}` : ""
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let updatedRecipes = recipeRes.data;

        if (user && token) {
          try {
            const favoritesRes = await axios.get("/api/recipes/favorites", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const favoriteIds = favoritesRes.data.map((recipe) => recipe._id.toString());
            updatedRecipes = recipeRes.data.map((recipe) => ({
              ...recipe,
              isFavorited: favoriteIds.includes(recipe._id.toString()),
            }));
          } catch (favError) {
            console.error("Error fetching favorites:", favError);
          }
        }

        setRecipes(updatedRecipes);
        setFilteredRecipes(updatedRecipes);
        setError("");
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setError("Failed to load recipes. Please try again.");
      }
    };
    fetchRecipesAndFavorites();
  }, [category, user]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(query)
    );
    setFilteredRecipes(filtered);
  };

  const handleFavoriteToggle = async (recipeId, isFavorited) => {
    if (!user) {
      alert("Please log in to favorite recipes.");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      if (isFavorited) {
        await axios.delete(`/api/recipes/${recipeId}/favorite`, config);
        alert("Recipe removed from favorites!");
      } else {
        await axios.post(`/api/recipes/${recipeId}/favorite`, {}, config);
        alert("Recipe added to favorites!");
      }

      const favoritesRes = await axios.get("/api/recipes/favorites", config);
      const favoriteIds = favoritesRes.data.map((recipe) => recipe._id.toString());

      const updatedRecipes = recipes.map((recipe) => ({
        ...recipe,
        isFavorited: favoriteIds.includes(recipe._id.toString()),
      }));

      setRecipes(updatedRecipes);
      setFilteredRecipes(
        updatedRecipes.filter((recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setError("");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError(
        error.response?.data?.message || "Failed to update favorites. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans">
      <main className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="text-red-500 bg-red-50 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for a dish..."
            className="w-full max-w-md p-3 pl-12 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 transform hover:scale-105 ${
                category === cat
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-indigo-100 hover:to-purple-100"
              }`}
              key={cat}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              className="relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              key={recipe._id}
            >
              <Link to={`/recipe/${recipe._id}`}>
                <div className="relative">
                  {recipe.photo?.url && (
                    <img
                      src={recipe.photo.url}
                      alt={recipe.title}
                      className="w-full h-48 object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 capitalize mb-2">
                    {recipe.title}
                  </h2>
                  <p className="text-gray-600 text-sm">{recipe.category}</p>
                  <p className="text-gray-500 text-sm">{recipe.cookingTime} minutes</p>
                </div>
              </Link>
              {user && (
                <button
                  onClick={() => handleFavoriteToggle(recipe._id, recipe.isFavorited)}
                  className="absolute top-3 right-3 text-2xl focus:outline-none transition-transform duration-300 hover:scale-125"
                  title={recipe.isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {recipe.isFavorited ? (
                    <span className="text-red-500 drop-shadow">❤️</span>
                  ) : (
                    <span className="text-white drop-shadow">🤍</span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;