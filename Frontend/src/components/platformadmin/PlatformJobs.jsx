import { useEffect, useState } from "react";
import platformAdminClient from "@/utils/platformAdminClient";
import { toast } from "sonner";
import { downloadCsv } from "@/utils/exportCsv";
import AdminModal from "./AdminModal";

const emptyJob = {
  title: "",
  description: "",
  requirements: "",
  salary: "",
  location: "",
  jobType: "Full-time",
  experienceLevel: 0,
  position: 1,
  companyId: "",
};

const PlatformJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyJob);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    try {
      const [jRes, cRes] = await Promise.all([
        platformAdminClient.get("/jobs"),
        platformAdminClient.get("/companies"),
      ]);
      if (jRes.data.success) setJobs(jRes.data.jobs || []);
      if (cRes.data.success) setCompanies(cRes.data.companies || []);
    } catch {
      /* handled */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyJob);
    setEditId(null);
    setModal("create");
  };

  const openEdit = (j) => {
    setForm({
      title: j.title,
      description: j.description,
      requirements: (j.requirements || []).join(", "),
      salary: j.salary,
      location: j.location,
      jobType: j.jobType,
      experienceLevel: j.experienceLevel,
      position: j.position,
      companyId: j.company?._id || j.company || "",
    });
    setEditId(j._id);
    setModal("edit");
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const res =
        modal === "create"
          ? await platformAdminClient.post("/jobs", form)
          : await platformAdminClient.patch(`/jobs/${editId}`, form);
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
    if (!confirm("Delete job and its applications?")) return;
    try {
      const res = await platformAdminClient.delete(`/jobs/${id}`);
      if (res.data.success) {
        toast.success("Job deleted");
        load();
      }
    } catch {
      /* handled */
    }
  };

  const jobForm = (
    <form onSubmit={save} className="space-y-3">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Job title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <select
        className="w-full border rounded px-3 py-2"
        value={form.companyId}
        onChange={(e) => setForm({ ...form, companyId: e.target.value })}
        required
      >
        <option value="">Select company</option>
        {companies.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="Description"
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Requirements (comma separated)"
        value={form.requirements}
        onChange={(e) => setForm({ ...form, requirements: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className="border rounded px-3 py-2"
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Job type"
          value={form.jobType}
          onChange={(e) => setForm({ ...form, jobType: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          type="number"
          placeholder="Experience (years)"
          value={form.experienceLevel}
          onChange={(e) =>
            setForm({ ...form, experienceLevel: Number(e.target.value) })
          }
          required
        />
        <input
          className="border rounded px-3 py-2 col-span-2"
          type="number"
          placeholder="Open positions"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
          required
        />
      </div>
      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md">
        Save
      </button>
    </form>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Post jobs for any company · edit · delete (clears applications)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
          >
            + Post Job
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "jobs.csv",
                ["Title", "Company", "Location", "Salary"],
                jobs.map((j) => [j.title, j.company?.name, j.location, j.salary])
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
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Salary</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j._id} className="border-t">
                <td className="p-3">{j.title}</td>
                <td className="p-3">{j.company?.name}</td>
                <td className="p-3">{j.jobType}</td>
                <td className="p-3">{j.salary}</td>
                <td className="p-3 space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(j)}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(j._id)}
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
          title={modal === "create" ? "Post Job" : "Edit Job"}
          onClose={() => setModal(null)}
        >
          {jobForm}
        </AdminModal>
      )}
    </div>
  );
};

export default PlatformJobs;
