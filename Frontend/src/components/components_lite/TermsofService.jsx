import { Link } from "react-router-dom";
import LegalPageLayout from "./LegalPageLayout";

const TermsOfService = () => {
  const lastUpdated = "May 19, 2026";

  return (
    <LegalPageLayout title="Terms of Service" lastUpdated={lastUpdated}>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
        <p className="text-gray-700 leading-relaxed">
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of
          the Arcon Jobs online job portal (the &quot;Platform&quot;), including all
          related websites, APIs, and services. The Platform is operated under
          the Arcon brand and developed by Chetan Kamt.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          By registering, logging in, or using the Platform, you agree to these
          Terms and our{" "}
          <Link to="/PrivacyPolicy" className="text-[#6B3AC2] hover:underline">
            Privacy Policy
          </Link>
          . If you do not agree, you must not use the Platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>You must be at least 18 years old to create an account.</li>
          <li>
            You must provide accurate registration information, including valid
            email, phone number, Aadhar, and PAN details where required.
          </li>
          <li>
            You may register as a <strong>Student</strong> (job seeker),{" "}
            <strong>Recruiter</strong> (employer), or access as an authorized{" "}
            <strong>Admin</strong> only with proper credentials.
          </li>
          <li>One person may not maintain multiple accounts for the same role to mislead employers or applicants.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          You are responsible for:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Keeping your login credentials confidential.</li>
          <li>All activity that occurs under your account.</li>
          <li>Notifying us immediately if you suspect unauthorized access.</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-3">
          We may suspend or terminate accounts that violate these Terms or pose
          security risks.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Student (Job Seeker) Terms</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            You may browse jobs, view details, and submit applications with an
            accurate resume and profile.
          </li>
          <li>
            Application status (pending, accepted, rejected) is determined by
            Recruiters or platform Administrators—not by you.
          </li>
          <li>
            You must not submit false qualifications, plagiarized resumes, or
            spam applications.
          </li>
          <li>
            You grant Recruiters permission to view your application materials
            for jobs you apply to.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Recruiter (Employer) Terms</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            You may register a company, post job listings, and manage applicants
            through the recruiter dashboard.
          </li>
          <li>
            Job posts must be genuine, lawful, and accurately describe the role,
            location, salary, and requirements.
          </li>
          <li>
            You must review applications fairly and update status in a timely
            manner where possible.
          </li>
          <li>
            You must comply with applicable employment and anti-discrimination
            laws in India when hiring.
          </li>
          <li>
            You may not use applicant data for purposes unrelated to recruitment
            without consent.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Platform Administration</h2>
        <p className="text-gray-700 leading-relaxed">
          Authorized Administrators may manage users, companies, jobs,
          applications, and system reports. Admin actions must comply with
          institutional policies and applicable law. Misuse of admin access is
          prohibited and may result in legal action.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Acceptable Use</h2>
        <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Use the Platform for illegal, fraudulent, or harmful activities.</li>
          <li>Upload malware, offensive content, or infringing material.</li>
          <li>Attempt to hack, scrape, or overload our systems.</li>
          <li>Impersonate another person or misrepresent your affiliation.</li>
          <li>Harvest data from other users without authorization.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
        <p className="text-gray-700 leading-relaxed">
          The Arcon Jobs name, logo, website design, and platform software are
          owned by or licensed to Arcon and its developers. You retain ownership
          of content you upload (e.g. resume, company logo), but you grant us a
          license to host, display, and process that content solely to operate
          the Platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Disclaimers</h2>
        <p className="text-gray-700 leading-relaxed">
          Arcon Jobs is provided &quot;as is&quot; and &quot;as available.&quot; We do not
          guarantee that every job listing is accurate, that you will obtain
          employment, or that every hire will be successful. We are not a party
          to employment contracts between Students and Recruiters. Interview,
          salary, and hiring decisions are solely between users.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
        <p className="text-gray-700 leading-relaxed">
          To the maximum extent permitted by Indian law, Arcon Jobs, Chetan Kamt,
          and affiliated institutions shall not be liable for indirect,
          incidental, special, or consequential damages arising from your use of
          the Platform, including loss of data, profits, or employment
          opportunities.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Indemnification</h2>
        <p className="text-gray-700 leading-relaxed">
          You agree to indemnify and hold harmless Arcon Jobs and its operators
          from claims arising out of your misuse of the Platform, violation of
          these Terms, or infringement of third-party rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">12. Termination</h2>
        <p className="text-gray-700 leading-relaxed">
          We may suspend or terminate your access at any time for breach of
          these Terms. You may stop using the Platform at any time. Provisions
          that by nature should survive termination (including liability limits
          and intellectual property) will remain in effect.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
        <p className="text-gray-700 leading-relaxed">
          These Terms are governed by the laws of India. Any disputes shall be
          subject to the exclusive jurisdiction of the competent courts in India,
          unless otherwise required by mandatory local law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">14. Changes to Terms</h2>
        <p className="text-gray-700 leading-relaxed">
          We may revise these Terms at any time. Updated Terms will be posted on
          this page with a new &quot;Last updated&quot; date. Your continued use after
          changes constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">15. Contact</h2>
        <p className="text-gray-700 leading-relaxed">
          Questions about these Terms:
        </p>
        <ul className="mt-3 text-gray-700 space-y-1">
          <li>
            <strong>Platform:</strong> Arcon Jobs
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:support@arconjobs.com" className="text-[#6B3AC2] hover:underline">
              support@arconjobs.com
            </a>
          </li>
          <li>
            <strong>Developer:</strong> Chetan Kamt
          </li>
        </ul>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfService;
