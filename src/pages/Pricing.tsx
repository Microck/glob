import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import PageLayout from '@/components/PageLayout';

const Pricing = () => {
  return (
    <PageLayout isCentered={true}>
      <div className="flex flex-col items-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
          <div className="bg-surface border-3 border-muted p-8 flex flex-col h-full shadow-brutal">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-display text-2xl text-reading uppercase tracking-wider">Free</h2>
              <div className="font-mono text-xl text-muted">$0</div>
            </div>
            <ul className="flex-1 space-y-4 mb-8">
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
            <Link to="/" className="w-full bg-surface border-3 border-muted text-muted font-ui text-sm py-3 text-center hover:border-active hover:text-active transition-none font-bold uppercase">
              Current Plan
            </Link>
          </div>

          <div className="bg-surface border-3 border-active p-8 flex flex-col h-full relative shadow-brutal">
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
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-display text-2xl text-active uppercase tracking-wider">globber</h2>
              <div className="font-mono text-xl text-active">$5<span className="text-xs">/mo</span></div>
            </div>
            <ul className="flex-1 space-y-4 mb-8">
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
              className="w-full bg-active text-surface font-ui text-sm py-3 text-center hover:bg-reading transition-none font-bold uppercase"
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
