import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");
  const offlineLogin = localStorage.getItem("offline_login");

  // 🚫 If neither exists → go login
  if (!token && !offlineLogin) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allow access
  return children;
}
