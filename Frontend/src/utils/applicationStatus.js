/** Shared labels and badge styles for application status (student + recruiter UI). */
export function getApplicationStatusLabel(application) {
  if (!application) return "pending";
  if (application.shortlisted || application.status === "shortlisted") {
    return "shortlisted";
  }
  return application.status || "pending";
}

export function getApplicationStatusBadgeClass(status) {
  switch (status) {
    case "shortlisted":
      return "bg-[#6B3AC2] hover:bg-[#6B3AC2]";
    case "accepted":
      return "bg-green-600 hover:bg-green-600";
    case "rejected":
      return "bg-red-500 hover:bg-red-500";
    default:
      return "bg-gray-500 hover:bg-gray-500";
  }
}
