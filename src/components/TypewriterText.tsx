import { useState, useEffect } from 'react';

export const TypewriterText = ({ text, className = '' }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let currentText = '';
    let index = 0;
    
    // Reset immediately when text changes
    setDisplayText('');
    
    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setDisplayText(currentText);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [text]);
  
  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse inline-block w-[0.5em] h-[1em] bg-current align-text-bottom ml-1 opacity-50" />
    </span>
  );
};

export default TypewriterText;
