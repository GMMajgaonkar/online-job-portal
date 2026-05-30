import { useEffect, useState } from "react";
import platformAdminClient from "@/utils/platformAdminClient";
import { downloadCsv } from "@/utils/exportCsv";
import { toast } from "sonner";

const PlatformReports = () => {
  const [reportList, setReportList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    platformAdminClient
      .get("/reports")
      .then((res) => {
        if (res.data.success) setReportList(res.data.reports || []);
      })
      .catch(() => {});
  }, []);

  const loadReport = async (id) => {
    setActiveId(id);
    setLoading(true);
    setReport(null);
    try {
      const res = await platformAdminClient.get(`/reports/${id}`);
      if (res.data.success !== false) setReport(res.data);
    } catch {
      /* handled */
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!report?.columns || !report?.rows) return;
    downloadCsv(`${report.reportId || "report"}.csv`, report.columns, report.rows);
    toast.success("CSV downloaded");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Reports Center</h1>
      <p className="text-gray-600 mb-6">
        {reportList.length} reports available for semester project documentation & analytics
      </p>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4 max-h-[70vh] overflow-y-auto">
          <h2 className="font-semibold mb-3 text-sm text-gray-500">SELECT REPORT</h2>
          <ul className="space-y-1">
            {reportList.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => loadReport(r.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    activeId === r.id
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          {loading && <p>Generating report...</p>}
          {!loading && !report && (
            <p className="text-gray-500">Select a report from the list</p>
          )}
          {report && (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{report.title}</h2>
                  <p className="text-xs text-gray-400">
                    Generated: {new Date(report.generatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportReport}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm shrink-0"
                >
                  Download CSV
                </button>
              </div>
              <div className="overflow-x-auto max-h-[55vh]">
                <table className="w-full text-sm border">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      {report.columns?.map((col) => (
                        <th key={col} className="p-2 text-left border">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows?.map((row, i) => (
                      <tr key={i} className="border-t">
                        {row.map((cell, j) => (
                          <td key={j} className="p-2 border">
                            {cell != null ? String(cell).slice(0, 80) : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Total rows: {report.rows?.length || 0}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformReports;
