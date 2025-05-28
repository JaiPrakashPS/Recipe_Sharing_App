import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      console.log("Initializing auth, token found:", !!token);
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await axios.get("/api/auth/me");
          console.log("User fetched:", res.data);
          setUser(res.data);
        } catch (error) {
          console.error("Error fetching user:", error.response || error);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          setUser(null);
        }
      } else {
        console.log("No token found, setting user to null");
        setUser(null);
      }
      setLoading(false);
      console.log("Auth initialization complete, loading home page");
    };
    initializeAuth();
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      console.log("Login response:", res.data);
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setUser(res.data);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.response || error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      console.log("Register response:", res.data);
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setUser(res.data);
      navigate("/");
    } catch (error) {
      console.error("Register error:", error.response || error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out, clearing user state");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
    console.log("Logout complete, navigated to /login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};