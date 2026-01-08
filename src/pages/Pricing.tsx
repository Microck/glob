import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import PageLayout from '@/components/PageLayout';

const Pricing = () => {
  const pawPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23E7D9D5' fill-opacity='0.05'%3E%3Cpath d='M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4.5-1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4.5 6c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5z'/%3E%3C/svg%3E")`;

  return (
    <PageLayout isCentered={true}>
      <div className="flex flex-col items-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
          <div className="bg-surface border-3 border-muted p-8 flex flex-col h-full shadow-brutal overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h2 className="font-display text-2xl text-reading uppercase tracking-wider">Free</h2>
              <div className="font-mono text-xl text-muted">$0</div>
            </div>
            <ul className="flex-1 space-y-4 mb-8 relative z-10">
              <li className="flex items-center gap-3 font-ui text-sm text-reading uppercase tracking-tighter font-bold">
                <Check className="w-4 h-4 text-active" /> 300MB File Limit
              </li>
              <li className="flex items-center gap-3 font-ui text-sm text-reading uppercase tracking-tighter font-bold">
                <Check className="w-4 h-4 text-active" /> Instant Purge (Unless Shared)
              </li>
              <li className="flex items-center gap-3 font-ui text-sm text-reading uppercase tracking-tighter font-bold">
                <Check className="w-4 h-4 text-active" /> Standard Optimization
              </li>
            </ul>
            <Link to="/" className="w-full bg-surface border-3 border-muted text-muted font-ui text-sm py-3 text-center hover:border-active hover:text-active transition-none font-bold uppercase relative z-10">
              Current Plan
            </Link>
          </div>

          <div 
            className="border-3 border-active p-8 flex flex-col h-full relative shadow-brutal overflow-hidden"
            style={{ 
              background: `
                radial-gradient(circle at top right, rgba(252, 110, 131, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, rgba(252, 110, 131, 0.05) 0%, transparent 100%),
                #2D2833
              `
            }}
          >
            <div 
              className="absolute inset-0 z-0 animate-pattern-drift pointer-events-none"
              style={{ 
                backgroundImage: pawPattern,
                backgroundSize: '80px 80px'
              }}
            />

            <div className="absolute top-0 right-0 z-[-1]">
              <img 
                src="/finished.svg" 
                alt="Recommended" 
                style={{ 
                  transform: 'translate(-15.6px, -56.4px)',
                  width: '105.3px',
                  height: '59.4px',
                  filter: 'invert(56%) sepia(52%) saturate(2071%) hue-rotate(314deg) brightness(100%) contrast(97%)' 
                }} 
              />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h2 className="font-display text-2xl text-active uppercase tracking-wider">globber</h2>
              <div className="font-mono text-xl text-active">$5<span className="text-xs">/mo</span></div>
            </div>
            <ul className="flex-1 space-y-4 mb-8 relative z-10">
              <li className="flex items-center gap-3 font-ui text-sm text-reading uppercase tracking-tighter font-bold">
                <Check className="w-4 h-4 text-active" /> 500MB File Limit
              </li>
              <li className="flex items-center gap-3 font-ui text-sm text-reading uppercase tracking-tighter font-bold">
                <Check className="w-4 h-4 text-active" /> 48 Hour Asset Retention
              </li>
              <li className="flex items-center gap-3 font-ui text-sm text-reading uppercase tracking-tighter font-bold">
                <Check className="w-4 h-4 text-active" /> Priority Queue
              </li>
              <li className="flex items-center gap-3 font-ui text-sm text-reading uppercase tracking-tighter font-bold">
                <Check className="w-4 h-4 text-active" /> Optimization History
              </li>
            </ul>
            <a 
              href="https://polar.sh/micr.dev/products/99118e8e-5aaa-4196-91f9-686e8e1d7e75" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-active text-surface font-ui text-sm py-3 text-center hover:bg-reading transition-none font-bold uppercase relative z-10"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
