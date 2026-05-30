import { Link } from "react-router-dom";
import { Briefcase, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold">
                <span className="text-[#6B3AC2]">Arcon</span>
                <span className="text-[#FA4F09]"> Jobs</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connect talented professionals with the right opportunities. Your
              trusted partner for hiring and career growth.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/Jobs" className="hover:text-white transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/Browse" className="hover:text-white transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link to="/Creator" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/register"
                  className="hover:text-white transition-colors"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Recruiter Login
                </Link>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Briefcase size={14} />
                <span>Manage applicants</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5 text-[#6B3AC2]" />
                <span>India</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-[#6B3AC2]" />
                <a
                  href="mailto:support@arconjobs.com"
                  className="hover:text-white transition-colors"
                >
                  support@arconjobs.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-[#6B3AC2]" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-slate-400">
            © {year} <span className="text-white font-medium">Arcon</span>. All
            rights reserved.
          </p>
          <p className="text-slate-500">
            Powered by{" "}
            <span className="text-slate-300 font-medium">Chetan Kamt</span>
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/PrivacyPolicy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-600">|</span>
            <Link
              to="/TermsofService"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
