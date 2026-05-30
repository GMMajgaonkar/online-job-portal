import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/data";
import { setUser } from "@/redux/authSlice";

/**
 * Loads the logged-in user from the API (cookie session), not stale Redux persist.
 */
export default function useGetCurrentUser({ required = false, studentOnly = false } = {}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${USER_API_ENDPOINT}/me`, {
          withCredentials: true,
        });
        if (cancelled) return;
        if (res.data.success && res.data.user) {
          dispatch(setUser(res.data.user));
          if (studentOnly && res.data.user.role !== "Student") {
            setError("wrong-role");
          }
        }
      } catch (err) {
        if (cancelled) return;
        dispatch(setUser(null));
        if (required || err.response?.status === 401) {
          const redirect = encodeURIComponent(
            window.location.pathname + window.location.hash
          );
          navigate(`/login?redirect=${redirect}`, { replace: true });
          return;
        }
        setError("load-failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate, required, studentOnly]);

  return { loading, error };
}
