import { useEffect, useState } from "react";
import platformAdminClient from "@/utils/platformAdminClient";
import { Link } from "react-router-dom";

const quickLinks = [
  { to: "/platform-admin/users", label: "Users", desc: "Create · edit · roles · passwords" },
  { to: "/platform-admin/companies", label: "Companies", desc: "Add · edit · assign recruiters" },
  { to: "/platform-admin/jobs", label: "Jobs", desc: "Post · edit · remove listings" },
  { to: "/platform-admin/applications", label: "Applications", desc: "Approve · reject · delete" },
  { to: "/platform-admin/reports", label: "Reports", desc: "25+ analytics & CSV export" },
];

const PlatformDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    platformAdminClient
      .get("/dashboard")
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch(() => {});
  }, []);

  if (!data?.stats) return <p className="text-gray-600">Loading dashboard...</p>;

  const { stats, recentUsers, recentJobs } = data;
  const cards = [
    { label: "Total Users", value: stats.users, color: "bg-blue-500" },
    { label: "Students", value: stats.students, color: "bg-green-500" },
    { label: "Recruiters", value: stats.recruiters, color: "bg-purple-500" },
    { label: "Companies", value: stats.companies, color: "bg-orange-500" },
    { label: "Jobs", value: stats.jobs, color: "bg-cyan-500" },
    { label: "Applications", value: stats.applications, color: "bg-pink-500" },
    { label: "Pending", value: stats.pending, color: "bg-yellow-500" },
    { label: "Accepted", value: stats.accepted, color: "bg-emerald-500" },
    { label: "Rejected", value: stats.rejected, color: "bg-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
      <p className="text-gray-600 mt-1 mb-6">
        Full platform control — manage every user, company, job, application, and report.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {quickLinks.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="bg-white rounded-lg shadow p-4 hover:ring-2 hover:ring-indigo-400 transition"
          >
            <h3 className="font-semibold text-indigo-700">{q.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{q.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p
              className={`text-2xl font-bold text-white ${c.color} inline-block px-3 py-1 rounded mt-2`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Recent Users</h2>
          <ul className="text-sm space-y-2">
            {recentUsers?.map((u) => (
              <li key={u._id} className="flex justify-between border-b pb-1">
                <span>{u.fullname}</span>
                <span className="text-gray-500">{u.role}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/platform-admin/users"
            className="text-indigo-600 text-sm mt-3 inline-block"
          >
            Manage all users →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Recent Jobs</h2>
          <ul className="text-sm space-y-2">
            {recentJobs?.map((j) => (
              <li key={j._id} className="flex justify-between border-b pb-1">
                <span>{j.title}</span>
                <span className="text-gray-500">{j.company?.name}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/platform-admin/jobs"
            className="text-indigo-600 text-sm mt-3 inline-block"
          >
            Manage all jobs →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
