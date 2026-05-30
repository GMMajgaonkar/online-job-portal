# ATS Module — Integration Guide

## Overview

The ATS (Applicant Tracking System) module adds resume parsing, weighted scoring, applicant ranking, and recruiter shortlisting **without replacing** existing job portal features.

## New Dependencies (Backend)

```bash
cd Backend
npm install pdf-parse mammoth natural string-similarity
```

## New MongoDB Collections

| Collection | Model | Purpose |
|------------|--------|---------|
| `parsedresumes` | `ParsedResume` | Extracted resume data per user |
| `atsscores` | `AtsScore` | Per-application ATS score & breakdown |
| `skillindexes` | `SkillIndex` | Normalized skills index per user |

## Updated Collection

`applications` — optional fields: `atsScoreId`, `atsOverallScore`, `atsRank`, `shortlisted`

## API Base

`/api/ats` (requires login cookie)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/parse-resume` | Student | Parse current profile resume |
| GET | `/analyze/:jobId` | Student | Pre-apply ATS compatibility |
| GET | `/job/:jobId/ranked` | Recruiter | Ranked applicants + filters |
| POST | `/job/:jobId/rescore-all` | Recruiter | Rescore all applications for job |
| PATCH | `/shortlist/:applicationId` | Recruiter | Toggle shortlist flag |
| GET | `/score/application/:applicationId` | Any auth | Get ATS record |

### Query params for ranked applicants

- `minScore` — minimum ATS %
- `skill` — filter by matched skill
- `search` — name/email
- `booleanQuery` — e.g. `React AND Node.js`

## Scoring Weights

- Skills 40%
- Experience 25%
- Job title 15%
- Location 10%
- Education 5%
- Resume completeness 5%

## Automatic Triggers

1. **On apply** — `application.controller.js` runs ATS after application is created.
2. **On resume upload** — `user.controller.js` parses resume when profile resume file is updated.

## Frontend Routes

| Path | Component |
|------|-----------|
| `/description/:id` | `ResumeAnalyzer` (students) |
| `/admin/jobs/:id/ats` | `AtsRecruiterDashboard` |

## File Structure

```
Backend/
  models/parsedResume.model.js
  models/atsScore.model.js
  models/skillIndex.model.js
  services/ats/
    resumeParser.service.js
    keywordMatcher.service.js
    atsScoring.service.js
    atsPipeline.service.js
  controllers/ats.controller.js
  routes/ats.route.js
  middleware/requireRecruiterJob.js

Frontend/
  src/components/ats/ResumeAnalyzer.jsx
  src/components/ats/AtsRecruiterDashboard.jsx
```

## Minimal Changes to Existing Code

- `Backend/index.js` — mount `/api/ats`
- `application.controller.js` — call `processApplicationAts` after apply
- `user.controller.js` — call `parseResumeForUser` after resume upload
- `application.model.js` — ATS fields
- `data.js` — `ATS_API_ENDPOINT`
- `App.jsx` — ATS recruiter route
- `Description.jsx`, `Applicants.jsx`, `AdminJobsTable.jsx` — links/UI only

## Testing

1. Student uploads PDF/DOCX resume on Profile.
2. Student opens job → **Check ATS Score** before apply.
3. Student applies → toast shows ATS %.
4. Recruiter → Jobs → **ATS Ranking** → filter/sort/shortlist.
5. Shortlisting sets application **status** to `shortlisted`, notifies the student on **Profile → Applied Jobs**, and sends email if SMTP is configured in backend `.env`.
