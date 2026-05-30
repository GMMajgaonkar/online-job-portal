import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ATS_API_ENDPOINT, APPLICATION_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const AtsScoreBadge = ({ score }) => {
  const n = score ?? 0;
  const cls =
    n >= 75 ? "bg-green-600" : n >= 50 ? "bg-yellow-500 text-black" : "bg-red-500";
  return (
    <span className={`${cls} text-white text-xs font-bold px-2 py-1 rounded`}>
      {n}%
    </span>
  );
};

const AtsRecruiterDashboard = () => {
  const { id: jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState("");
  const [skill, setSkill] = useState("");
  const [search, setSearch] = useState("");
  const [booleanQuery, setBooleanQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (minScore) params.minScore = minScore;
      if (skill) params.skill = skill;
      if (search) params.search = search;
      if (booleanQuery) params.booleanQuery = booleanQuery;

      const res = await axios.get(`${ATS_API_ENDPOINT}/job/${jobId}/ranked`, {
        params,
        withCredentials: true,
      });
      if (res.data.success) setApplicants(res.data.applicants || []);
    } catch {
      toast.error("Failed to load ATS rankings");
    } finally {
      setLoading(false);
    }
  }, [jobId, minScore, skill, search, booleanQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleShortlist = async (applicationId) => {
    try {
      const res = await axios.patch(
        `${ATS_API_ENDPOINT}/shortlist/${applicationId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        if (res.data.shortlisted) {
          if (res.data.emailSent) {
            toast.success("Shortlisted — status updated. Email sent to candidate.");
          } else if (res.data.emailReason === "smtp-not-configured") {
            toast.success(
              "Shortlisted — status updated. Add SMTP settings to Backend/.env (not .env.example) and restart server."
            );
          } else if (res.data.emailError) {
            toast.error(`Shortlisted, but email failed: ${res.data.emailError}`);
          } else {
            toast.success("Shortlisted — status updated.");
          }
        } else {
          toast.success("Removed from shortlist — status set to pending");
        }
        load();
      }
    } catch {
      toast.error("Shortlist update failed");
    }
  };

  const updateStatus = async (status, applicationId) => {
    try {
      await axios.post(
        `${APPLICATION_API_ENDPOINT}/status/${applicationId}/update`,
        { status },
        { withCredentials: true }
      );
      toast.success("Status updated");
      load();
    } catch {
      toast.error("Status update failed");
    }
  };

  const rescoreAll = async () => {
    try {
      await axios.post(
        `${ATS_API_ENDPOINT}/job/${jobId}/rescore-all`,
        {},
        { withCredentials: true }
      );
      toast.success("All applicants rescored");
      load();
    } catch {
      toast.error("Rescore failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ATS Shortlisting</h1>
            <p className="text-sm text-gray-500">
              Applicants ranked by match score (highest first)
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/admin/jobs/${jobId}/applicants`}
              className="text-sm text-[#6B3AC2] hover:underline px-3 py-2"
            >
              Classic view
            </Link>
            <Button type="button" variant="outline" onClick={rescoreAll}>
              Rescore all
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6 grid md:grid-cols-4 gap-3">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Min ATS %"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Filter skill e.g. React"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Search name/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm md:col-span-1"
            placeholder="Boolean: React AND Node"
            value={booleanQuery}
            onChange={(e) => setBooleanQuery(e.target.value)}
          />
          <Button type="button" className="md:col-span-4 bg-[#6B3AC2]" onClick={load}>
            Apply filters
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading rankings…</p>
        ) : applicants.length === 0 ? (
          <p className="text-gray-500">No applicants match filters.</p>
        ) : (
          <div className="space-y-4">
            {applicants.map((row, idx) => (
              <div
                key={row.applicationId}
                className="bg-white rounded-lg shadow border p-4 flex flex-col lg:flex-row gap-4"
              >
                <div className="flex items-start gap-3 shrink-0">
                  <span className="text-2xl font-bold text-gray-300 w-8">#{idx + 1}</span>
                  <AtsScoreBadge score={row.ats?.overallScore} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{row.applicant?.fullname}</h3>
                  <p className="text-sm text-gray-500">{row.applicant?.email}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {row.ats?.experienceSummary}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {row.ats?.matchedSkills?.map((s) => (
                      <Badge key={s} className="bg-green-100 text-green-800 text-xs">
                        ✓ {s}
                      </Badge>
                    ))}
                    {row.ats?.missingSkills?.slice(0, 4).map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="text-red-600 border-red-200 text-xs"
                      >
                        − {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {row.applicant?.profile?.resume && (
                    <a
                      href={row.applicant.profile.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline text-center"
                    >
                      Download resume
                    </a>
                  )}
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={row.status}
                    onChange={(e) => updateStatus(e.target.value, row.applicationId)}
                  >
                    <option value="pending">pending</option>
                    <option value="shortlisted">shortlisted</option>
                    <option value="accepted">accepted</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    variant={row.shortlisted ? "default" : "outline"}
                    className={row.shortlisted ? "bg-[#7209b7]" : ""}
                    onClick={() => toggleShortlist(row.applicationId)}
                  >
                    {row.shortlisted ? "Shortlisted ✓" : "Shortlist"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AtsRecruiterDashboard;
