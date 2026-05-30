import { useEffect, useState } from "react";
import platformAdminClient from "@/utils/platformAdminClient";
import { toast } from "sonner";
import { downloadCsv } from "@/utils/exportCsv";
import AdminModal from "./AdminModal";

const emptyUser = {
  fullname: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "Student",
};

const PlatformUsers = () => {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    try {
      const res = await platformAdminClient.get("/users");
      if (res.data.success) setUsers(res.data.users || []);
    } catch {
      /* handled */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyUser);
    setEditId(null);
    setModal("create");
  };

  const openEdit = (u) => {
    setForm({
      fullname: u.fullname,
      email: u.email,
      phoneNumber: u.phoneNumber,
      password: "",
      role: u.role,
    });
    setEditId(u._id);
    setModal("edit");
  };

  const openReset = (u) => {
    setForm({ password: "" });
    setEditId(u._id);
    setModal("password");
  };

  const saveUser = async (e) => {
    e.preventDefault();
    try {
      if (modal === "create") {
        const res = await platformAdminClient.post("/users", form);
        if (res.data.success) {
          toast.success("User created");
          setModal(null);
          load();
        }
      } else if (modal === "edit") {
        const res = await platformAdminClient.patch(`/users/${editId}`, {
          fullname: form.fullname,
          email: form.email,
          phoneNumber: form.phoneNumber,
        });
        if (res.data.success) {
          toast.success("User updated");
          setModal(null);
          load();
        }
      } else if (modal === "password") {
        const res = await platformAdminClient.patch(`/users/${editId}/password`, {
          password: form.password,
        });
        if (res.data.success) {
          toast.success("Password reset");
          setModal(null);
        }
      }
    } catch {
      /* handled */
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await platformAdminClient.delete(`/users/${id}`);
      if (res.data.success) {
        toast.success("User deleted");
        load();
      }
    } catch {
      /* handled */
    }
  };

  const changeRole = async (id, role) => {
    try {
      const res = await platformAdminClient.patch(`/users/${id}/role`, { role });
      if (res.data.success) {
        toast.success("Role updated");
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
          <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create students, recruiters, admins · edit · reset password · change role · delete
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
          >
            + Add User
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "all-users.csv",
                ["Name", "Email", "Phone", "Role", "Registered"],
                users.map((u) => [u.fullname, u.email, u.phoneNumber, u.role, u.createdAt])
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
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-3">{u.fullname}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phoneNumber}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="Student">Student</option>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td className="p-3 space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => openEdit(u)}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openReset(u)}
                    className="text-amber-600 hover:underline"
                  >
                    Reset pwd
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteUser(u._id)}
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
          title={
            modal === "create"
              ? "Create User"
              : modal === "edit"
                ? "Edit User"
                : "Reset Password"
          }
          onClose={() => setModal(null)}
        >
          <form onSubmit={saveUser} className="space-y-3">
            {modal !== "password" && (
              <>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Full name"
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                  required
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Phone"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  required
                />
              </>
            )}
            {(modal === "create" || modal === "password") && (
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            )}
            {modal === "create" && (
              <select
                className="w-full border rounded px-3 py-2"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="Student">Student</option>
                <option value="Recruiter">Recruiter</option>
                <option value="Admin">Admin</option>
              </select>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-md"
            >
              Save
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  );
};

export default PlatformUsers;
