import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

// TODO: get the BACKEND_URL.

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * This provider should export a `user` context state that is
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  // const user = null; // TODO: Modify me.
  const [user, setUser] = useState(null);

  useEffect(() => {
    // TODO: complete me, by retriving token from localStorage and make an api call to GET /user/me.
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    function getUser() {
      return fetch(`${BACKEND_URL}/user/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            setUser(null);
            return;
          }
          return res.json();
        })
        .then((user_data) => {
          setUser(user_data.user);
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
        });
    }

    getUser();
  }, []);

  /*
   * Logout the currently authenticated user.
   *
   * @remarks This function will always navigate to "/".
   */
  const logout = () => {
    // TODO: complete me
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  /**
   * Login a user with their credentials.
   *
   * @remarks Upon success, navigates to "/profile".
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {string} - Upon failure, Returns an error message.
   */
  const login = async (username, password) => {
    // TODO: complete me

    return fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        console.log(response.ok);
        if (!response.ok) {
          setUser(null);
          throw new Error("Login request failed");
        }

        return response.json();
      })
      .then((user_data) => {
        console.log(user_data);

        localStorage.setItem("token", user_data.token);

        setUser(user_data.user);

        window.location.href = "/profile";

        return "All good";
      })
      .catch((err) => {
        console.error("Error registering user:", err);
        return err.message;
      });
  };

  /**
   * Registers a new user.
   *
   * @remarks Upon success, navigates to "/".
   * @param {Object} userData - The data of the user to register.
   * @returns {string} - Upon failure, returns an error message.
   */
  const register = async (userData) => {
    // TODO: complete me

    console.log(userData);
    return fetch(`${BACKEND_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errData) => {
            throw new Error(errData.error || "Registration failed");
          });
        }
        return response.json();
      })
      .then((user_data) => {
        setUser(user_data.user);

        navigate("/success");

        return null;
      })
      .catch((err) => {
        console.error("Error registering user:", err);
        return err.message;
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
