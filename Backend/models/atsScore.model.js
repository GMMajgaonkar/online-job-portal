import mongoose from "mongoose";

const atsScoreSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parsedResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParsedResume",
    },
    overallScore: { type: Number, default: 0, index: true },
    rank: { type: Number, default: 0 },
    breakdown: {
      skillsMatch: { type: Number, default: 0 },
      experienceMatch: { type: Number, default: 0 },
      jobTitleMatch: { type: Number, default: 0 },
      locationMatch: { type: Number, default: 0 },
      educationMatch: { type: Number, default: 0 },
      completenessMatch: { type: Number, default: 0 },
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    strongSkills: [{ type: String }],
    experienceSummary: { type: String, default: "" },
    suggestions: [{ type: String }],
    keywordHits: [{ type: String }],
    shortlisted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

atsScoreSchema.index({ job: 1, overallScore: -1 });

export const AtsScore = mongoose.model("AtsScore", atsScoreSchema);
