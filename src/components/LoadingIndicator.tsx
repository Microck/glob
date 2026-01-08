import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LoadingIndicatorProps {
  text?: string;
  subText?: string;
  showCat?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingIndicator = ({ 
  text = 'LOADING...', 
  subText,
  showCat = true,
  size = 'md'
}: LoadingIndicatorProps) => {
  const catRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!catRef.current || !showCat) return;

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
  }, [showCat]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, []);

  const sizeClasses = {
    sm: {
      container: 'p-4',
      cat: 'w-16 h-16',
      text: 'text-sm',
      subText: 'text-xs'
    },
    md: {
      container: 'p-6',
      cat: 'w-24 h-24',
      text: 'text-base',
      subText: 'text-sm'
    },
    lg: {
      container: 'p-8',
      cat: 'w-32 h-32',
      text: 'text-lg',
      subText: 'text-sm'
    }
  };

  const styles = sizeClasses[size];

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center justify-center text-center ${styles.container}`}
    >
      {showCat && (
        <div className="mb-4">
          <img 
            ref={catRef}
            src="/loading.svg" 
            alt="Loading" 
            className={`${styles.cat}`}
            style={{ 
              filter: 'invert(56%) sepia(52%) saturate(2071%) hue-rotate(314deg) brightness(100%) contrast(97%)',
              transformOrigin: 'bottom center'
            }}
          />
        </div>
      )}
      <p className={`font-ui text-reading ${styles.text}`}>{text}</p>
      {subText && (
        <p className={`font-ui text-muted ${styles.subText} mt-1`}>{subText}</p>
      )}
    </div>
  );
};

export default LoadingIndicator;
