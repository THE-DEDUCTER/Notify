"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("notify_mock_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (role: Role) => {
    let newUser: User;
    switch (role) {
      case "Student":
      case "Faculty":
        newUser = { id: "stu_1", name: "Alex Student", role: "Student" };
        break;
      case "Assistant":
        newUser = { id: "ast_1", name: "John Builder", role: "Assistant", departmentId: "dept_1" };
        break;
      case "Admin":
        newUser = { id: "adm_1", name: "Campus Admin", role: "Admin" };
        break;
      case "SuperAdmin":
        newUser = { id: "sup_1", name: "Super Admin", role: "SuperAdmin" };
        break;
      default:
        newUser = { id: "usr_1", name: "Guest", role: "Student" };
    }
    setUser(newUser);
    localStorage.setItem("notify_mock_user", JSON.stringify(newUser));

    if (role === "Student" || role === "Faculty") router.push("/feed");
    else if (role === "Assistant") router.push("/assistant/dashboard");
    else if (role === "Admin") router.push("/admin/dashboard");
    else if (role === "SuperAdmin") router.push("/superadmin/analytics");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("notify_mock_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
