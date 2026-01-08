import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import PageLayout from '@/components/PageLayout';
import { useToast } from "@/components/ui/use-toast";

const Pricing = () => {
  const { toast } = useToast();
  const pawPath = "m12.189 5.376v.031c0 .624-.109 1.223-.308 1.779l.012-.037c-.209.576-.546 1.063-.98 1.442l-.004.003c-.421.379-.981.61-1.595.61-.016 0-.032 0-.048 0h.002c-.843-.006-1.605-.348-2.16-.899-.624-.574-1.114-1.282-1.427-2.079l-.013-.038c-.287-.698-.458-1.507-.469-2.355v-.004c0-.009 0-.02 0-.031 0-.624.109-1.223.308-1.779l-.012.037c.209-.576.546-1.063.98-1.442l.004-.003c.421-.379.982-.611 1.596-.611.018 0 .036 0 .054.001h-.003c.843.005 1.606.347 2.16.899.617.573 1.104 1.279 1.416 2.071l.013.038c.289.7.46 1.513.469 2.364v.003zm-5.345 7.548c.001.025.001.054.001.084 0 .782-.246 1.506-.665 2.1l.008-.012c-.393.561-1.037.924-1.765.924-.033 0-.066-.001-.099-.002h.005c-.853-.011-1.628-.338-2.214-.87l.003.003c-1.264-1.089-2.073-2.677-2.117-4.454v-.008c-.001-.024-.001-.053-.001-.082 0-.785.246-1.513.665-2.11l-.008.012c.391-.566 1.036-.932 1.767-.932.032 0 .065.001.097.002h-.005c.853.011 1.628.338 2.214.87l-.003-.003c1.266 1.095 2.074 2.689 2.117 4.473v.007zm6.161-.422c1.521.087 2.896.646 3.998 1.531l-.014-.011c1.419 1.013 2.608 2.242 3.547 3.652l.032.051c.824 1.103 1.351 2.471 1.439 3.957l.001.02c.001.026.002.057.002.087 0 .404-.099.786-.274 1.121l.006-.013c-.172.311-.432.554-.748.699l-.01.004c-.291.139-.63.248-.984.309l-.024.003c-.336.055-.722.086-1.116.086-.025 0-.05 0-.075 0h.004c-1.074-.074-2.071-.326-2.988-.726l.058.023c-.835-.37-1.804-.621-2.82-.701l-.031-.002c-1.103.082-2.125.33-3.075.719l.067-.024c-.921.377-1.989.626-3.105.694l-.028.001q-2.866.002-2.866-2.279c.048-1.109.367-2.134.892-3.022l-.017.03c.617-1.149 1.341-2.138 2.184-3.012l-.004.004c.845-.881 1.808-1.639 2.868-2.249l.062-.033c.859-.54 1.893-.877 3.003-.921h.012zm3.735-3.297c-.014 0-.03 0-.046 0-.614 0-1.174-.232-1.597-.612l.002.002c-.438-.383-.776-.869-.976-1.422l-.008-.024c-.188-.519-.297-1.118-.297-1.742 0-.011 0-.022 0-.033v.002c.009-.855.18-1.667.485-2.411l-.016.044c.326-.831.812-1.536 1.426-2.106l.004-.003c.554-.551 1.317-.893 2.159-.898h.001.046c.614 0 1.174.232 1.597.612l-.002-.002c.438.383.776.869.976 1.422l.008.024c.191.522.301 1.125.301 1.753v.02-.001c-.01.852-.182 1.662-.485 2.403l.016-.044c-.326.835-.816 1.543-1.436 2.113l-.004.004c-.555.549-1.317.891-2.159.896h-.001zm6.75-1.624c.028-.001.06-.002.092-.002.731 0 1.376.366 1.762.925l.005.007c.411.586.657 1.313.657 2.099 0 .029 0 .057-.001.086v-.004c-.044 1.785-.853 3.373-2.109 4.454l-.008.007c-.583.529-1.358.856-2.209.867h-.002c-.028.001-.061.002-.094.002-.728 0-1.372-.362-1.76-.917l-.005-.007c-.411-.582-.657-1.307-.657-2.088 0-.029 0-.059.001-.088v.004c.043-1.791.851-3.385 2.109-4.474l.008-.007c.583-.527 1.356-.854 2.205-.865h.002z";

  const [glowIntensity, setGlowIntensity] = useState(0.08);
  const [gradientIntensity, setGradientIntensity] = useState(0.02);
  const [patternOpacity, setPatternOpacity] = useState(0.03);
  const [patternSize, setPatternSize] = useState(40);
  const [patternSpacing, setPatternSpacing] = useState(120);
  const [patternColor, setPatternColor] = useState("#E7D9D5");
  const [glowColor, setGlowColor] = useState("#FC6E83");
  const [animDuration, setAnimDuration] = useState(30);
  const [patternRotation, setPatternRotation] = useState(0);
  const [patternDriftX, setPatternDriftX] = useState(-100);
  const [patternDriftY, setPatternDriftY] = useState(-100);
  const [glowX, setGlowX] = useState(90);
  const [glowY, setGlowY] = useState(10);

  const getPawPattern = (color: string, opacity: number, size: number, rotation: number) => {
    const encodedColor = encodeURIComponent(color);
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 -1 26 26'%3E%3Cpath d='${pawPath}' fill='${encodedColor}' fill-opacity='${opacity}' transform='rotate(${rotation}, 13, 12) scale(${size/26})' transform-origin='center'/%3E%3C/svg%3E")`;
  };

  const handleCopyConfig = () => {
    const config = {
      glowIntensity, gradientIntensity, patternOpacity, patternSize, patternSpacing,
      patternColor, glowColor, animDuration, patternRotation, patternDriftX, patternDriftY,
      glowX, glowY
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast({ title: "CONFIG COPIED", description: "Paste it into the chat." });
  };

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
                radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 60%),
                linear-gradient(135deg, ${patternColor}${Math.floor(gradientIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 100%),
                #332D3B
              `
            }}
          >
            <div 
              className="absolute inset-0 z-0 animate-pattern-drift pointer-events-none"
              style={{ 
                backgroundImage: getPawPattern(patternColor, 1, patternSize, patternRotation),
                backgroundSize: `${patternSpacing}px ${patternSpacing}px`,
                opacity: patternOpacity,
                ['--pattern-drift-x' as any]: `${patternDriftX}px`,
                ['--pattern-drift-y' as any]: `${patternDriftY}px`,
                ['--pattern-drift-speed' as any]: `${animDuration}s`
              }}
            />

            <div className="absolute top-0 right-0 z-10">
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

        <div className="mt-8 p-6 bg-surface border-3 border-muted grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-4 z-20 shadow-brutal max-w-6xl w-full">
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Glow Color</span>
            <input type="color" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} className="w-full h-8 bg-transparent border-none cursor-pointer" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Glow X/Y</span>
            <div className="flex gap-2">
              <input type="range" min="0" max="100" value={glowX} onChange={(e) => setGlowX(Number(e.target.value))} className="accent-active w-1/2" />
              <input type="range" min="0" max="100" value={glowY} onChange={(e) => setGlowY(Number(e.target.value))} className="accent-active w-1/2" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Pattern Color</span>
            <input type="color" value={patternColor} onChange={(e) => setPatternColor(e.target.value)} className="w-full h-8 bg-transparent border-none cursor-pointer" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Pattern Opac.</span>
            <input type="range" min="0" max="0.2" step="0.01" value={patternOpacity} onChange={(e) => setPatternOpacity(Number(e.target.value))} className="accent-active" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Paw Size</span>
            <input type="range" min="1" max="100" step="1" value={patternSize} onChange={(e) => setPatternSize(Number(e.target.value))} className="accent-active" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Spacing</span>
            <input type="range" min="20" max="300" step="1" value={patternSpacing} onChange={(e) => setPatternSpacing(Number(e.target.value))} className="accent-active" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Speed</span>
            <input type="range" min="1" max="120" step="1" value={animDuration} onChange={(e) => setAnimDuration(Number(e.target.value))} className="accent-active" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Angle</span>
            <input type="range" min="0" max="360" step="1" value={patternRotation} onChange={(e) => setPatternRotation(Number(e.target.value))} className="accent-active" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Drift X/Y</span>
            <div className="flex gap-2">
              <input type="range" min="-300" max="300" value={patternDriftX} onChange={(e) => setPatternDriftX(Number(e.target.value))} className="accent-active w-1/2" />
              <input type="range" min="-300" max="300" value={patternDriftY} onChange={(e) => setPatternDriftY(Number(e.target.value))} className="accent-active w-1/2" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Actions</span>
            <button 
              onClick={handleCopyConfig}
              className="bg-active text-surface font-ui text-[10px] py-2 px-3 hover:bg-reading flex items-center justify-center gap-2"
            >
              <Copy className="w-3 h-3" />
              COPY CONFIG
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
