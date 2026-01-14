import { ReactNode, useEffect } from "react";

import Header from "./Header";
import FloatingLinks from "./FloatingLinks";
import GridBackground from "./GridBackground";
import NoiseOverlay from "./NoiseOverlay";

interface PageLayoutProps {
  children: ReactNode;
  showContentOnly?: boolean;
  isCentered?: boolean;
  disableScroll?: boolean;
  fullWidth?: boolean;
}


const PageLayout = ({ 
  children, 
  showContentOnly = false, 
  isCentered = true, 
  disableScroll = false,
  fullWidth = false
}: PageLayoutProps) => {
  const mainPadding = showContentOnly ? 'pt-8 pb-8' : 'pt-24 pb-32';
  const contentScale = showContentOnly ? 'scale-100' : 'scale-90';
  const contentWidth = showContentOnly ? 'max-w-md' : 'max-w-4xl';

  useEffect(() => {
    if (!disableScroll) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [disableScroll]);


  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-background">
      <GridBackground />
      <NoiseOverlay />
      
      {!showContentOnly && <Header />}
      
      <main className={`flex-1 relative z-10 scrollbar-none ${fullWidth ? '' : mainPadding} ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto'} ${isCentered && !fullWidth ? 'flex flex-col items-center justify-center' : ''}`}>
        {fullWidth ? (
          children
        ) : (
          <div className={`w-full ${contentWidth} mx-auto px-6 ${contentScale} ${isCentered ? 'origin-center' : 'origin-top'}`}>
            {children}
          </div>
        )}
      </main>

      {!showContentOnly && <FloatingLinks />}
    </div>
  );
};

export default PageLayout;
