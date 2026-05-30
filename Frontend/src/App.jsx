import React from "react";
import SavedJobsHydrator from "./components/components_lite/SavedJobsHydrator";
import Navbar from "./components/components_lite/Navbar";
import Login from "./components/authentication/Login";
import Register from "./components/authentication/Register";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Home from "./components/components_lite/Home";
import PrivacyPolicy from "./components/components_lite/PrivacyPolicy.jsx";
import TermsofService from "./components/components_lite/TermsofService.jsx";
import Jobs from "./components/components_lite/Jobs.jsx";
import Browse from "./components/components_lite/Browse.jsx";
import Profile from "./components/components_lite/Profile.jsx";
import Description from "./components/components_lite/Description.jsx";
import Companies from "./components/admincomponent/Companies";
import CompanyCreate from "./components/admincomponent/CompanyCreate";
import CompanySetup from "./components/admincomponent/CompanySetup";
import AdminJobs from "./components/admincomponent/AdminJobs.jsx";
import PostJob from "./components/admincomponent/PostJob";
import Applicants from "./components/admincomponent/Applicants";
import ProtectedRoute from "./components/admincomponent/ProtectedRoute";
import Creator from "./components/creator/Creator.jsx";
import PlatformAdminRoute from "./components/platformadmin/PlatformAdminRoute";
import PlatformAdminLayout from "./components/platformadmin/PlatformAdminLayout";
import PlatformDashboard from "./components/platformadmin/PlatformDashboard";
import PlatformUsers from "./components/platformadmin/PlatformUsers";
import PlatformCompanies from "./components/platformadmin/PlatformCompanies";
import PlatformJobs from "./components/platformadmin/PlatformJobs";
import PlatformApplications from "./components/platformadmin/PlatformApplications";
import PlatformReports from "./components/platformadmin/PlatformReports";
import AtsRecruiterDashboard from "./components/ats/AtsRecruiterDashboard";

const appRouter = createBrowserRouter([
  { path: "/", element: <Home /> },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/description/:id",
    element: <Description />,
  },
  {
    path: "/Profile",
    element: <Profile />,
  },
  {
    path: "/profile",
    element: <Navigate to="/Profile" replace />,
  },
  {
    path: "/PrivacyPolicy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/TermsofService",
    element: <TermsofService />,
  },
  {
    path: "/Jobs",
    element: <Jobs />,
  },
  {
    path: "/Home",
    element: <Home />,
  },
  {
    path: "/Browse",
    element: <Browse />,
  },
  {
    path:"/Creator",
    element: <Creator/>
  },

  // /admin
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute>
        <Companies />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute>
        <CompanyCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute>
        <CompanySetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute>
        {" "}
        <AdminJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute>
        {" "}
        <PostJob />{" "}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <Applicants />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/ats",
    element: (
      <ProtectedRoute>
        <AtsRecruiterDashboard />
      </ProtectedRoute>
    ),
  },

  // Platform Super Admin (semester project)
  {
    path: "/platform-admin",
    element: (
      <PlatformAdminRoute>
        <PlatformAdminLayout />
      </PlatformAdminRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <PlatformDashboard /> },
      { path: "users", element: <PlatformUsers /> },
      { path: "companies", element: <PlatformCompanies /> },
      { path: "jobs", element: <PlatformJobs /> },
      { path: "applications", element: <PlatformApplications /> },
      { path: "reports", element: <PlatformReports /> },
    ],
  },
]);

function App() {
  return (
    <div>
      <SavedJobsHydrator />
      <RouterProvider router={appRouter}></RouterProvider>
    </div>
  );
}

export default App;
