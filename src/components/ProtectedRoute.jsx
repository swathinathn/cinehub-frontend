import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("cinehub-user"));

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
