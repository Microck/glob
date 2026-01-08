import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface ProgressBarProps {
  progress: number;
  message: string;
}

const ProgressBar = ({ progress, message }: ProgressBarProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (!catRef.current || message === 'COMPLETE') return;

    const tl = gsap.timeline({ repeat: -1 });
    
    tl.to(catRef.current, {
      rotation: -9,
      duration: 0.6,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center'
    })
    .to(catRef.current, {
      rotation: 4,
      duration: 0.6,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center'
    })
    .to(catRef.current, {
      rotation: -7,
      duration: 0.5,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center'
    })
    .to(catRef.current, {
      rotation: 3,
      duration: 0.5,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center'
    })
    .to(catRef.current, {
      rotation: -9,
      duration: 0.4,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center'
    });

    return () => {
      tl.kill();
    };
  }, [message]);

  const totalChars = 20;
  const filledCount = Math.floor((displayProgress / 100) * totalChars);
  const emptyCount = totalChars - filledCount;
  const bar = '[' + '|'.repeat(filledCount) + '.'.repeat(emptyCount) + ']';

  const isComplete = message === 'COMPLETE' && progress === 100;

  return (
    <div 
      ref={containerRef}
      className="w-48 h-48 border-3 border-muted bg-surface flex flex-col items-center justify-center mx-auto"
    >
      <div className="mb-2">
        <img 
          ref={catRef}
          src={isComplete ? "/finished.svg" : "/loading.svg"}
          alt={isComplete ? "Complete" : "Loading"}
          style={{ 
            width: '95px',
            height: '110px',
            transform: 'translate(0px, 0px) scale(1.10)',
            filter: isComplete ? 'none' : 'invert(56%) sepia(52%) saturate(2071%) hue-rotate(314deg) brightness(100%) contrast(97%)',
            transformOrigin: 'bottom center'
          }}
        />
      </div>
      <div className="font-ui text-xs text-active whitespace-nowrap">
        {bar} {displayProgress}%
      </div>
      <div className="font-ui text-xs text-muted mt-1 truncate max-w-[90%]">
        {message}
      </div>
    </div>
  );
};

export default ProgressBar;
