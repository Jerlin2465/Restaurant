// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children, allowedRoles = [], allowedDesigs = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" replace />;

  const role = user?.role?.toLowerCase() || "";
  const desig = user?.designation?.toLowerCase() || "";

  const roleOk = allowedRoles.length === 0 || allowedRoles.includes(role);
  const desigOk = allowedDesigs.length === 0 || allowedDesigs.includes(desig);

  // admin / manager can access everything
  if (role === "admin" || role === "manager") return children;

  if (roleOk || desigOk) return children;

  return <Navigate to="/unauthorized" replace />;
};

export default AdminRoute;
