import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data";
import { setPlatformAdminToken } from "@/utils/platformAdminClient";
import { setUser } from "@/redux/authSlice";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";

const links = [
  { to: "/platform-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/platform-admin/users", label: "Users", icon: Users },
  { to: "/platform-admin/companies", label: "Companies", icon: Building2 },
  { to: "/platform-admin/jobs", label: "Jobs", icon: Briefcase },
  { to: "/platform-admin/applications", label: "Applications", icon: FileText },
  { to: "/platform-admin/reports", label: "Reports (25+)", icon: BarChart3 },
];

const PlatformAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const logout = async () => {
    try {
      await axios.post(`${USER_API_ENDPOINT}/logout`, {}, { withCredentials: true });
      setPlatformAdminToken(null);
      dispatch(setUser(null));
      navigate("/login");
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-lg font-bold">Platform Admin</h1>
          <p className="text-xs text-slate-400 mt-1">{user?.fullname}</p>
          <p className="text-[10px] text-slate-500 mt-2 leading-tight">
            Full control: users · companies · jobs · applications · reports
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                location.pathname.startsWith(to)
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="m-3 flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-slate-800 rounded-md"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PlatformAdminLayout;
