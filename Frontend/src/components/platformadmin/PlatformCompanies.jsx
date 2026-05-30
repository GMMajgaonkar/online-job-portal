import { useEffect, useState } from "react";
import platformAdminClient from "@/utils/platformAdminClient";
import { toast } from "sonner";
import { downloadCsv } from "@/utils/exportCsv";
import AdminModal from "./AdminModal";

const emptyCompany = {
  name: "",
  userId: "",
  description: "",
  website: "",
  location: "",
};

const PlatformCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCompany);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    try {
      const [cRes, uRes] = await Promise.all([
        platformAdminClient.get("/companies"),
        platformAdminClient.get("/users"),
      ]);
      if (cRes.data.success) setCompanies(cRes.data.companies || []);
      if (uRes.data.success) {
        setRecruiters(
          (uRes.data.users || []).filter((u) => u.role === "Recruiter")
        );
      }
    } catch {
      /* handled */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyCompany);
    setEditId(null);
    setModal("create");
  };

  const openEdit = (c) => {
    setForm({
      name: c.name,
      userId: c.userId?._id || c.userId || "",
      description: c.description || "",
      website: c.website || "",
      location: c.location || "",
    });
    setEditId(c._id);
    setModal("edit");
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const res =
        modal === "create"
          ? await platformAdminClient.post("/companies", form)
          : await platformAdminClient.patch(`/companies/${editId}`, form);
      if (res.data.success) {
        toast.success(res.data.message);
        setModal(null);
        load();
      }
    } catch {
      /* handled */
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete company and all its jobs?")) return;
    try {
      const res = await platformAdminClient.delete(`/companies/${id}`);
      if (res.data.success) {
        toast.success("Deleted");
        load();
      }
    } catch {
      /* handled */
    }
  };

  const formFields = (
    <form onSubmit={save} className="space-y-3">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Company name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <select
        className="w-full border rounded px-3 py-2"
        value={form.userId}
        onChange={(e) => setForm({ ...form, userId: e.target.value })}
        required
      >
        <option value="">Select recruiter owner</option>
        {recruiters.map((r) => (
          <option key={r._id} value={r._id}>
            {r.fullname} ({r.email})
          </option>
        ))}
      </select>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Website"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
      />
      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="Description"
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md">
        Save
      </button>
    </form>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Companies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create · edit · assign recruiter · delete (removes related jobs)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
          >
            + Add Company
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "companies.csv",
                ["Name", "Location", "Owner"],
                companies.map((c) => [c.name, c.location, c.userId?.fullname])
              )
            }
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.location || "-"}</td>
                <td className="p-3">{c.userId?.fullname || "-"}</td>
                <td className="p-3 space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c._id)}
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

      {modal && (
        <AdminModal
          title={modal === "create" ? "Create Company" : "Edit Company"}
          onClose={() => setModal(null)}
        >
          {formFields}
        </AdminModal>
      )}
    </div>
  );
};

export default PlatformCompanies;
