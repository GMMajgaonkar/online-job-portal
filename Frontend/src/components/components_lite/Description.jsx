import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useParams } from "react-router-dom";
import { JOB_API_ENDPOINT, APPLICATION_API_ENDPOINT } from "@/utils/data";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob, removeAppliedJob } from "@/redux/jobSlice";
import { toast } from "sonner";
import useSaveJob from "@/hooks/useSaveJob";
import { Bookmark, BookMarked } from "lucide-react";
import ResumeAnalyzer from "../ats/ResumeAnalyzer";

function userHasApplied(applications, userId) {
  if (!applications?.length || !userId) return false;
  const uid = String(userId);
  return applications.some((entry) => {
    const aid = entry?.applicant;
    if (aid == null) return false;
    if (typeof aid === "object" && aid._id != null) return String(aid._id) === uid;
    return String(aid) === uid;
  });
}

/** Returns the application entry (with _id) for the current user, or null */
function findMyApplication(applications, userId) {
  if (!applications?.length || !userId) return null;
  const uid = String(userId);
  return (
    applications.find((entry) => {
      const aid = entry?.applicant;
      if (aid == null) return false;
      if (typeof aid === "object" && aid._id != null) return String(aid._id) === uid;
      return String(aid) === uid;
    }) ?? null
  );
}

const Description = () => {
  const params = useParams();
  const jobId = params.id;

  const { singleJob } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [isApplied, setIsApplied] = useState(() =>
    userHasApplied(singleJob?.applications, user?._id)
  );
  const { isSaved, toggleSave } = useSaveJob(singleJob);

  // Derive my applicationId from the applications list
  const myApplication = findMyApplication(singleJob?.applications, user?._id);
  const myApplicationId = myApplication?._id;

  const applyJobHandler = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_ENDPOINT}/apply/${jobId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsApplied(true);
        const newEntry = res.data.applicationId
          ? { _id: res.data.applicationId, applicant: user?._id }
          : { applicant: user?._id };
        const updateSingleJob = {
          ...singleJob,
          applications: [...(singleJob.applications || []), newEntry],
        };
        dispatch(setSingleJob(updateSingleJob));
        const atsMsg = res.data.ats?.overallScore
          ? ` · ATS match: ${res.data.ats.overallScore}%`
          : "";
        toast.success(res.data.message + atsMsg);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    }
  };

  const cancelApplicationHandler = async () => {
    if (!myApplicationId) {
      toast.error("Could not find your application. Please refresh and try again.");
      setShowCancelDialog(false);
      return;
    }
    setCancelling(true);
    setShowCancelDialog(false);
    try {
      const res = await axios.delete(
        `${APPLICATION_API_ENDPOINT}/cancel/${myApplicationId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        // Remove application from singleJob in Redux
        const updatedApplications = (singleJob.applications || []).filter(
          (entry) => String(entry._id) !== String(myApplicationId)
        );
        dispatch(setSingleJob({ ...singleJob, applications: updatedApplications }));
        setIsApplied(false);
        // Also purge from allAppliedJobs list
        dispatch(removeAppliedJob(myApplicationId));
        toast.success("Application cancelled. You can re-apply anytime.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to cancel application"
      );
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const fetchSingleJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${JOB_API_ENDPOINT}/get/${jobId}`, {
          withCredentials: true,
        });
        if (res.data.status) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            userHasApplied(res.data.job.applications, user?._id)
          );
        } else {
          setError("Failed to fetch jobs.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleJobs();
  }, [jobId, dispatch, user?._id]);

  useEffect(() => {
    setIsApplied(userHasApplied(singleJob?.applications, user?._id));
  }, [singleJob?._id, singleJob?.applications, user?._id]);

  if (!singleJob) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Application?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your application for{" "}
              <span className="font-semibold text-foreground">
                {singleJob?.title}
              </span>
              ? The job will become available for you to re-apply later.
              <span className="block text-amber-600 text-xs mt-2">
                Note: Only pending applications can be cancelled.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Application
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={cancelApplicationHandler}
            >
              Yes, Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto my-10 ">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl ">{singleJob?.title}</h1>
            <div className=" flex gap-2 items-center mt-4 ">
              <Badge className={" text-blue-600 font-bold"} variant={"ghost"}>
                {singleJob?.position} Open Positions
              </Badge>
              <Badge className={" text-[#FA4F09] font-bold"} variant={"ghost"}>
                {singleJob?.salary}LPA
              </Badge>
              <Badge className={" text-[#6B3AC2]  font-bold"} variant={"ghost"}>
                {singleJob?.location}
              </Badge>
              <Badge className={" text-black font-bold"} variant={"ghost"}>
                {singleJob?.jobType}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`rounded-full ${isSaved ? "border-[#6B3AC2] text-[#6B3AC2]" : ""}`}
              onClick={toggleSave}
              aria-label="Save for later"
            >
              {isSaved ? (
                <BookMarked className="fill-[#6B3AC2] text-[#6B3AC2]" />
              ) : (
                <Bookmark />
              )}
            </Button>

            {isApplied ? (
              <Button
                onClick={() => setShowCancelDialog(true)}
                disabled={cancelling}
                className="rounded-lg bg-red-500 hover:bg-red-600"
              >
                {cancelling ? "Cancelling…" : "Cancel Application"}
              </Button>
            ) : (
              <Button
                onClick={applyJobHandler}
                className="rounded-lg bg-[#6B3AC2] hover:bg-[#552d9b]"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>

        {user?.role === "Student" && (
          <ResumeAnalyzer jobId={jobId} disabled={isApplied} />
        )}

        <h1 className="border-b-2 border-b-gray-400 font-medium py-4">
          {singleJob?.description}
        </h1>
        <div className="my-4">
          <h1 className="font-bold my-1 ">
            Role:{" "}
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.position} Open Positions
            </span>
          </h1>
          <h1 className="font-bold my-1 ">
            Location:{" "}
            <span className=" pl-4 font-normal text-gray-800">
              {" "}
              {singleJob?.location}
            </span>
          </h1>
          <h1 className="font-bold my-1 ">
            Salary:{" "}
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.salary} LPA
            </span>
          </h1>
          <h1 className="font-bold my-1 ">
            Experience:{" "}
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.experienceLevel} Year
            </span>
          </h1>
          <h1 className="font-bold my-1 ">
            Total Applicants:{" "}
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.applications?.length}
            </span>
          </h1>
          <h1 className="font-bold my-1 ">
            Job Type:
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.jobType}
            </span>
          </h1>
          <h1 className="font-bold my-1 ">
            Post Date:
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.createdAt.split("T")[0]}
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Description;
