import React, { useEffect } from "react";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import { Link } from "react-router-dom";

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_ENDPOINT}/${params.id}/applicants`,
          { withCredentials: true }
        );
        dispatch(setAllApplicants(res.data.job));
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllApplicants();
  }, [dispatch, params.id]);
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 my-5">
          <h1 className="font-bold text-xl">
            Applicants {applicants?.applications?.length}
          </h1>
          <Link
            to={`/admin/jobs/${params.id}/ats`}
            className="px-4 py-2 bg-[#6B3AC2] text-white rounded-md text-sm font-medium hover:bg-[#552d9b]"
          >
            ATS Ranking Dashboard →
          </Link>
        </div>
        <ApplicantsTable />
      </div>
    </div>
  );
};

export default Applicants;
