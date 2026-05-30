import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

export const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
        success: false,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (!user || user.role !== "Admin") {
      return res.status(401).json({
        message: "Invalid admin credentials",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid admin credentials",
        success: false,
      });
    }

    const token = jwt.sign(
      { userId: String(user._id) },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome ${user.fullname}`,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sign-in failed", success: false });
  }
};

const sanitizeUser = (u) => ({
  _id: u._id,
  fullname: u.fullname,
  email: u.email,
  phoneNumber: u.phoneNumber,
  role: u.role,
  adharcard: u.adharcard,
  pancard: u.pancard,
  profile: u.profile,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export const getDashboard = async (req, res) => {
  try {
    const [users, students, recruiters, admins, companies, jobs, applications] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "Student" }),
        User.countDocuments({ role: "Recruiter" }),
        User.countDocuments({ role: "Admin" }),
        Company.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
      ]);

    const statusCounts = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);
    const recentJobs = await Job.find()
      .populate("company", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        users,
        students,
        recruiters,
        admins,
        companies,
        jobs,
        applications,
        pending: statusCounts.find((s) => s._id === "pending")?.count || 0,
        accepted: statusCounts.find((s) => s._id === "accepted")?.count || 0,
        rejected: statusCounts.find((s) => s._id === "rejected")?.count || 0,
      },
      recentUsers: recentUsers.map(sanitizeUser),
      recentJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Dashboard error", success: false });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users: users.map(sanitizeUser) });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.id)) {
      return res.status(400).json({ message: "Cannot delete yourself", success: false });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["Student", "Recruiter", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role", success: false });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllCompaniesAdmin = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate("userId", "fullname email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const deleteCompanyAdmin = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.params.id });
    const jobIds = jobs.map((j) => j._id);
    if (jobIds.length) {
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
    }
    await Company.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Company and related jobs removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company")
      .populate("created_by", "fullname email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const deleteJobAdmin = async (req, res) => {
  try {
    await Application.deleteMany({ job: req.params.id });
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllApplicationsAdmin = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({ path: "job", populate: { path: "company" } })
      .populate("applicant", "fullname email phoneNumber role profile")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateApplicationStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "shortlisted", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status", success: false });
    }
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        shortlisted: status === "shortlisted",
      },
      { new: true }
    );
    res.status(200).json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const deleteApplicationAdmin = async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Application removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const createUserAdmin = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role, adharcard, pancard } =
      req.body;
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Name, email, phone, password and role are required",
        success: false,
      });
    }
    if (!["Student", "Recruiter", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role", success: false });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already exists", success: false });
    }

    const suffix = Date.now().toString().slice(-10);
    const user = await User.create({
      fullname,
      email: email.trim().toLowerCase(),
      phoneNumber,
      password: await bcrypt.hash(password, 10),
      role,
      adharcard: adharcard || `ADM${suffix}`,
      pancard: pancard || `PAN${suffix}`,
      profile: { profilePhoto: "", skills: [] },
    });

    res.status(201).json({
      success: true,
      message: "User created",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate phone, email, Aadhar or PAN",
        success: false,
      });
    }
    res.status(500).json({ message: "Could not create user", success: false });
  }
};

export const updateUserAdmin = async (req, res) => {
  try {
    const { fullname, email, phoneNumber } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    if (fullname) user.fullname = fullname;
    if (email) user.email = email.trim().toLowerCase();
    if (phoneNumber) user.phoneNumber = phoneNumber;
    await user.save();
    res.status(200).json({
      success: true,
      message: "User updated",
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Could not update user", success: false });
  }
};

export const resetUserPasswordAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({ success: true, message: "Password reset" });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed", success: false });
  }
};

export const createCompanyAdmin = async (req, res) => {
  try {
    const { name, userId, description, website, location } = req.body;
    if (!name || !userId) {
      return res.status(400).json({
        message: "Company name and recruiter (owner) are required",
        success: false,
      });
    }
    const owner = await User.findById(userId);
    if (!owner) {
      return res.status(400).json({ message: "Recruiter not found", success: false });
    }

    const company = await Company.create({
      name,
      userId,
      description: description || "",
      website: website || "",
      location: location || "",
    });
    res.status(201).json({ success: true, message: "Company created", company });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Company name already exists", success: false });
    }
    res.status(500).json({ message: "Could not create company", success: false });
  }
};

export const updateCompanyAdmin = async (req, res) => {
  try {
    const { name, description, website, location, userId } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { name, description, website, location, ...(userId ? { userId } : {}) },
      { new: true }
    ).populate("userId", "fullname email");
    if (!company) {
      return res.status(404).json({ message: "Company not found", success: false });
    }
    res.status(200).json({ success: true, message: "Company updated", company });
  } catch (error) {
    res.status(500).json({ message: "Could not update company", success: false });
  }
};

export const createJobAdmin = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
      companyId,
      created_by,
    } = req.body;

    if (
      !title ||
      !description ||
      !salary ||
      !location ||
      !jobType ||
      experienceLevel == null ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "All job fields and company are required",
        success: false,
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({ message: "Company not found", success: false });
    }

    const reqList = Array.isArray(requirements)
      ? requirements
      : String(requirements || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const job = await Job.create({
      title,
      description,
      requirements: reqList.length ? reqList : ["General"],
      salary: String(salary),
      location,
      jobType,
      experienceLevel: Number(experienceLevel),
      position: Number(position),
      company: companyId,
      created_by: created_by || company.userId || req.id,
    });

    res.status(201).json({ success: true, message: "Job created", job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create job", success: false });
  }
};

export const updateJobAdmin = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
      companyId,
    } = req.body;

    const update = {};
    if (title != null) update.title = title;
    if (description != null) update.description = description;
    if (salary != null) update.salary = String(salary);
    if (location != null) update.location = location;
    if (jobType != null) update.jobType = jobType;
    if (experienceLevel != null) update.experienceLevel = Number(experienceLevel);
    if (position != null) update.position = Number(position);
    if (companyId != null) update.company = companyId;
    if (requirements != null) {
      update.requirements = Array.isArray(requirements)
        ? requirements
        : String(requirements)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    const job = await Job.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate("company");
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    res.status(200).json({ success: true, message: "Job updated", job });
  } catch (error) {
    res.status(500).json({ message: "Could not update job", success: false });
  }
};

const reportHandlers = {
  "platform-overview": async () => {
    const stats = {
      users: await User.countDocuments(),
      companies: await Company.countDocuments(),
      jobs: await Job.countDocuments(),
      applications: await Application.countDocuments(),
    };
    return { title: "Platform Overview Report", columns: ["Metric", "Count"], rows: Object.entries(stats).map(([k, v]) => [k, v]) };
  },
  "all-users": async () => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return {
      title: "All Users Report",
      columns: ["Name", "Email", "Phone", "Role", "Registered"],
      rows: users.map((u) => [u.fullname, u.email, u.phoneNumber, u.role, u.createdAt]),
    };
  },
  "users-by-role": async () => {
    const data = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
    return {
      title: "Users by Role Report",
      columns: ["Role", "Count"],
      rows: data.map((d) => [d._id, d.count]),
    };
  },
  "student-users": async () => {
    const users = await User.find({ role: "Student" }).select("-password");
    return {
      title: "Student Users Report",
      columns: ["Name", "Email", "Skills", "Registered"],
      rows: users.map((u) => [u.fullname, u.email, (u.profile?.skills || []).join(", "), u.createdAt]),
    };
  },
  "recruiter-users": async () => {
    const users = await User.find({ role: "Recruiter" }).select("-password");
    return {
      title: "Recruiter Users Report",
      columns: ["Name", "Email", "Phone", "Registered"],
      rows: users.map((u) => [u.fullname, u.email, u.phoneNumber, u.createdAt]),
    };
  },
  "new-registrations": async () => {
    const users = await User.find().select("fullname email role createdAt").sort({ createdAt: -1 });
    return {
      title: "New Registrations Report",
      columns: ["Name", "Email", "Role", "Date"],
      rows: users.map((u) => [u.fullname, u.email, u.role, u.createdAt]),
    };
  },
  "all-companies": async () => {
    const companies = await Company.find().populate("userId", "fullname");
    return {
      title: "All Companies Report",
      columns: ["Company", "Location", "Website", "Owner", "Created"],
      rows: companies.map((c) => [c.name, c.location || "-", c.website || "-", c.userId?.fullname || "-", c.createdAt]),
    };
  },
  "companies-by-location": async () => {
    const data = await Company.aggregate([
      { $match: { location: { $exists: true, $ne: "" } } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return {
      title: "Companies by Location Report",
      columns: ["Location", "Count"],
      rows: data.map((d) => [d._id, d.count]),
    };
  },
  "all-jobs": async () => {
    const jobs = await Job.find().populate("company", "name");
    return {
      title: "All Jobs Report",
      columns: ["Title", "Company", "Location", "Type", "Salary", "Posted"],
      rows: jobs.map((j) => [j.title, j.company?.name, j.location, j.jobType, j.salary, j.createdAt]),
    };
  },
  "jobs-by-location": async () => {
    const data = await Job.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return {
      title: "Jobs by Location Report",
      columns: ["Location", "Job Count"],
      rows: data.map((d) => [d._id, d.count]),
    };
  },
  "jobs-by-type": async () => {
    const data = await Job.aggregate([
      { $group: { _id: "$jobType", count: { $sum: 1 } } },
    ]);
    return {
      title: "Jobs by Type Report",
      columns: ["Job Type", "Count"],
      rows: data.map((d) => [d._id, d.count]),
    };
  },
  "jobs-by-experience": async () => {
    const data = await Job.aggregate([
      { $group: { _id: "$experienceLevel", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return {
      title: "Jobs by Experience Level Report",
      columns: ["Experience (years)", "Count"],
      rows: data.map((d) => [d._id, d.count]),
    };
  },
  "salary-jobs": async () => {
    const jobs = await Job.find().select("title salary location company").populate("company", "name");
    return {
      title: "Salary Jobs Report",
      columns: ["Title", "Company", "Salary", "Location"],
      rows: jobs.map((j) => [j.title, j.company?.name, j.salary, j.location]),
    };
  },
  "all-applications": async () => {
    const apps = await Application.find()
      .populate("applicant", "fullname email")
      .populate({ path: "job", select: "title", populate: { path: "company", select: "name" } });
    return {
      title: "All Applications Report",
      columns: ["Student", "Job", "Company", "Status", "Applied"],
      rows: apps.map((a) => [
        a.applicant?.fullname,
        a.job?.title,
        a.job?.company?.name,
        a.status,
        a.createdAt,
      ]),
    };
  },
  "applications-by-status": async () => {
    const data = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    return {
      title: "Applications by Status Report",
      columns: ["Status", "Count"],
      rows: data.map((d) => [d._id, d.count]),
    };
  },
  "pending-applications": async () => {
    const apps = await Application.find({ status: "pending" })
      .populate("applicant", "fullname email")
      .populate({ path: "job", select: "title" });
    return {
      title: "Pending Applications Report",
      columns: ["Student", "Job", "Applied Date"],
      rows: apps.map((a) => [a.applicant?.fullname, a.job?.title, a.createdAt]),
    };
  },
  "accepted-applications": async () => {
    const apps = await Application.find({ status: "accepted" })
      .populate("applicant", "fullname email")
      .populate({ path: "job", select: "title" });
    return {
      title: "Accepted Applications Report",
      columns: ["Student", "Job", "Accepted Date"],
      rows: apps.map((a) => [a.applicant?.fullname, a.job?.title, a.updatedAt]),
    };
  },
  "rejected-applications": async () => {
    const apps = await Application.find({ status: "rejected" })
      .populate("applicant", "fullname email")
      .populate({ path: "job", select: "title" });
    return {
      title: "Rejected Applications Report",
      columns: ["Student", "Job", "Rejected Date"],
      rows: apps.map((a) => [a.applicant?.fullname, a.job?.title, a.updatedAt]),
    };
  },
  "applications-per-job": async () => {
    const jobs = await Job.find().populate("company", "name");
    const rows = [];
    for (const job of jobs) {
      const count = await Application.countDocuments({ job: job._id });
      rows.push([job.title, job.company?.name, count]);
    }
    return {
      title: "Applications per Job Report",
      columns: ["Job", "Company", "Applications"],
      rows: rows.sort((a, b) => b[2] - a[2]),
    };
  },
  "top-applied-jobs": async () => {
    const data = await Application.aggregate([
      { $group: { _id: "$job", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    const rows = [];
    for (const d of data) {
      const job = await Job.findById(d._id).populate("company", "name");
      if (job) rows.push([job.title, job.company?.name, d.count]);
    }
    return {
      title: "Top Applied Jobs Report",
      columns: ["Job", "Company", "Applications"],
      rows,
    };
  },
  "hiring-funnel": async () => {
    const total = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: "pending" });
    const accepted = await Application.countDocuments({ status: "accepted" });
    const rejected = await Application.countDocuments({ status: "rejected" });
    return {
      title: "Hiring Funnel Report",
      columns: ["Stage", "Count", "Percentage"],
      rows: [
        ["Total Applications", total, "100%"],
        ["Pending", pending, total ? `${((pending / total) * 100).toFixed(1)}%` : "0%"],
        ["Accepted", accepted, total ? `${((accepted / total) * 100).toFixed(1)}%` : "0%"],
        ["Rejected", rejected, total ? `${((rejected / total) * 100).toFixed(1)}%` : "0%"],
      ],
    };
  },
  "recruiter-activity": async () => {
    const recruiters = await User.find({ role: "Recruiter" });
    const rows = [];
    for (const r of recruiters) {
      const jobCount = await Job.countDocuments({ created_by: r._id });
      const company = await Company.findOne({ userId: r._id });
      rows.push([r.fullname, r.email, company?.name || "-", jobCount]);
    }
    return {
      title: "Recruiter Activity Report",
      columns: ["Recruiter", "Email", "Company", "Jobs Posted"],
      rows,
    };
  },
  "student-applications": async () => {
    const students = await User.find({ role: "Student" });
    const rows = [];
    for (const s of students) {
      const count = await Application.countDocuments({ applicant: s._id });
      rows.push([s.fullname, s.email, count]);
    }
    return {
      title: "Student Application History Report",
      columns: ["Student", "Email", "Total Applications"],
      rows: rows.sort((a, b) => b[2] - a[2]),
    };
  },
  "monthly-growth": async () => {
    const users = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const jobs = await Job.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return {
      title: "Monthly Growth Report",
      columns: ["Month", "New Users", "New Jobs"],
      rows: users.map((u, i) => [u._id, u.count, jobs[i]?.count || 0]),
    };
  },
  "platform-health": async () => {
    const openJobs = await Job.countDocuments();
    const activeStudents = await User.countDocuments({ role: "Student" });
    const activeRecruiters = await User.countDocuments({ role: "Recruiter" });
    const pendingApps = await Application.countDocuments({ status: "pending" });
    return {
      title: "Platform Health Report",
      columns: ["Indicator", "Value", "Status"],
      rows: [
        ["Open Jobs", openJobs, openJobs > 0 ? "Good" : "Low"],
        ["Students", activeStudents, activeStudents > 0 ? "Good" : "Low"],
        ["Recruiters", activeRecruiters, activeRecruiters > 0 ? "Good" : "Low"],
        ["Pending Reviews", pendingApps, pendingApps < 50 ? "Good" : "High"],
      ],
    };
  },
};

export const getReport = async (req, res) => {
  try {
    const handler = reportHandlers[req.params.reportId];
    if (!handler) {
      return res.status(404).json({ message: "Report not found", success: false });
    }
    const report = await handler();
    const generatedAt = new Date().toISOString();
    res.status(200).json({ success: true, reportId: req.params.reportId, generatedAt, ...report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Report generation failed", success: false });
  }
};

export const listReports = async (req, res) => {
  res.status(200).json({
    success: true,
    reports: Object.keys(reportHandlers).map((id) => ({
      id,
      name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
    total: Object.keys(reportHandlers).length,
  });
};
