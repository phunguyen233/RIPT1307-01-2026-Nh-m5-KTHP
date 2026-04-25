import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return false;
    const user = JSON.parse(raw);
    const rawRole = (user?.role || user?.vai_tro || "") as string;
    const normalize = (s?: string) =>
      (s || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
    const roleNorm = normalize(rawRole);
    const isAdmin = roleNorm.includes("admin") || roleNorm.includes("quan") || user?.ten_dang_nhap === "admin";
    return !!isAdmin;
  } catch {
    return false;
  }
};

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireAuth;
