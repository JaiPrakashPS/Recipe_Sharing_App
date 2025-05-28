import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: "",
    description: "",
  });
  const [replyForms, setReplyForms] = useState({});
  const [reviewError, setReviewError] = useState("");
  const [replyError, setReplyError] = useState("");
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.error("Error fetching recipe:", err);
      }
    };
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    // Debug user and recipe data
    console.log("User:", user);
    console.log("Recipe:", recipe);
  }, [user, recipe]);

  const handleReviewChange = (field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
    setReviewError("");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");

    if (!user) {
      setReviewError("You must be logged in to submit a review");
      return;
    }

    try {
      const res = await axios.post(`/api/recipes/${id}/reviews`, {
        rating: Number(reviewForm.rating),
        description: reviewForm.description,
      });
      setRecipe(res.data);
      setReviewForm({ rating: "", description: "" });
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    }
  };

  const handleReplyChange = (reviewId, value) => {
    setReplyForms((prev) => ({ ...prev, [reviewId]: value }));
    setReplyError("");
  };

  const handleReplySubmit = async (reviewId, e) => {
    e.preventDefault();
    setReplyError("");

    if (!user) {
      setReplyError("You must be logged in to reply to a review");
      return;
    }

    const description = replyForms[reviewId] || "";
    if (!description) {
      setReplyError("Reply description is required");
      return;
    }

    try {
      const res = await axios.post(`/api/recipes/${id}/reviews/${reviewId}/replies`, {
        description,
      });
      setRecipe(res.data);
      setReplyForms((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      setReplyError(err.response?.data?.message || "Failed to submit reply");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/recipes/${id}`);
      console.log("Recipe deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting recipe:", error.response?.data || error.message);
    }
  };

  if (!recipe) return <div className="text-center text-gray-600 p-6">Loading recipe...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight capitalize">{recipe.title}</h1>
          {/* Display Creator's Username */}
          <p className="text-sm mt-2">
            Created by: <span className="font-semibold">{recipe.createdBy?.username || "Unknown"}</span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          {recipe.photo?.url && (
            <div className="relative">
              <img
                src={recipe.photo.url}
                alt={recipe.title}
                className="w-full h-96 object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <p className="text-gray-600 text-sm">Category: {recipe.category}</p>
              <p className="text-gray-600 text-sm">Cooking time: {recipe.cookingTime} minutes</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ingredients</h2>
            <ul className="pl-6 mb-4 list-disc text-gray-700">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">Instructions</h2>
            <p className="text-gray-700 mb-6">{recipe.instructions}</p>

            {/* Review Submission Form */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add a Review</h2>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 mb-6">
                {reviewError && (
                  <div className="text-red-500 bg-red-50 p-3 rounded-lg text-center">
                    {reviewError}
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Rating (1-10)</label>
                  <input
                    type="number"
                    value={reviewForm.rating}
                    onChange={(e) => handleReviewChange("rating", e.target.value)}
                    className="w-full max-w-md p-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                    min="1"
                    max="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Description</label>
                  <textarea
                    value={reviewForm.description}
                    onChange={(e) => handleReviewChange("description", e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <p className="text-gray-600 mb-4">
                Please <Link to="/login" className="text-indigo-500 hover:text-indigo-700 transition duration-300">log in</Link> to submit a review.
              </p>
            )}

            {/* Display Reviews */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reviews</h2>
            {recipe.reviews.length > 0 ? (
              <div className="space-y-6">
                {recipe.reviews.map((review, index) => (
                  <div key={index} className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-700 font-medium">
                        <strong>{review.user.username}</strong> rated {review.rating}/10
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-600 mt-1">{review.description}</p>

                    {/* Display Replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="ml-6 mt-4 space-y-4">
                        {review.replies.map((reply, replyIndex) => (
                          <div key={replyIndex} className="border-l-2 border-indigo-200 pl-4">
                            <p className="text-gray-700 font-medium">
                              <strong>{reply.user.username}</strong>
                            </p>
                            <p className="text-gray-600">{reply.description}</p>
                            <p className="text-gray-500 text-sm">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Submission Form */}
                    {user ? (
                      <form
                        onSubmit={(e) => handleReplySubmit(review._id, e)}
                        className="ml-6 mt-4 space-y-3"
                      >
                        {replyError && (
                          <div className="text-red-500 bg-red-50 p-3 rounded-lg text-center">
                            {replyError}
                          </div>
                        )}
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Reply</label>
                          <textarea
                            value={replyForms[review._id] || ""}
                            onChange={(e) => handleReplyChange(review._id, e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                            placeholder="Write your reply..."
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md transition-all duration-300 transform hover:scale-105"
                        >
                          Submit Reply
                        </button>
                      </form>
                    ) : (
                      <p className="ml-6 text-gray-600">
                        Please <Link to="/login" className="text-indigo-500 hover:text-indigo-700 transition duration-300">log in</Link> to reply.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet.</p>
            )}

            {/* Edit/Delete Buttons */}
            {user && recipe.createdBy && user._id === (recipe.createdBy._id ? recipe.createdBy._id.toString() : recipe.createdBy.toString()) && (
              <div className="flex space-x-4 mt-8">
                <Link to={`/edit-recipe/${id}`}>
                  <button className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md transition-all duration-300 transform hover:scale-105">
                    Edit
                  </button>
                </Link>
                <button
                  className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md transition-all duration-300 transform hover:scale-105"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeDetail;