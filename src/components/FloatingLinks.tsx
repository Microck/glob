import { Link } from "react-router-dom";

const FloatingLinks = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-6 flex justify-between items-end pointer-events-none">
      <span className="font-ui text-[10px] text-muted uppercase tracking-widest">
        v1.3.0
      </span>
      <div className="flex gap-6 font-ui text-[10px] pointer-events-auto">
        <Link to="/privacy" className="text-muted hover:text-active transition-none uppercase tracking-widest">Privacy</Link>
        <Link to="/terms" className="text-muted hover:text-active transition-none uppercase tracking-widest">Terms</Link>
        <a href="https://github.com/Microck/glob" target="_blank" rel="noreferrer" className="text-muted hover:text-active transition-none uppercase tracking-widest">Github</a>
      </div>
    </div>
  );
};

export default FloatingLinks;
