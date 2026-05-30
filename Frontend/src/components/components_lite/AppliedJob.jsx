import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
import { useSelector, useDispatch } from "react-redux";
import {
  getApplicationStatusBadgeClass,
  getApplicationStatusLabel,
} from "@/utils/applicationStatus";
import { removeAppliedJob } from "@/redux/jobSlice";
import axios from "axios";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { X } from "lucide-react";

const AppliedJob = () => {
  const { allAppliedJobs = [] } = useSelector((store) => store.job);
  const rows = Array.isArray(allAppliedJobs) ? allAppliedJobs : [];
  const dispatch = useDispatch();

  const [confirmId, setConfirmId] = useState(null); // applicationId being confirmed
  const [cancellingId, setCancellingId] = useState(null);

  const pendingApp = rows.find((r) => r._id === confirmId);

  const handleConfirmCancel = async () => {
    if (!confirmId) return;
    setCancellingId(confirmId);
    setConfirmId(null);
    try {
      const res = await axios.delete(
        `${APPLICATION_API_ENDPOINT}/cancel/${cancellingId || confirmId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(removeAppliedJob(cancellingId || confirmId));
        toast.success("Application cancelled. The job is now available again.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to cancel application"
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Application?</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your application for{" "}
              <span className="font-semibold text-foreground">
                {pendingApp?.job?.title ?? "this job"}
              </span>{" "}
              at{" "}
              <span className="font-semibold text-foreground">
                {pendingApp?.job?.company?.name ?? "this company"}
              </span>
              ?<br />
              The job will become available for you to re-apply later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Keep Application
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={handleConfirmCancel}
            >
              Yes, Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableCaption>Recent Applied Jobs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length <= 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                You have not applied to any job yet.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((appliedJob) => {
              const statusLabel = getApplicationStatusLabel(appliedJob);
              const isPending = statusLabel === "pending";
              const isCancelling = cancellingId === appliedJob._id;

              return (
                <TableRow key={appliedJob._id}>
                  <TableCell>
                    {appliedJob?.createdAt
                      ? appliedJob.createdAt.split("T")[0]
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {appliedJob.job?.title ?? "Job unavailable"}
                  </TableCell>
                  <TableCell>{appliedJob.job?.company?.name ?? "—"}</TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <Badge className={getApplicationStatusBadgeClass(statusLabel)}>
                      {statusLabel}
                    </Badge>
                    {statusLabel === "shortlisted" && (
                      <p className="text-xs text-[#6B3AC2] mt-1">
                        Recruiter shortlisted your profile
                      </p>
                    )}
                  </TableCell>

                  {/* Cancel — only for pending */}
                  <TableCell className="text-center">
                    {isPending ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isCancelling}
                        onClick={() => setConfirmId(appliedJob._id)}
                        className="text-red-500 border-red-300 hover:bg-red-50 hover:text-red-600 hover:border-red-500 gap-1"
                      >
                        <X className="w-3 h-3" />
                        {isCancelling ? "Cancelling…" : "Cancel"}
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJob;
