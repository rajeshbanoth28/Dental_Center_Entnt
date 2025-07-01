import { createContext, useContext, useEffect, useState } from "react";

import { getUsers,seedData } from "../utils/storage.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("sessionUser"))
  );
  useEffect(() => {
    seedData();
  }, []);

  const login = (email, password) => {
    const users = getUsers();
    const match = users.find(
      (u) => u.email === email && u.password === password
    );
    if (match) {
      setUser(match);
      localStorage.setItem("sessionUser", JSON.stringify(match));
      return { success: true, role: match.role };
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sessionUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
