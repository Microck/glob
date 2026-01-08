import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full p-6 border-t-3 border-muted bg-surface flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="font-ui text-xs text-muted uppercase tracking-wider">
        &copy; 2026 GLOB OPTIMIZER
      </div>
      <div className="flex gap-6 font-ui text-xs">
        <Link to="/privacy" className="text-muted hover:text-active transition-none">PRIVACY</Link>
        <Link to="/terms" className="text-muted hover:text-active transition-none">TERMS</Link>
        <a href="https://github.com/Microck/glob" target="_blank" rel="noreferrer" className="text-muted hover:text-active transition-none">GITHUB</a>
      </div>
    </footer>
  );
};

export default Footer;
