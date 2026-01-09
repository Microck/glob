import { useState, useEffect } from 'react';
import TypewriterText from './TypewriterText';

interface DebugConsoleProps {
  isVisible: boolean;
  currentMessage: string;
  progress: number;
  settings: any;
  stats?: any;
}

const DebugConsole = ({ isVisible, currentMessage, progress, settings, stats }: DebugConsoleProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-4 left-4 z-50 bg-surface/95 border-3 border-active p-4 w-80 font-mono text-xs text-reading shadow-brutal pointer-events-none">
      <div className="mb-4 border-b-2 border-muted pb-2">
        <TypewriterText text="DEBUG_CONSOLE_V1.0" className="font-ui text-sm text-active" />
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-muted mb-1">STATUS</div>
          <div className="flex justify-between">
            <span>{currentMessage}</span>
            <span className="text-active">{progress}%</span>
          </div>
          <div className="w-full bg-muted h-1 mt-1">
            <div 
              className="h-full bg-active transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="text-muted mb-1">SETTINGS</div>
          <pre className="text-[10px] opacity-80 overflow-hidden">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>

        {stats && (
          <div>
            <div className="text-muted mb-1">STATS</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted">Original:</span>
                <div>{(stats.originalSize / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <div>
                <span className="text-muted">Polys:</span>
                <div>{stats.originalPolygons?.toLocaleString() || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t-2 border-muted text-[10px] text-muted">
          MEMORY: {Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0)}MB
        </div>
      </div>
    </div>
  );
};

export default DebugConsole;
