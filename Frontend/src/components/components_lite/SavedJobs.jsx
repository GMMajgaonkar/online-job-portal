import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bookmark } from "lucide-react";
import useSaveJob from "@/hooks/useSaveJob";

const SavedJobRow = ({ job }) => {
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useSaveJob(job);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-800">{job?.title}</p>
        <p className="text-sm text-gray-500">
          {job?.company?.name || "Company"} · {job?.location || "—"}
        </p>
        <div className="flex gap-2 mt-1">
          <Badge variant="ghost" className="text-[#7209b7] text-xs">
            {job?.jobType}
          </Badge>
          <Badge variant="ghost" className="text-xs">
            {job?.salary} LPA
          </Badge>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/description/${job._id}`)}
        >
          View
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleSave}
          className={isSaved ? "text-[#7209b7] border-[#7209b7]" : ""}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

const SavedJobs = () => {
  const savedJobs = useSelector((store) => store.job.savedJobs) || [];

  if (savedJobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
        <Bookmark className="mx-auto mb-2 opacity-40" size={32} />
        <p>No saved jobs yet.</p>
        <p className="text-sm mt-1">
          Use the bookmark icon or &quot;Save For Later&quot; on job cards.
        </p>
      </div>
    );
  }

  return (
    <div>
      {savedJobs.map((job) => (
        <SavedJobRow key={job._id} job={job} />
      ))}
    </div>
  );
};

export default SavedJobs;
