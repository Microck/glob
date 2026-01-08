import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import TypewriterText from './TypewriterText';

interface ProgressBarProps {
  progress: number;
  message: string;
}

const ProgressBar = ({ progress, message }: ProgressBarProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLImageElement>(null);
  
  const isComplete = message === 'COMPLETE' && progress === 100;

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
    if (!catRef.current) return;

    gsap.set(catRef.current, { rotation: 0 });

    const tl = gsap.to(catRef.current, {
      rotation: 10,
      duration: 1.2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      transformOrigin: 'bottom center'
    });

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (isComplete && catRef.current) {
      gsap.killTweensOf(catRef.current);
      gsap.to(catRef.current, { rotation: 0, duration: 0.5, ease: 'back.out(1.7)' });
    }
  }, [isComplete]);

  const totalChars = 20;
  const filledCount = Math.floor((displayProgress / 100) * totalChars);
  const emptyCount = totalChars - filledCount;
  const bar = '[' + '|'.repeat(filledCount) + '.'.repeat(emptyCount) + ']';

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
        <TypewriterText text={message} />
      </div>
    </div>
  );
};

export default ProgressBar;
