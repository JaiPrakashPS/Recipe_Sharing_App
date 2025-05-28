import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { user, logout, updateUserProfilePhoto } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [recipeError, setRecipeError] = useState("");
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Fetch user's recipes
  useEffect(() => {
    if (!user) return;

    const fetchUserRecipes = async () => {
      try {
        setLoadingRecipes(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setRecipeError("Authentication token not found.");
          return;
        }

        const res = await axios.get(`/api/recipes/users/${user._id}/recipes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched recipes:", res.data);
        setRecipes(res.data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setRecipeError(
          err.response?.data?.message || "Failed to load recipes. Please try again."
        );
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchUserRecipes();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) {
    setError("No file selected");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (!allowedTypes.includes(file.type)) {
    setError("Please upload a JPEG, PNG, or GIF image");
    return;
  }
  if (file.size > maxSize) {
    setError("File size exceeds 5MB limit");
    return;
  }

  const formData = new FormData();
  formData.append("photo", file);
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Authentication token not found. Please log in again.");
    return;
  }

  try {
    setUploading(true);
    setError("");
    console.log("Uploading photo to /api/recipes/users/profile/photo", {
      file: file.name,
      size: file.size,
    });
    const res = await axios.put("/api/recipes/users/profile/photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Upload response:", res.data);
    updateUserProfilePhoto(res.data.profilePhoto);

    // Fetch updated user data
    const userRes = await axios.get("/api/recipes/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    updateUserProfilePhoto(userRes.data.profilePhoto); // Update \n\n\t\t\t\t\t\t\t\tUpdate user in AuthContext
    console.log("Updated user data:", userRes.data);
  } catch (err) {
    console.error("Upload error:", {
      message: err.message,
      response: err.response,
      code: err.code,
      config: err.config,
    });
    if (!err.response) {
      setError("Network error: Could not connect to the server. Please check your connection and try again.");
    } else if (err.response?.status === 401) {
      setError("Session expired. Please log in again.");
      logout();
      navigate("/login");
    } else {
      setError(
        err.response?.data?.message ||
          `Failed to upload photo (Status: ${err.response?.status || "Unknown"}). Please try again.`
      );
    }
  } finally {
    setUploading(false);
  }
};

  // Debug navigation
  const handleRecipeClick = (recipeId) => {
    console.log("Navigating to recipe:", `/recipes/${recipeId}`);
  };

  if (!user) {
    return <div className="text-center p-4">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-8">
      <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-xl transform transition-all duration-500 hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Profile</h1>
        <div className="flex flex-col items-center space-y-6">
          {/* Profile Photo */}
          <div className="relative group">
            <img
              src={
                user.profilePhoto?.url ||
                "https://res.cloudinary.com/dummy/image/upload/v1234567890/default-profile.jpg"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 group-hover:opacity-75 transition duration-300"
            />
            <label
              htmlFor="photo-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm opacity-0 group-hover:opacity-100 transition duration-300 rounded-full cursor-pointer"
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* User Details */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* Error Message for Photo Upload */}
          {error && <div className="text-red-500 text-center">{error}</div>}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full max-w-xs p-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-800 transition duration-300 transform hover:scale-105"
          >
            Logout
          </button>

          {/* User's Recipes */}
          <div className="w-full mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Recipes</h2>
            {recipeError && <div className="text-red-500 text-center mb-4">{recipeError}</div>}
            {loadingRecipes ? (
              <div className="text-center text-gray-600">Loading recipes...</div>
            ) : recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe._id}
                    to={`/recipes/${recipe._id}`}
                    onClick={() => handleRecipeClick(recipe._id)}
                    className="bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
                  >
                    <div className="relative">
                      <img
                        src={
                          recipe.photo?.url ||
                          "https://res.cloudinary.com/dummy/image/upload/v1234567890/default-recipe.jpg"
                        }
                        alt={recipe.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 capitalize">
                        {recipe.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 truncate">{recipe.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center">You haven't added any recipes yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;