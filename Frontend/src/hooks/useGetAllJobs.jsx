import { setAllJobs } from "@/redux/jobSlice";
import { JOB_API_ENDPOINT } from "@/utils/data";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchedQuery, allJobs } = useSelector((store) => store.job);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllJobs = async () => {
      setError(null);
      if (allJobs.length === 0) setLoading(true);

      try {
        const res = await axios.get(
          `${JOB_API_ENDPOINT}/get?keyword=${encodeURIComponent(searchedQuery || "")}`,
          {
            withCredentials: true,
            signal: controller.signal,
          }
        );
        if (res.data.status) {
          dispatch(setAllJobs(res.data.jobs));
        } else {
          setError("Failed to fetch jobs.");
        }
      } catch (err) {
        if (axios.isCancel(err) || err.code === "ERR_CANCELED") return;
        setError(err.message || "An error occurred.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAllJobs();
    return () => controller.abort();
  }, [dispatch, searchedQuery]);

  return { loading, error };
};

export default useGetAllJobs;
