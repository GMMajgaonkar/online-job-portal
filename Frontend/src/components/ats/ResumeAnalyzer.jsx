import { useState } from "react";
import axios from "axios";
import { ATS_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const ScoreBar = ({ label, value }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs text-gray-600 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#6B3AC2] rounded-full transition-all"
        style={{ width: `${Math.min(100, value || 0)}%` }}
      />
    </div>
  </div>
);

const ResumeAnalyzer = ({ jobId, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ATS_API_ENDPOINT}/analyze/${jobId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setReport(res.data);
        if (!res.data.parsed) {
          toast.error("Upload resume on Profile first");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    (report?.overallScore ?? 0) >= 75
      ? "bg-green-600"
      : (report?.overallScore ?? 0) >= 50
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 my-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            ATS Resume Analyzer
          </h2>
          <p className="text-sm text-gray-500">
            Check match score before you apply
          </p>
        </div>
        <Button
          type="button"
          onClick={runAnalysis}
          disabled={disabled || loading}
          className="bg-[#6B3AC2] hover:bg-[#552d9b]"
        >
          {loading ? "Analyzing…" : "Check ATS Score"}
        </Button>
      </div>

      {report && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-white text-2xl font-bold px-4 py-2 rounded-lg ${scoreColor}`}
            >
              {report.overallScore}%
            </span>
            <span className="text-sm text-gray-600">Overall ATS match</span>
          </div>

          {report.breakdown && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <ScoreBar label="Skills (40%)" value={report.breakdown.skillsMatch} />
              <ScoreBar
                label="Experience (25%)"
                value={report.breakdown.experienceMatch}
              />
              <ScoreBar
                label="Job title (15%)"
                value={report.breakdown.jobTitleMatch}
              />
              <ScoreBar label="Location (10%)" value={report.breakdown.locationMatch} />
              <ScoreBar label="Education (5%)" value={report.breakdown.educationMatch} />
              <ScoreBar
                label="Completeness (5%)"
                value={report.breakdown.completenessMatch}
              />
            </div>
          )}

          {report.missingSkills?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-red-600 mb-1">Missing skills</p>
              <div className="flex flex-wrap gap-1">
                {report.missingSkills.map((s) => (
                  <Badge key={s} variant="outline" className="text-red-600 border-red-300">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {report.matchedSkills?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-green-700 mb-1">Matched skills</p>
              <div className="flex flex-wrap gap-1">
                {report.matchedSkills.map((s) => (
                  <Badge key={s} className="bg-green-100 text-green-800">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {report.suggestions?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm font-medium text-amber-900 mb-2">Suggestions</p>
              <ul className="text-sm text-amber-800 list-disc pl-5 space-y-1">
                {report.suggestions.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
