import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const FlickerLabel = ({ text, className = '' }: { text: string; className?: string }) => {
  const labelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!labelRef.current) return;
    
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 5 });
    
    tl.to(labelRef.current, { opacity: 0.7, duration: 0.1 })
      .to(labelRef.current, { opacity: 1, duration: 0.1 })
      .to(labelRef.current, { opacity: 0.8, duration: 0.05 })
      .to(labelRef.current, { opacity: 1, duration: 0.1 });
    
    return () => { tl.kill(); };
  }, []);
  
  return <div ref={labelRef} className={className}>{text}</div>;
};

export default FlickerLabel;
