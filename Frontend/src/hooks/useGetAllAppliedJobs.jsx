import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const useGetAppliedJobs = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get(`${APPLICATION_API_ENDPOINT}/get`, {
          withCredentials: true,
        });
        if (res.data.success) {
          const list = res.data.application;
          dispatch(setAllAppliedJobs(Array.isArray(list) ? list : []));
        }
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again to see applied jobs.");
        }
      }
    };
    fetchAppliedJobs();
  }, [dispatch, user?._id, location.pathname]);
  return null;
};

export default useGetAppliedJobs;
