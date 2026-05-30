import { useEffect, useState } from "react";
import platformAdminClient from "@/utils/platformAdminClient";
import { toast } from "sonner";
import { downloadCsv } from "@/utils/exportCsv";

const PlatformApplications = () => {
  const [apps, setApps] = useState([]);

  const load = async () => {
    try {
      const res = await platformAdminClient.get("/applications");
      if (res.data.success) setApps(res.data.applications || []);
    } catch {
      /* handled */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await platformAdminClient.patch(`/applications/${id}/status`, {
        status,
      });
      if (res.data.success) {
        toast.success("Status updated");
        load();
      }
    } catch {
      /* handled */
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove this application?")) return;
    try {
      const res = await platformAdminClient.delete(`/applications/${id}`);
      if (res.data.success) {
        toast.success("Application removed");
        load();
      }
    } catch {
      /* handled */
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Accept · reject · pending · delete — full hiring pipeline control
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              "applications.csv",
              ["Student", "Job", "Status"],
              apps.map((a) => [a.applicant?.fullname, a.job?.title, a.status])
            )
          }
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Job</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a._id} className="border-t">
                <td className="p-3">{a.applicant?.fullname}</td>
                <td className="p-3">{a.applicant?.email}</td>
                <td className="p-3">{a.job?.title}</td>
                <td className="p-3">{a.job?.company?.name}</td>
                <td className="p-3">
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">pending</option>
                    <option value="shortlisted">shortlisted</option>
                    <option value="accepted">accepted</option>
                    <option value="rejected">rejected</option>
                  </select>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => remove(a._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlatformApplications;
