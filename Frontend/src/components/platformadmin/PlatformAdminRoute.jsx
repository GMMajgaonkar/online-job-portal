import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getPlatformAdminToken } from "@/utils/platformAdminClient";

const PlatformAdminRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const hasToken = !!getPlatformAdminToken();

  if (!user || user.role !== "Admin" || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PlatformAdminRoute;
