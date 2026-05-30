import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setSavedJobs, toggleSavedJob } from "@/redux/jobSlice";
import {
  loadSavedJobsFromStorage,
  saveSavedJobsToStorage,
} from "@/utils/savedJobsStorage";

const useSaveJob = (job) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const savedJobs = useSelector((store) => store.job.savedJobs) || [];

  const jobId = job?._id ? String(job._id) : null;
  const isSaved = jobId
    ? savedJobs.some((j) => String(j._id) === jobId)
    : false;

  const toggleSave = (e) => {
    e?.stopPropagation?.();
    if (!job?._id) return;

    if (!user) {
      toast.error("Please login to save jobs for later");
      navigate("/login");
      return;
    }

    dispatch(toggleSavedJob(job));

    const next = isSaved
      ? savedJobs.filter((j) => String(j._id) !== jobId)
      : [...savedJobs, job];

    saveSavedJobsToStorage(user._id, next);
    toast.success(isSaved ? "Removed from saved jobs" : "Job saved for later");
  };

  return { isSaved, toggleSave };
};

export const hydrateSavedJobsForUser = (userId, dispatch) => {
  if (!userId) {
    dispatch(setSavedJobs([]));
    return;
  }
  dispatch(setSavedJobs(loadSavedJobsFromStorage(userId)));
};

export default useSaveJob;
