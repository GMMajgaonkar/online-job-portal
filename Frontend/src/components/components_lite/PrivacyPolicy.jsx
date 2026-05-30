import LegalPageLayout from "./LegalPageLayout";

const PrivacyPolicy = () => {
  const lastUpdated = "May 19, 2026";

  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={lastUpdated}>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p className="text-gray-700 leading-relaxed">
          Arcon Jobs (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the Online Job
          Portal website that connects job seekers (Students) with employers
          (Recruiters). This Privacy Policy explains how we collect, use, store,
          and protect your personal information when you register, browse jobs,
          apply for positions, or use recruiter and administrative features.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          By using Arcon Jobs, you agree to the collection and use of information
          in accordance with this policy. If you do not agree, please do not use
          our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
        <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">
          2.1 Information you provide
        </h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <strong>Account details:</strong> full name, email address, phone
            number, password (stored in encrypted form), and role (Student,
            Recruiter, or Admin).
          </li>
          <li>
            <strong>Identity verification (registration):</strong> Aadhar card
            number and PAN card number, as required during signup.
          </li>
          <li>
            <strong>Profile:</strong> bio, skills, profile photo, and resume
            file (for Students).
          </li>
          <li>
            <strong>Employer data:</strong> company name, description, website,
            location, and logo (for Recruiters).
          </li>
          <li>
            <strong>Job applications:</strong> jobs you apply to, application
            status (pending, accepted, rejected), and related timestamps.
          </li>
        </ul>

        <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">
          2.2 Information collected automatically
        </h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Authentication tokens (JWT) stored in secure HTTP-only cookies.</li>
          <li>Basic usage data such as pages visited and actions on the platform.</li>
          <li>Technical data including browser type and device information.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Create and manage your account and authenticate logins.</li>
          <li>Display job listings and allow Students to apply with resumes.</li>
          <li>Enable Recruiters to post jobs, manage companies, and review applicants.</li>
          <li>Update and display application status to Students and Recruiters.</li>
          <li>Operate platform administration, analytics, and reports (Admin role).</li>
          <li>Improve security, prevent fraud, and maintain system reliability.</li>
          <li>Respond to support requests and legal obligations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. How We Share Information</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          We do not sell your personal data. We may share information only as
          follows:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <strong>With Recruiters:</strong> when you apply for a job, your
            profile, resume, and contact details are visible to the employer
            managing that listing.
          </li>
          <li>
            <strong>With platform administrators:</strong> authorized Admin users
            may access data for moderation, support, and reporting.
          </li>
          <li>
            <strong>Service providers:</strong> hosting, database (e.g. MongoDB
            Atlas), and deployment partners that help run the website.
          </li>
          <li>
            <strong>Legal requirements:</strong> when required by law, court order,
            or government authority in India.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Data Storage & Security</h2>
        <p className="text-gray-700 leading-relaxed">
          Passwords are hashed using industry-standard encryption (bcrypt). Files
          such as resumes and profile photos are stored on our servers. We use
          HTTPS in production and restrict API access through authentication.
          While we take reasonable measures to protect your data, no method of
          transmission over the Internet is 100% secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
        <p className="text-gray-700 leading-relaxed">
          We retain your information while your account is active and as needed
          to provide services, comply with law, or resolve disputes. You may
          request account deletion by contacting us; some data may be retained
          where legally required.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Subject to applicable Indian law, you may:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Access and update your profile from the Profile page (Students).</li>
          <li>Request correction of inaccurate personal information.</li>
          <li>Request deletion of your account and associated data.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
        <p className="text-gray-700 leading-relaxed">
          We use cookies and similar technologies to keep you logged in and
          maintain session security. You can control cookies through your browser
          settings, but disabling them may limit login functionality.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
        <p className="text-gray-700 leading-relaxed">
          Arcon Jobs is not intended for users under 18 years of age. We do not
          knowingly collect data from minors.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
        <p className="text-gray-700 leading-relaxed">
          We may update this Privacy Policy from time to time. The &quot;Last
          updated&quot; date at the top will reflect changes. Continued use of the
          platform after updates constitutes acceptance of the revised policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
        <p className="text-gray-700 leading-relaxed">
          For privacy-related questions or requests, contact:
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
            <strong>Developer contact:</strong> Chetan Kamt
          </li>
        </ul>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
