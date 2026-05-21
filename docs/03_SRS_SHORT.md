# Software Requirements Specification (SRS)
## Online Job Portal — Summary Document

**Version:** 1.0  
**Date:** May 2026  
**Project:** Online Job Portal (MERN)

---

## 1. Purpose

Define functional and non-functional requirements for the Online Job Portal web system.

## 2. Scope

Web application for Students to find/apply jobs and Recruiters to post jobs and manage applicants.

## 3. Definitions

| Term | Meaning |
|------|---------|
| Student | Job seeker user role |
| Recruiter | Employer who posts jobs |
| Application | Student's request for a specific job |
| JWT | JSON Web Token for authentication |

## 4. Overall Description

### 4.1 Product Perspective
Standalone web system; frontend and backend communicate via REST API.

### 4.2 Product Functions
- User management (register, login, profile)
- Company management (recruiter)
- Job posting and browsing
- Application submission and status tracking

### 4.3 User Classes
- **Student:** Browse, apply, profile  
- **Recruiter:** Company, jobs, applicants  

### 4.4 Constraints
- Requires internet for MongoDB Atlas  
- Modern browser required  
- File uploads limited by server configuration  

## 5. Functional Requirements

| ID | Description | Priority |
|----|-------------|----------|
| SRS-F01 | System shall allow registration with role Student or Recruiter | High |
| SRS-F02 | System shall authenticate via email and password | High |
| SRS-F03 | System shall list all active jobs publicly | High |
| SRS-F04 | System shall allow job search/filter on browse page | Medium |
| SRS-F05 | System shall allow authenticated students to apply once per job | High |
| SRS-F06 | System shall store resume file on server | High |
| SRS-F07 | System shall allow recruiters to create one company profile | High |
| SRS-F08 | System shall allow recruiters to post jobs linked to company | High |
| SRS-F09 | System shall list applicants per job for recruiter | High |
| SRS-F10 | System shall update application status: pending/accepted/rejected | High |
| SRS-F11 | System shall restrict admin routes to Recruiter role | High |

## 6. Non-Functional Requirements

| ID | Description |
|----|-------------|
| SRS-NF01 | Passwords must be hashed (bcrypt) |
| SRS-NF02 | Auth token in HTTP-only cookie |
| SRS-NF03 | UI responsive on mobile and desktop |
| SRS-NF04 | API response in JSON format |
| SRS-NF05 | CORS configured for frontend origin |

## 7. External Interface Requirements

### 7.1 User Interface
React SPA with Tailwind CSS; pages: Home, Jobs, Browse, Profile, Admin, Creator.

### 7.2 Software Interface
REST API base: `http://localhost:5011/api`

### 7.3 Hardware Interface
Standard PC/laptop with keyboard, mouse, display.

## 8. Appendices

See `01_PROJECT_REPORT.md` for API tables and `02_GEMINI_DIAGRAM_PROMPTS.md` for diagrams.
