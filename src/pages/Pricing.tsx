import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import PageLayout from '@/components/PageLayout';

const Pricing = () => {
  const pawPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='%23E7D9D5' fill-opacity='0.03'%3E%3Cpath d='M12 14c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-5-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm4 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'/%3E%3C/svg%3E")`;

  const [glowIntensity, setGlowIntensity] = useState(0.08);
  const [gradientIntensity, setGradientIntensity] = useState(0.02);
  const [patternOpacity, setPatternOpacity] = useState(0.4);

  return (
    <PageLayout isCentered={true}>
      <div className="flex flex-col items-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
          <div className="bg-surface border-3 border-muted p-8 flex flex-col h-full shadow-brutal overflow-hidden relative">
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
                radial-gradient(circle at 90% 10%, rgba(252, 110, 131, ${glowIntensity}) 0%, transparent 60%),
                linear-gradient(135deg, rgba(231, 217, 213, ${gradientIntensity}) 0%, transparent 100%),
                #332D3B
              `
            }}
          >
            <div 
              className="absolute inset-0 z-0 animate-pattern-drift pointer-events-none"
              style={{ 
                backgroundImage: pawPattern,
                backgroundSize: '120px 120px',
                opacity: patternOpacity
              }}
            />

            <div className="absolute top-0 right-0 z-[5]">
              <img 
                src="/finished.svg" 
                alt="Recommended" 
                style={{ 
                  transform: 'translate(-15.6px, -51.4px)',
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

        <div className="mt-8 p-4 bg-surface border-2 border-muted flex gap-6 z-20 shadow-brutal">
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Glow</span>
            <input type="range" min="0" max="0.5" step="0.01" value={glowIntensity} onChange={(e) => setGlowIntensity(Number(e.target.value))} className="w-32 accent-active" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Gradient</span>
            <input type="range" min="0" max="0.2" step="0.01" value={gradientIntensity} onChange={(e) => setGradientIntensity(Number(e.target.value))} className="w-32 accent-active" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Pattern</span>
            <input type="range" min="0" max="1" step="0.05" value={patternOpacity} onChange={(e) => setPatternOpacity(Number(e.target.value))} className="w-32 accent-active" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
