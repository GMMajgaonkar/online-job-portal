import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hydrateSavedJobsForUser } from "@/hooks/useSaveJob";

const SavedJobsHydrator = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    hydrateSavedJobsForUser(user?._id, dispatch);
  }, [user?._id, dispatch]);

  return null;
};

export default SavedJobsHydrator;
