import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        console.log("No user logged in, skipping favorites fetch");
        return;
      }
      try {
        console.log("Fetching favorites from URL: /api/recipes/favorites");
        console.log("Fetching favorites with token:", localStorage.getItem("token"));
        const res = await axios.get("/api/recipes/favorites", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("Favorites API response:", res.data);
        setFavorites(res.data || []);
        setError("");
      } catch (error) {
        console.error("Error fetching favorites:", error.response || error);
        setError(
          error.response?.data?.message || "Failed to load favorite recipes. Please try again."
        );
      }
    };
    fetchFavorites();
  }, [user]);

  const handleFavoriteToggle = async (recipeId) => {
    try {
      console.log("Removing favorite with recipeId:", recipeId);
      await axios.delete(`/api/recipes/${recipeId}/favorite`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFavorites((prev) =>
        prev.filter((recipe) => recipe._id !== recipeId)
      );
      alert("Recipe removed from favorites!");
    } catch (error) {
      console.error("Error removing favorite:", error.response || error);
      setError(
        error.response?.data?.message || "Failed to remove favorite. Please try again."
      );
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <p className="text-gray-600">
          Please <Link to="/login" className="text-blue-500 hover:underline">log in</Link> to view your favorite recipes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4" >
      <h1 className="text-2xl font-bold mb-4">My Favorite Recipes</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {favorites.length === 0 ? (
        <p className="text-gray-600">You haven't added any favorite recipes yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((recipe) => (
            <div
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg duration-300 relative"
              key={recipe._id}
            >
              <Link to={`/recipe/${recipe._id}`}>
                {recipe.photo?.url && (
                  <img
                    src={recipe.photo.url}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold capitalize">
                    {recipe.title}
                  </h2>
                  <p className="text-gray-600">{recipe.category}</p>
                  <p className="text-gray-600">{recipe.cookingTime} minutes</p>
                </div>
              </Link>
              <button
                onClick={() => handleFavoriteToggle(recipe._id)}
                className="absolute top-2 right-2 text-2xl focus:outline-none"
                title="Remove from Favorites"
              >
                ❤️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;