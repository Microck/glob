import { useState, useEffect, useCallback } from 'react';

interface ScrambleTextProps {
  text: string;
  isActive: boolean;
  className?: string;
  onComplete?: () => void;
}

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const ScrambleText = ({ text, isActive, className = '', onComplete }: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  
  const scramble = useCallback(() => {
    if (!isActive) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const maxIterations = text.length;
    
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );
      
      iteration += 1/3;
      
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        onComplete?.();
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [text, isActive, onComplete]);

  useEffect(() => {
    const cleanup = scramble();
    return cleanup;
  }, [scramble]);

  return <span className={className}>{displayText}</span>;
};

export default ScrambleText;
