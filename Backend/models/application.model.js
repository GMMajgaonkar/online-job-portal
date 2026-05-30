import mongoose from "mongoose";
const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "accepted", "rejected"],
      default: "pending",
    },
    atsScoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AtsScore",
    },
    atsOverallScore: { type: Number, default: null },
    atsRank: { type: Number, default: null },
    shortlisted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Application = mongoose.model("Application", applicationSchema);
