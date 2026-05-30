import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Categories from "./Categories";
import LatestJobs from "./LatestJobs";
import Footer from "./Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { getPlatformAdminToken } from "@/utils/platformAdminClient";

const Home = () => {
  const { loading, error } = useGetAllJobs();
  const jobs = useSelector((state) => state.job.allJobs);
  const { user } = useSelector((store) => store.auth);

  if (user?.role === "Admin") {
    if (getPlatformAdminToken()) {
      return <Navigate to="/platform-admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  if (user?.role === "Recruiter") {
    return <Navigate to="/admin/companies" replace />;
  }

  return (
    <div>
      <Navbar />
      <Header />
      <Categories />
      {error && (
        <p className="text-center text-red-600 py-2">Error: {error}</p>
      )}
      {loading && jobs.length === 0 ? (
        <p className="text-center text-gray-600 py-8">Loading jobs...</p>
      ) : (
        <LatestJobs />
      )}
      <Footer />
    </div>
  );
};

export default Home;
