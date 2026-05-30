import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allJobs: [],
  allAdminJobs: [], // This will hold
  singleJob: null, // This will hold the job details when a user clicks on a job
  searchJobByText: "",
  allAppliedJobs: [], // This will hold
  searchedQuery: "",
  savedJobs: [],
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setAllJobs(state, action) {
      state.allJobs = action.payload; // Update state with fetched jobs
    },
    setSingleJob(state, action) {
      state.singleJob = action.payload; // Update state with fetched job details
    },
    setAllAdminJobs(state, action) {
      state.allAdminJobs = action.payload; // Update state with fetched admin jobs
    },
    setSearchJobByText(state, action) {
      state.searchJobByText = action.payload;
    },
    setAllAppliedJobs(state, action) {
      state.allAppliedJobs = action.payload;
    },
    setSearchedQuery(state, action) {
      state.searchedQuery = action.payload;
    },
    setSavedJobs(state, action) {
      state.savedJobs = action.payload;
    },
    toggleSavedJob(state, action) {
      const job = action.payload;
      if (!job?._id) return;
      const id = String(job._id);
      const index = state.savedJobs.findIndex((j) => String(j._id) === id);
      if (index >= 0) {
        state.savedJobs.splice(index, 1);
      } else {
        state.savedJobs.push(job);
      }
    },
    clearSavedJobs(state) {
      state.savedJobs = [];
    },
    removeAppliedJob(state, action) {
      // action.payload = applicationId to remove
      const applicationId = String(action.payload);
      state.allAppliedJobs = state.allAppliedJobs.filter(
        (app) => String(app._id) !== applicationId
      );
    },
  },
});

export const {
  setAllJobs,
  setSingleJob,
  setAllAdminJobs,
  setSearchJobByText,
  setAllAppliedJobs,
  setSearchedQuery,
  setSavedJobs,
  toggleSavedJob,
  clearSavedJobs,
  removeAppliedJob,
} = jobSlice.actions;
export default jobSlice.reducer;
