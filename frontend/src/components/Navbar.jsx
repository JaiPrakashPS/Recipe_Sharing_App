import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const handleLogoutClick = () => {
    console.log("Logout button clicked, calling logout function");
    logout();
  };

  console.log("Navbar rendering with user:", user);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold tracking-tight font-sans">
          Recipe App
        </Link>
        <div className="flex space-x-6">
          {user ? (
            <>
            <Link
                to="/"
                className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300"
              >
                Home
              </Link>
              <Link
                to="/favorites"
                className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300"
              >
                Favorites
              </Link>
              <Link
                to="/add-recipe"
                className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300"
              >
                Add Recipe
              </Link>
              <Link
                to="/profile"
                className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300"
              >
                Profile
              </Link>
              <button
                onClick={handleLogoutClick}
                className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;