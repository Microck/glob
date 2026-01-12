import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Settings, Zap, Info, Plus, Minus } from 'lucide-react';
import gsap from 'gsap';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ControlsProps {
  decimation: number;
  dracoLevel: number;
  onDecimationChange: (value: number) => void;
  onDracoChange: (value: number) => void;
  onCompress: () => void;
  isProcessing: boolean;
  hasFile: boolean;
  
  mode: 'simple' | 'advanced';
  onModeChange: (mode: 'simple' | 'advanced') => void;
  simpleTarget: 'size' | 'polygons';
  onSimpleTargetChange: (target: 'size' | 'polygons') => void;
  
  desiredSize: number;
  onDesiredSizeChange: (value: number) => void;
  desiredPolygons: number;
  onDesiredPolygonsChange: (value: number) => void;
  
  originalSize: number;
  originalPolygons: number;

  weld: boolean;
  onWeldChange: (value: boolean) => void;
  quantize: boolean;
  onQuantizeChange: (value: boolean) => void;
  draco: boolean;
  onDracoChangeToggle: (value: boolean) => void;
  textureQuality: number;
  onTextureQualityChange: (value: number) => void;
}

const NumberInput = ({ 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  label 
}: { 
  value: number, 
  onChange: (v: number) => void, 
  min: number, 
  max: number, 
  step?: number,
  label?: string
}) => {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const clampValue = useCallback((raw: number) => {
    const rounded = step >= 1000 ? Math.round(raw / step) * step : raw;
    return Math.max(min, Math.min(max, rounded));
  }, [max, min, step]);

  const handleIncrement = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = Number(value) || 0;
    const next = Number((current + step).toFixed(2));
    onChange(Math.min(max, next));
  };

  const handleDecrement = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = Number(value) || 0;
    const next = Number((current - step).toFixed(2));
    onChange(Math.max(min, next));
  };

  const commitValue = useCallback(() => {
    const parsed = parseFloat(inputValue);
    if (Number.isNaN(parsed)) {
      setInputValue(String(value));
      return;
    }
    const nextValue = clampValue(parsed);
    onChange(nextValue);
  }, [clampValue, inputValue, onChange, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInputValue(next);
    const parsed = parseFloat(next);
    if (!Number.isNaN(parsed)) {
      onChange(clampValue(parsed));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <Label className="font-ui text-xs text-muted uppercase tracking-wider">{label}</Label>}
      <div className="flex border-3 border-muted bg-surface overflow-hidden">
        <button 
          type="button"
          onPointerDown={handleDecrement}
          className="px-4 py-2 hover:bg-active hover:text-surface transition-none border-r-3 border-muted active:translate-y-0.5 select-none pointer-events-auto"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={inputValue}
          onBlur={commitValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitValue();
              (e.target as HTMLInputElement).blur();
            }
          }}
          onChange={handleInputChange}
          className="flex-1 min-w-0 bg-transparent text-center font-mono text-reading outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button 
          type="button"
          onPointerDown={handleIncrement}
          className="px-4 py-2 hover:bg-active hover:text-surface transition-none border-l-3 border-muted active:translate-y-0.5 select-none pointer-events-auto"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Controls = ({ 
  decimation, 
  dracoLevel, 
  onDecimationChange, 
  onDracoChange, 
  onCompress,
  isProcessing,
  hasFile,
  mode,
  onModeChange,
  simpleTarget,
  onSimpleTargetChange,
  desiredSize,
  onDesiredSizeChange,
  desiredPolygons,
  onDesiredPolygonsChange,
  originalSize,
  originalPolygons,
  weld,
  onWeldChange,
  quantize,
  onQuantizeChange,
  draco,
  onDracoChangeToggle,
  textureQuality,
  onTextureQualityChange
}: ControlsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [displayMode, setDisplayMode] = useState(mode);
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.8, ease: 'expo.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (mode !== displayMode && !isTransitioning.current) {
      isTransitioning.current = true;
      
      const tl = gsap.timeline({
        onComplete: () => {
          isTransitioning.current = false;
        }
      });
      
      tl.to(contentRef.current, {
        opacity: 0,
        y: 10, 
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
          setDisplayMode(mode);
          gsap.set(contentRef.current, { y: -10 });
        }
      })
      .to(panelRef.current, {
        height: 'auto',
        duration: 0.3,
        ease: 'power3.inOut'
      })
      .to(contentRef.current, {
        opacity: 1,
        y: 0, 
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  }, [mode, displayMode]);

  const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-0 border-3 border-t-0 border-muted bg-surface">
      <div className="flex border-b-3 border-muted">
        <button
          onClick={() => onModeChange('simple')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-ui text-sm transition-colors ${
            mode === 'simple' ? 'bg-active text-surface' : 'bg-surface text-muted hover:text-active'
          }`}
        >
          <Zap className="w-4 h-4" />
          SIMPLE
        </button>
        <div className="w-[3px] bg-muted" />
        <button
          onClick={() => onModeChange('advanced')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-ui text-sm transition-colors ${
            mode === 'advanced' ? 'bg-active text-surface' : 'bg-surface text-muted hover:text-active'
          }`}
        >
          <Settings className="w-4 h-4" />
          ADVANCED
        </button>
      </div>

      <div ref={panelRef} className="overflow-hidden">
        <div ref={contentRef}>
          {displayMode === 'simple' ? (
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="font-ui text-xs text-muted uppercase tracking-wider">Optimization Target</span>
                <RadioGroup 
                  value={simpleTarget} 
                  onValueChange={(v) => onSimpleTargetChange(v as 'size' | 'polygons')}
                  className="flex gap-4"
                >
                  <div className={`flex-1 border-3 border-muted p-3 cursor-pointer hover:border-active transition-colors ${simpleTarget === 'size' ? 'bg-active/10 border-active' : ''}`}>
                    <RadioGroupItem value="size" id="target-size" className="sr-only" />
                    <Label htmlFor="target-size" className="cursor-pointer block w-full">
                      <div className="font-display text-lg text-reading mb-1">SIZE</div>
                      <div className="font-ui text-[10px] text-muted leading-tight">Aggressive compression for smallest file size.</div>
                    </Label>
                  </div>
                  
                  <div className={`flex-1 border-3 border-muted p-3 cursor-pointer hover:border-active transition-colors ${simpleTarget === 'polygons' ? 'bg-active/10 border-active' : ''}`}>
                    <RadioGroupItem value="polygons" id="target-poly" className="sr-only" />
                    <Label htmlFor="target-poly" className="cursor-pointer block w-full">
                      <div className="font-display text-lg text-reading mb-1">POLYGONS</div>
                      <div className="font-ui text-[10px] text-muted leading-tight">Reduce geometric complexity.</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                {simpleTarget === 'size' ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-mono text-[10px] text-muted uppercase">Original: {originalSizeMB} MB</span>
                    </div>
                    <NumberInput 
                      label="Desired Size (MB)"
                      value={desiredSize}
                      onChange={onDesiredSizeChange}
                      min={0.01}
                      max={Number(originalSizeMB)}
                      step={1}
                    />
                    <div className="font-ui text-[9px] text-muted uppercase mt-2 tracking-tighter">Approximate. Aggressive texture compression applied.</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-mono text-[10px] text-muted uppercase">Original: {originalPolygons.toLocaleString()}</span>
                    </div>
                    <NumberInput 
                      label="Desired Polygons"
                      value={desiredPolygons}
                      onChange={onDesiredPolygonsChange}
                      min={1}
                      max={originalPolygons}
                      step={1000}
                    />
                    <div className="font-ui text-[9px] text-muted uppercase mt-2 tracking-tighter">Approximate decimation target.</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Label className="font-ui text-xs text-muted uppercase tracking-wider">Decimation Ratio</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-surface border-3 border-muted text-reading font-ui text-[10px] p-3 max-w-[200px] rounded-none shadow-brutal z-50">
                          The target percentage of polygons to retain. Lower values result in fewer faces.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-mono text-sm text-active">{Math.round(decimation * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={decimation}
                  onChange={(e) => onDecimationChange(Number(e.target.value))}
                  className="w-full h-1 bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-active"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label className="font-ui text-xs text-muted uppercase tracking-wider">Draco Level</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-surface border-3 border-muted text-reading font-ui text-[10px] p-3 max-w-[200px] rounded-none shadow-brutal z-50">
                          Compression intensity level (1-10). Higher values reduce file size but increase decoding time.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-mono text-sm text-active">{dracoLevel}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={dracoLevel}
                  onChange={(e) => onDracoChange(Number(e.target.value))}
                  className="w-full h-1 bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-active"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label className="font-ui text-xs text-muted uppercase tracking-wider">Texture Max Size</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-surface border-3 border-muted text-reading font-ui text-[10px] p-3 max-w-[200px] rounded-none shadow-brutal">
                        Forces all textures to fit within these dimensions. Significantly impacts file size.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                  <Select 
                    value={textureQuality.toString()} 
                    onValueChange={(v) => onTextureQualityChange(Number(v))}
                  >
                    <SelectTrigger className="w-full bg-surface border-3 border-muted rounded-none font-mono text-xs focus:ring-0 focus:border-active h-10">
                      <SelectValue placeholder="Resolution" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-3 border-muted rounded-none">
                      {[256, 512, 1024, 2048, 4096].map(size => (
                        <SelectItem key={size} value={size.toString()} className="font-mono text-xs focus:bg-active focus:text-surface rounded-none">
                          {size}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-5 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="weld-toggle" className="font-ui text-xs text-reading uppercase cursor-pointer tracking-wider">Weld Vertices</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-surface border-3 border-muted text-reading font-ui text-[10px] p-3 max-w-[200px] rounded-none shadow-brutal z-50">
                          Merges equivalent vertices to reduce index count.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch id="weld-toggle" checked={weld} onCheckedChange={onWeldChange} className="data-[state=checked]:bg-active" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quantize-toggle" className="font-ui text-xs text-reading uppercase cursor-pointer tracking-wider">Quantize</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-surface border-3 border-muted text-reading font-ui text-[10px] p-3 max-w-[200px] rounded-none shadow-brutal z-50">
                          Reduces precision of vertex attributes to save space.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch id="quantize-toggle" checked={quantize} onCheckedChange={onQuantizeChange} className="data-[state=checked]:bg-active" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="draco-toggle" className="font-ui text-xs text-reading uppercase cursor-pointer tracking-wider">Draco Compression</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-surface border-3 border-muted text-reading font-ui text-[10px] p-3 max-w-[200px] rounded-none shadow-brutal z-50">
                          High-performance mesh compression by Google.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch id="draco-toggle" checked={draco} onCheckedChange={onDracoChangeToggle} className="data-[state=checked]:bg-active" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={onCompress}
        disabled={!hasFile || isProcessing}
        className={`
          w-full font-display text-2xl py-5 border-t-3 border-muted
          ${hasFile && !isProcessing 
            ? 'bg-surface text-reading hover:bg-active hover:text-surface hover:border-active' 
            : 'bg-surface/50 text-muted cursor-not-allowed'
          }
        `}
        style={{ transition: 'none' }}
      >
        {isProcessing ? 'PROCESSING...' : 'COMPRESS'}
      </button>
    </div>
  );
};

export default Controls;
