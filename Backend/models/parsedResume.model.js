import mongoose from "mongoose";

const parsedResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeUrl: { type: String, required: true },
    resumeFileName: { type: String },
    rawText: { type: String, default: "" },
    skills: [{ type: String }],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    projects: [{ type: String }],
    certifications: [{ type: String }],
    jobTitles: [{ type: String }],
    locations: [{ type: String }],
    yearsOfExperience: { type: Number, default: 0 },
    completenessScore: { type: Number, default: 0 },
    parsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

parsedResumeSchema.index({ user: 1, resumeUrl: 1 });

export const ParsedResume = mongoose.model("ParsedResume", parsedResumeSchema);
