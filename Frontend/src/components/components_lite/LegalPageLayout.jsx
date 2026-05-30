import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const LegalPageLayout = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#6B3AC2]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{title}</span>
        </nav>

        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-medium text-[#6B3AC2]">Arcon Jobs</span> · Last
            updated: {lastUpdated}
          </p>
        </header>

        <article className="text-base leading-relaxed">{children}</article>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPageLayout;
