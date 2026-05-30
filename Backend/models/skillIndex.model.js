import mongoose from "mongoose";

const skillIndexSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    skills: [{ type: String }],
    normalizedSkills: [{ type: String }],
    jobTitles: [{ type: String }],
    locations: [{ type: String }],
    lastParsedResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParsedResume",
    },
  },
  { timestamps: true }
);

export const SkillIndex = mongoose.model("SkillIndex", skillIndexSchema);
