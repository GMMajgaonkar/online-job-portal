import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name:'application',
    initialState:{
        applicants:null,
    },
    reducers:{
        setAllApplicants:(state,action) => {
            state.applicants = action.payload;
        },
        updateApplicantStatus: (state, action) => {
            const { applicationId, status } = action.payload;
            const list = state.applicants?.applications;
            if (!list) return;
            const row = list.find(
              (a) => String(a._id) === String(applicationId)
            );
            if (row) row.status = String(status).toLowerCase();
        },
    }
});

export const { setAllApplicants, updateApplicantStatus } = applicationSlice.actions;
export default applicationSlice.reducer;
export const applicationReducer = applicationSlice.reducer;
